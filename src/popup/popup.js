import { buildCurl } from '../lib/curl.js';
import { isApiRequest } from '../lib/record.js';

const els = {
  toggle: document.getElementById('toggle'),
  reload: document.getElementById('reload'),
  reloadHint: document.getElementById('reloadHint'),
  clear: document.getElementById('clear'),
  apiOnly: document.getElementById('apiOnly'),
  methodFilter: document.getElementById('methodFilter'),
  notice: document.getElementById('notice'),
  list: document.getElementById('list'),
  empty: document.getElementById('empty'),
  toast: document.getElementById('toast')
};

let tabId = null;
let records = [];
let capturing = false;
let toastTimer = null;
const openResponses = new Map();

async function send(message) {
  const response = await chrome.runtime.sendMessage(message);
  if (response && response.ok === false && response.error) {
    throw new Error(response.error);
  }
  return response;
}

function showNotice(text) {
  els.notice.textContent = text;
  els.notice.hidden = false;
}

function clearNotice() {
  els.notice.hidden = true;
}

function showToast(text) {
  els.toast.textContent = text;
  els.toast.hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 2500);
}

function recordsKey() {
  return `records_${tabId}`;
}

function capturingKey() {
  return `capturing_${tabId}`;
}

async function loadState() {
  const data = await chrome.storage.session.get([recordsKey(), capturingKey()]);
  records = Array.isArray(data[recordsKey()]) ? data[recordsKey()] : [];
  capturing = Boolean(data[capturingKey()]);
}

function statusClass(rec) {
  if (rec.failed) return 'status-5xx';
  const code = rec.status;
  if (typeof code !== 'number') return 'status-pending';
  if (code >= 200 && code < 300) return 'status-2xx';
  if (code >= 300 && code < 400) return 'status-3xx';
  if (code >= 400 && code < 500) return 'status-4xx';
  if (code >= 500) return 'status-5xx';
  return 'status-pending';
}

function statusText(rec) {
  if (rec.failed) return 'ERR';
  if (typeof rec.status !== 'number') return rec.done ? '—' : '…';
  return String(rec.status);
}

function metaClass(status) {
  if (typeof status !== 'number') return 'status-pending';
  if (status >= 200 && status < 300) return 'status-2xx';
  if (status >= 300 && status < 400) return 'status-3xx';
  if (status >= 400) return 'status-5xx';
  return 'status-pending';
}

function prettyBody(body) {
  if (body == null) return '';
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch (err) {
    void err;
    return String(body);
  }
}

function buildResponsePanel(result) {
  const panel = document.createElement('div');
  panel.className = 'response';

  const head = document.createElement('div');
  head.className = 'response-head';

  const meta = document.createElement('span');
  meta.className = 'response-meta';

  const body = document.createElement('pre');
  body.className = 'response-body';

  if (result.ok) {
    meta.classList.add(metaClass(result.status));
    meta.textContent = `${result.status} ${result.statusText || ''} · ${Math.round(result.timeMs)} ms`.trim();
    body.textContent = prettyBody(result.body);
  } else {
    meta.classList.add('err');
    meta.textContent = `Error · ${Math.round(result.timeMs || 0)} ms`;
    body.textContent = result.error || 'Request failed.';
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'response-close';
  close.textContent = 'Close';
  close.addEventListener('click', () => {
    openResponses.delete(result.recordId);
    render();
  });

  head.append(meta, close);
  panel.append(head, body);
  return panel;
}

async function onCopy(rec) {
  try {
    await navigator.clipboard.writeText(buildCurl(rec));
    showToast('Copied — paste into Postman’s URL bar.');
  } catch (err) {
    showToast(`Copy failed: ${err.message || err}`);
  }
}

async function onTest(rec, button) {
  const method = (rec.method || 'GET').toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') {
    if (!confirm('This will really send the request. Continue?')) return;
  }
  button.disabled = true;
  const previous = button.textContent;
  button.textContent = 'Testing…';
  try {
    const result = await chrome.runtime.sendMessage({ type: 'REPLAY', record: rec });
    openResponses.set(rec.id, { ...result, recordId: rec.id });
    render();
  } catch (err) {
    openResponses.set(rec.id, { ok: false, error: String(err.message || err), recordId: rec.id });
    render();
  } finally {
    button.disabled = false;
    button.textContent = previous;
  }
}

