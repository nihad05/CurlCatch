# Security Policy

## Reporting a vulnerability

CurlCatch reads network traffic on the active tab, so we take security seriously.

If you discover a security issue, **please do not open a public issue.** Instead, report it privately
using GitHub's [private vulnerability reporting](https://github.com/nihad05/CurlCatch/security/advisories/new).

Please include:

- A description of the issue and its impact.
- Steps to reproduce.
- The extension version (`manifest.json` → `version`) and your Chrome version.

We aim to acknowledge reports within a few days and will keep you updated on the fix.

## Scope

CurlCatch runs entirely locally and transmits no data (see [PRIVACY.md](PRIVACY.md)). The most
relevant concerns are around how captured request/response data is handled in-memory and how replay
is performed. Reports in those areas are especially welcome.

## Supported versions

The latest published version on the Chrome Web Store receives security fixes.
