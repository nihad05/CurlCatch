# Privacy Policy — CurlCatch

_Last updated: 2026-08-06_

CurlCatch is a Chrome extension for QA testers and developers. This policy explains what the
extension does — and does not — do with your data.

## The short version

**CurlCatch collects nothing and sends nothing anywhere.** All processing happens locally in your
browser. There is no analytics, no tracking, no external server, and no account.

## What the extension accesses

- **Network requests on the active tab, only while you are capturing.** When you click
  **Start capturing**, CurlCatch attaches Chrome's `debugger` (Network domain) to the current tab to
  read request and response data so it can build cURL commands and replay requests. Capture is
  opt-in and starts detached; Chrome shows its standard "…is being debugged" banner while active.
  Capturing stops when you click Stop, switch off, or close the popup.
- **Local storage.** CurlCatch stores only your UI preferences on your own device using
  `chrome.storage`. This never leaves your browser.

## What we do NOT do

- We do **not** transmit your requests, responses, cookies, headers, or any captured data to us or
  any third party.
- We do **not** collect analytics, telemetry, or personal information.
- We do **not** use advertising or tracking of any kind.
- We do **not** sell or share data — because we never collect any.

## Permissions and why they are needed

- `debugger` — the only Chrome API that exposes request/response bodies, required for capture and
  cURL export.
- `<all_urls>` (host permissions) — so you can capture on whatever site you are testing. No captured
  data leaves your device.
- `storage` — to remember your UI preferences locally.
- `tabs` — to attach the debugger to the active tab.

## Open source

CurlCatch is open source. You can inspect exactly what it does at
<https://github.com/nihad05/CurlCatch>.

## Contact

Questions about this policy? Open an issue at
<https://github.com/nihad05/CurlCatch/issues>.
