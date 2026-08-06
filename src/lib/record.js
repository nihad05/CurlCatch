const FORBIDDEN_HEADERS = new Set([
  'accept-charset', 'accept-encoding', 'access-control-request-headers',
  'access-control-request-method', 'connection', 'content-length', 'cookie',
  'cookie2', 'date', 'dnt', 'expect', 'host', 'keep-alive', 'origin',
  'permissions-policy', 'referer', 'te', 'trailer', 'transfer-encoding',
  'upgrade', 'via', 'user-agent'
]);

const FORBIDDEN_PREFIXES = ['sec-', 'proxy-'];

export function isForbiddenHeader(name) {
  const lower = String(name).toLowerCase();
  if (FORBIDDEN_HEADERS.has(lower)) return true;
  return FORBIDDEN_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

export function updateRecord(rec, method, params) {
  const next = rec ? { ...rec } : { id: params.requestId };
  switch (method) {
    case 'Network.requestWillBeSent': {
      const request = params.request || {};
      next.url = request.url;
      next.method = request.method || 'GET';
      next.requestHeaders = { ...(request.headers || {}) };
      next.resourceType = params.type || next.resourceType || 'Other';
      if (request.postData !== undefined) next.postData = request.postData;
      next.hasPostData = Boolean(request.hasPostData || request.postData !== undefined);
      next.startedAt = params.wallTime || next.startedAt;
      break;
    }
    case 'Network.responseReceived': {
      const response = params.response || {};
      next.status = response.status;
      next.statusText = response.statusText;
      next.responseHeaders = { ...(response.headers || {}) };
      next.mimeType = response.mimeType;
      break;
    }
    case 'Network.loadingFinished':
      next.done = true;
      break;
    case 'Network.loadingFailed':
      next.done = true;
      next.failed = true;
      next.errorText = params.errorText;
      break;
    default:
      break;
  }
  return next;
}

export function isApiRequest(rec) {
  return rec.resourceType === 'XHR' || rec.resourceType === 'Fetch';
}

export function toFetchInit(rec) {
  const headers = {};
  for (const [key, value] of Object.entries(rec.requestHeaders || {})) {
    if (!isForbiddenHeader(key)) headers[key] = value;
  }
  const method = (rec.method || 'GET').toUpperCase();
  const init = { method, headers, credentials: 'include' };
  if (method !== 'GET' && method !== 'HEAD' && rec.postData != null) {
    init.body = rec.postData;
  }
  return init;
}
