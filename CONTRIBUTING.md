# Contributing to CurlCatch

Thanks for your interest in improving CurlCatch! Contributions of all kinds are welcome — bug
reports, feature ideas, docs, and code.

## Getting started

1. **Fork and clone** the repository.
2. **Load the extension** in Chrome:
   - Open `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked** and select the project root.
3. **Run the tests** — the pure logic (`src/lib/`) is covered by Node's built-in test runner:

   ```
   npm test
   ```

## Making changes

- Keep pull requests focused — one logical change per PR.
- Add or update tests for anything in `src/lib/` (this is the unit-tested core).
- Match the existing code style. The codebase favors **self-documenting code** — clear names and
  small functions over comments.
- Update the `README.md` and `CHANGELOG.md` when behavior or features change.

## Reporting bugs / requesting features

Use the issue templates:

- **Bug report** — what you expected, what happened, and steps to reproduce.
- **Feature request** — the problem you're trying to solve, not just a proposed solution.

## Security issues

Please **do not** file security problems as public issues — see [SECURITY.md](SECURITY.md).

## License

By contributing, you agree that your contributions will be licensed under the
[Apache License 2.0](LICENSE).
