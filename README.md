# CurlCatch

CurlCatch is a Manifest V3 Chrome extension for QA testers and developers. Record a page, see the API calls it made, then **Copy cURL** to paste into Postman or **Test request** to replay it and inspect the response — right from the toolbar.

## Features

- Record a page's network traffic, including request and response bodies (via the `chrome.debugger` Network domain).
- List defaults to API calls (XHR/Fetch); a checkbox reveals all resource types.
- **Copy cURL** — a single-line cURL command with all headers, ready to paste into Postman's URL bar.
- **Test request** — replay a request from the browser and view status, timing, and a pretty-printed body.
- Authenticated replay: cookies (including HttpOnly session cookies) attach from the browser, and CORS is bypassed.

## Install (load unpacked)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked**.
4. Select the `qa` folder (this project's root).

## Usage

1. Click the CurlCatch toolbar icon to open the popup.
2. Click **Start capturing** to attach the debugger to the current tab.
3. Click **Reload page** to capture the API calls the page makes on load.
4. Watch the calls appear in the list (API calls by default; check the box to show all resource types).
5. For any request:
   - **Copy cURL** — copies a single-line cURL command; paste it into Postman's URL bar and it auto-parses.
   - **Test request** — replays the request and shows the response status, time, and body. Non-GET requests ask for confirmation first, because a replayed POST has real side-effects.

Stop capturing or close the popup to detach.

## Notes

- **Debugger banner.** Capture uses `chrome.debugger`, so Chrome shows a "…is being debugged" banner on any tab that is actively capturing. The extension starts detached — the banner only appears after you click **Start capturing**, and disappears when you stop or close.
- **Replay vs. cURL export.** On **Test request**, `fetch` forbids scripts from setting certain headers (`Cookie`, `Origin`, `Referer`, `User-Agent`, `Host`, `Content-Length`, `sec-*`, `proxy-*`); these are stripped and cookies come from the browser's jar instead, so authenticated calls still replay. This means replay is not byte-perfect at the header level. **Copy cURL is unaffected** — the exported command keeps all headers. Byte-perfect header replay is planned for v2.

## Development

Pure logic (`src/lib/record.js`, `src/lib/curl.js`) is unit-tested with Node's built-in test runner:

```
npm test
```
