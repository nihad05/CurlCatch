function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

export function buildCurl(rec) {
  const method = (rec.method || 'GET').toUpperCase();
  const parts = ['curl'];
  if (method !== 'GET') parts.push('-X', method);
  parts.push(shellQuote(rec.url));
  for (const [key, value] of Object.entries(rec.requestHeaders || {})) {
    parts.push('-H', shellQuote(`${key}: ${value}`));
  }
  if (rec.postData != null && method !== 'GET' && method !== 'HEAD') {
    parts.push('--data-raw', shellQuote(rec.postData));
  }
  return parts.join(' ');
}
