# Playwright

A real (headless) browser the agent drives: open a page, read what is on it, click, type, fill in forms, take screenshots.

- Server: [@playwright/mcp](https://github.com/microsoft/playwright-mcp) `0.0.83`, started with `npx` (needs Node.js). It downloads a browser the first time.
- Runs headless with an in-memory profile (`--isolated`): no cookies or logins of yours, and nothing is kept between sessions.
- HydraOps's own local services (its API, the key proxy, a local model server) are blocked with `--blocked-origins`.

## What the tools do

- **Opening and reading pages** (`browser_navigate`, snapshots, screenshots, console and network) brings in third-party content and changes nothing: they run freely.
- **Interacting** (click, type, fill a form, press a key, upload a file, run JavaScript) acts on a site, so after the task has read outside content — which is the case as soon as it opens a page — those calls wait for your approval.
