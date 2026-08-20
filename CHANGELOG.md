# Changelog

All notable changes to CurlCatch are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Apache-2.0 license, privacy policy, security policy, and contribution guide.
- GitHub Actions CI running the unit tests.

## [0.1.0] — 2026-07-28

### Added
- Record a page's network traffic (request and response bodies via `chrome.debugger`).
- List defaults to API calls (XHR/Fetch), with a checkbox to reveal all resource types.
- **Copy cURL** — single-line cURL command with all headers, ready to paste into Postman.
- **Test request** — replay a captured request and view status, timing, and a pretty-printed body.
- Authenticated replay: cookies attach from the browser and CORS is bypassed.
- Unit tests for the pure logic (`src/lib/record.js`, `src/lib/curl.js`).

[Unreleased]: https://github.com/nihad05/CurlCatch/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/nihad05/CurlCatch/releases/tag/v0.1.0
