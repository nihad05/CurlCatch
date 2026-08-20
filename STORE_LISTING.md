# Chrome Web Store — CurlCatch listing copy

Paste each block into the matching field in the Developer Dashboard. The **Description** field is
plain text (Markdown does not render), so it's written to look good as plain text.

---

## Short summary (max 132 chars)

Capture a page's API calls, copy any request as cURL for Postman, and replay it right from your browser.

---

## Category

Developer Tools

---

## Description (paste into "Description")

Ever needed to grab an API call a website made — to debug it, retest it, or drop it into Postman — and ended up rebuilding the whole request by hand? Copying the URL, hunting down every header, recreating the body, re-adding your auth cookies? CurlCatch removes that busywork entirely.

CurlCatch records the network requests a page makes and lets you turn any one of them into a ready-to-use cURL command, or replay it on the spot to see the response — without leaving your browser.

WHY YOU'LL WANT IT

• Send any request to Postman in one click. Copy a clean, single-line cURL command with every header included, paste it into Postman's URL bar, and it auto-parses. No manual rebuilding.

• Test an API without leaving the page. Replay any captured request and instantly see the status code, timing, and a pretty-printed response body — perfect for quickly checking an endpoint.

• Logged-in requests just work. Your browser's cookies (including HttpOnly session cookies) attach automatically and CORS is bypassed, so authenticated calls replay correctly instead of failing with 401s.

• Write better bug reports in seconds. Hand a developer the exact cURL that reproduces the problem, instead of a vague description.

• See the calls that matter. The list shows API calls (XHR/Fetch) by default so you're not drowning in images and scripts — one checkbox reveals everything when you need it.

BUILT FOR QA AND DEVELOPERS

If you test APIs, debug frontends, or live in Postman, CurlCatch turns "figure out what request the page sent and recreate it" into a two-click job.

PRIVATE BY DESIGN

CurlCatch runs entirely on your machine — no account, no analytics, no tracking — and sends your requests and data to no one. Capturing is opt-in: nothing is recorded until you click Start capturing, and Chrome's standard "being debugged" banner appears only while a tab is actively capturing.

HOW IT WORKS

1. Click the CurlCatch toolbar icon.
2. Click Start capturing, then reload the page to capture the calls it makes.
3. For any request, choose Copy cURL to send it to Postman, or Test request to replay it and inspect the response.
4. Stop capturing or close the popup to detach.

(Replaying a non-GET request runs a real request with real side effects, so CurlCatch asks you to confirm first.)

Install CurlCatch and stop rebuilding requests by hand.

---

## Single purpose (paste into "Single purpose" field)

CurlCatch records the network requests made by the user's current tab so a developer or QA tester can export them as cURL commands and replay them for testing. All processing happens locally in the browser.

---

## Permission justifications (paste into each permission's "Justification" box)

**debugger** — CurlCatch uses the chrome.debugger Network domain because it is the only Chrome API that exposes full request and response data (including bodies and all headers). This is required to build accurate cURL commands and to replay requests. The debugger attaches only when the user clicks Start capturing and detaches when they stop or close the popup.

**host permissions (<all_urls>)** — Testers and developers need to capture requests on whatever site they are working on, which cannot be known in advance. No captured data ever leaves the user's device.

**storage** — Used to remember the user's UI preferences locally (for example, the "show all resource types" toggle). Nothing is transmitted.

**clipboardWrite** — Used to copy the generated cURL command to the clipboard when the user clicks Copy cURL.

**Remote code:** No. CurlCatch executes no remotely hosted code; all logic ships in the package.

**Data usage disclosures:** CurlCatch does not collect or transmit any user data. In the data-practices form, check that you do NOT collect any of the listed data types, and affirm the three certification checkboxes (no selling data, no unrelated use, no creditworthiness use).