function methodClass(method) {
  const m = (method || 'GET').toLowerCase();
  const known = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];
  return `m-${known.includes(m) ? m : 'other'}`;
}

function buildRow(rec) {
  const li = document.createElement('li');
  li.className = 'row';

  const head = document.createElement('div');
  head.className = 'row-head';

  const badge = document.createElement('span');
  badge.className = `badge ${methodClass(rec.method)}`;
  badge.textContent = (rec.method || 'GET').toUpperCase();

  const url = document.createElement('span');
  url.className = 'url';
  url.textContent = rec.url || '';
  url.title = rec.url || '';

  const status = document.createElement('span');
  status.className = `status ${statusClass(rec)}`;
  status.textContent = statusText(rec);

  head.append(badge, url, status);

  const actions = document.createElement('div');
  actions.className = 'row-actions';

  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'btn';
  copyBtn.textContent = 'Copy cURL';
  copyBtn.addEventListener('click', () => onCopy(rec));

  const testBtn = document.createElement('button');
  testBtn.type = 'button';
  testBtn.className = 'btn';
  testBtn.textContent = 'Test';
  testBtn.addEventListener('click', () => onTest(rec, testBtn));

  actions.append(copyBtn, testBtn);
  li.append(head, actions);

  const response = openResponses.get(rec.id);
  if (response) li.append(buildResponsePanel(response));

  return li;
}

function recordMethod(rec) {
  return (rec.method || 'GET').toUpperCase();
}

function updateMethodOptions() {
  const methods = [...new Set(records.map(recordMethod))].sort();
  const current = els.methodFilter.value;
  const options = ['ALL', ...methods];
  els.methodFilter.replaceChildren(
    ...options.map((value) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value === 'ALL' ? 'All' : value;
      return opt;
    })
  );
  els.methodFilter.value = options.includes(current) ? current : 'ALL';
}

function visibleRecords() {
  let visible = records;
  if (els.apiOnly.checked) visible = visible.filter(isApiRequest);
  const method = els.methodFilter.value;
  if (method && method !== 'ALL') {
    visible = visible.filter((rec) => recordMethod(rec) === method);
  }
  return visible;
}

function renderControls() {
  els.toggle.textContent = capturing ? 'Stop' : 'Start capturing';
  els.toggle.classList.toggle('capturing', capturing);
  els.reload.hidden = !capturing;
  els.reloadHint.hidden = !capturing;
}

function render() {
  renderControls();
  updateMethodOptions();
  const visible = visibleRecords();
  els.list.replaceChildren(...visible.map(buildRow));
  els.empty.hidden = visible.length > 0;
}

async function refresh() {
  await loadState();
  render();
}

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || tab.id == null) {
    showNotice('No active tab to inspect.');
    return;
  }
  tabId = tab.id;

  els.toggle.addEventListener('click', async () => {
    clearNotice();
    els.toggle.disabled = true;
    try {
      await send({ type: capturing ? 'STOP_CAPTURE' : 'START_CAPTURE', tabId });
      await refresh();
    } catch (err) {
      showNotice(`This page can’t be inspected: ${err.message || err}`);
    } finally {
      els.toggle.disabled = false;
    }
  });

  els.reload.addEventListener('click', async () => {
    clearNotice();
    try {
      await send({ type: 'RELOAD', tabId });
    } catch (err) {
      showNotice(`Reload failed: ${err.message || err}`);
    }
  });

  els.clear.addEventListener('click', async () => {
    clearNotice();
    try {
      openResponses.clear();
      await send({ type: 'CLEAR', tabId });
      await refresh();
    } catch (err) {
      showNotice(`Clear failed: ${err.message || err}`);
    }
  });

  els.apiOnly.addEventListener('change', render);
  els.methodFilter.addEventListener('change', render);

  chrome.storage.session.onChanged.addListener((changes) => {
    if (changes[recordsKey()] || changes[capturingKey()]) {
      refresh();
    }
  });

  try {
    await refresh();
  } catch (err) {
    showNotice(`This page can’t be inspected: ${err.message || err}`);
  }
}

init();
