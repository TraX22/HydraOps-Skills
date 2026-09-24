# Writing for GitHub: issues, comments, release notes

Write in the language the repository uses (usually English), even if the user speaks to
you in another language, unless they say otherwise. Always show the draft before posting.

## Bug report

```markdown
**Title:** <Component>: <what fails> when <condition>

### What happens
<Observed behavior, with exact error message in a code block.>

### Expected
<What should happen.>

### Steps to reproduce
1. ...
2. ...

### Environment
- Version: <x.y.z or commit>
- OS / runtime: <...>

### Notes
<Logs, screenshots, workaround, suspected cause - clearly marked as a guess.>
```

Title tips: specific and searchable. "Export to CSV drops rows with commas in names" beats
"CSV bug".

## Feature request

```markdown
**Title:** <Verb> <capability> for <user/situation>

### Problem
<What the user cannot do today and why it matters. One concrete scenario.>

### Proposal
<Smallest change that solves it.>

### Alternatives considered
<Other approaches and why not.>
```

## Comments

- Lead with the point. One comment, one topic.
- Quote the line you respond to when a thread is long.
- For reviews: "Blocking:" / "Nit:" / "Question:" prefixes make intent clear.
- No filler ("Great question!", "Hope this helps!"). Be kind and direct.
- When closing or declining, say why and what would change the decision.

## Release notes

Audience: users first, then contributors. Group by impact, not by commit order.

```markdown
## Highlights
- <User-facing change in plain language, what it enables.>
- <...>

## Fixes
- <Symptom that is now fixed> (#123)

## Breaking changes
- <What changed, who is affected, how to migrate.>

## Other
- <Dependencies, internal changes worth mentioning.>
```

Rules:
- Build notes from merged PRs and commits between tags (`github_api` GET
  `/repos/{o}/{r}/compare/{prev_tag}...{new_tag}`), not from memory.
- Describe effects, not implementation ("Search is 3x faster on large vaults", not
  "Refactor indexer").
- Credit external contributors by handle.
- Never invent PR numbers; only reference numbers you saw.
