import { updateRecord, toFetchInit } from './lib/record.js';

const tabRecords = new Map();

function getTabMap(tabId) {
  let map = tabRecords.get(tabId);
  if (!map) {
    map = new Map();
    tabRecords.set(tabId, map);
  }
  return map;
}

async function persistTab(tabId) {
  const map = tabRecords.get(tabId);
  const records = map ? [...map.values()] : [];
  await chrome.storage.session.set({ [`records_${tabId}`]: records });
}

async function backfillPostData(tabId, requestId) {
  const map = tabRecords.get(tabId);
  const rec = map && map.get(requestId);
  if (!rec || !rec.hasPostData || rec.postData != null) return;
  try {
    const result = await chrome.debugger.sendCommand(
      { tabId },
      'Network.getRequestPostData',
      { requestId }
    );
    if (result && result.postData != null) {
      map.set(requestId, { ...rec, postData: result.postData });
      await persistTab(tabId);
    }
  } catch (err) {
    void err;
  }
}

chrome.debugger.onEvent.addListener(async (source, method, params) => {
  const tabId = source.tabId;
  if (tabId == null) return;
  if (!method.startsWith('Network.')) return;
  if (!params || params.requestId == null) return;

  const map = getTabMap(tabId);
  const requestId = params.requestId;
  const updated = updateRecord(map.get(requestId), method, params);
  map.set(requestId, updated);
  await persistTab(tabId);

  if (method === 'Network.requestWillBeSent') {
    await backfillPostData(tabId, requestId);
  }
});

chrome.debugger.onDetach.addListener((source) => {
  const tabId = source.tabId;
  if (tabId == null) return;
  chrome.storage.session.set({ [`capturing_${tabId}`]: false });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabRecords.delete(tabId);
  chrome.storage.session.remove([`records_${tabId}`, `capturing_${tabId}`]);
});

async function startCapture(tabId) {
  try {
    await chrome.debugger.attach({ tabId }, '1.3');
  } catch (err) {
    void err;
  }
  await chrome.debugger.sendCommand({ tabId }, 'Network.enable', {});
  await chrome.storage.session.set({ [`capturing_${tabId}`]: true });
  return { ok: true };
}

async function stopCapture(tabId) {
  try {
    await chrome.debugger.detach({ tabId });
  } catch (err) {
    void err;
  }
  await chrome.storage.session.set({ [`capturing_${tabId}`]: false });
  return { ok: true };
}

async function clearTab(tabId) {
  const map = tabRecords.get(tabId);
  if (map) map.clear();
  await chrome.storage.session.remove(`records_${tabId}`);
  return { ok: true };
}

async function reloadTab(tabId) {
  await chrome.tabs.reload(tabId);
  return { ok: true };
}

async function replay(record) {
  const init = toFetchInit(record);
  const start = performance.now();
  try {
    const res = await fetch(record.url, init);
    const body = await res.text();
    const headers = {};
    res.headers.forEach((value, key) => {
      headers[key] = value;
    });
    const timeMs = performance.now() - start;
    return {
      ok: true,
      status: res.status,
      statusText: res.statusText,
      timeMs,
      body,
      headers
    };
  } catch (err) {
    const timeMs = performance.now() - start;
    return { ok: false, error: String(err.message || err), timeMs };
  }
}

async function handleMessage(message) {
  switch (message && message.type) {
    case 'START_CAPTURE':
      return startCapture(message.tabId);
    case 'STOP_CAPTURE':
      return stopCapture(message.tabId);
    case 'CLEAR':
      return clearTab(message.tabId);
    case 'RELOAD':
      return reloadTab(message.tabId);
    case 'REPLAY':
      return replay(message.record);
    default:
      return { ok: false, error: 'unknown' };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse);
  return true;
});
