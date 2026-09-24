# Pull request review checklist

Review what the PR changes, not the whole codebase. Be specific: file, line (or hunk),
problem, suggested fix.

## Gather

- PR title, description, linked issues (`github_get_pull`).
- Changed files with patches (`github_api` GET `/repos/{o}/{r}/pulls/{n}/files`).
- Full content of files where the patch lacks context (`github_get_file` with `ref` =
  head SHA from the PR).
- Existing review comments, to avoid repeating them (`/pulls/{n}/comments`, `/reviews`).
- CI results (`/commits/{head_sha}/check-runs`).

## Check

**Intent**
- Does the change do what the description says? Anything unrelated mixed in?
- Is the scope reasonable, or should it be split?

**Correctness**
- Edge cases: empty input, null/undefined, large input, concurrency, time zones, unicode.
- Error handling: errors surfaced or silently swallowed? Fallbacks that hide failures?
- Off-by-one, wrong comparison, inverted condition, stale variable.
- Async: missing await, unhandled promise, race between reads and writes.

**Security**
- User input reaching SQL, shell, file paths, HTML, URLs, deserialization.
- Secrets or tokens in code, logs or tests.
- AuthZ checks on new endpoints; widened permissions.
- New dependencies: maintained? needed? license compatible?

**Compatibility**
- Public API, config, database schema or file format changes; migration provided?
- Breaking changes called out in the description/changelog?

**Tests**
- New behavior covered? Tests that would fail without the change?
- Tests deleted or weakened?

**Readability**
- Names, dead code, duplicated logic, comments that no longer match the code.
- Keep style nits few and marked as optional.

## Report format

```markdown
**Summary:** <what the PR does in 1-2 sentences>

**Blocking**
1. `src/foo.ts` L42-48: <problem>. Suggest: <fix>.

**Suggestions (non-blocking)**
- `src/bar.ts` L10: <...>

**Questions**
- <things you could not determine from the diff>

**CI:** <passing / failing checks and which>

**Verdict:** approve / request changes / comment only
```

State what you did not review (e.g. "did not run the code; generated files skipped").
Do not claim you tested anything you only read.
