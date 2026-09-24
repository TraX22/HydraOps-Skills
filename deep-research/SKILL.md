---
name: deep-research
description: Multi-step web research that plans sub-questions, reads primary sources in full, cross-checks claims and reports findings with confidence levels and only verified citations. Use when the user asks for research, a comparison, a market or technical investigation, "find out whether...", or any answer that needs more than one search to be trustworthy.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: [web_search, fetch_url, brave_search]
---

# Deep research

The goal is a report the user can act on and check. Every claim must trace back to a
page you actually opened. A short honest answer beats a long confident one built on
search snippets.

## Hard rules

1. **Cite only URLs you opened with `fetch_url`** (or that the user gave you) in this task.
   A search result title and snippet is not a source; it is a lead.
2. **Never build a URL by pattern.** Do not guess `site.com/reports/2026/...` or fill in a
   template like `similarweb.com/app/<id>`. If you need a page, find it through search or
   links on a page you opened. If you could not open it, do not link it.
3. **Never present snippet-only or remembered facts as verified.** If you rely on memory
   or a snippet, label it ("unverified", "from search snippet only").
4. **Dates matter.** Record the publish or update date of every source. Your training data
   has a cutoff; for anything that changes (prices, versions, rankings, laws, people in
   roles, platform rules), assume your memory is stale and look it up.
5. **Do not skip tools because you "already know".** If the user asked for research, do
   the research, even when you expect the answer.

## Workflow

### 1. Frame the question

- Restate the question in one sentence. Identify: scope (region, time range, audience),
  the decision it feeds, and what "done" looks like.
- If a missing detail would change the answer materially (country, budget, version,
  timeframe), ask once, briefly. Otherwise state your assumption and proceed.

### 2. Plan sub-questions

Break the question into 3-7 sub-questions that can each be answered by a source. Example
for "Should we move our docs from GitBook to Docusaurus?":

- What does each cost today for our team size?
- Feature gaps that matter to us (versioning, i18n, search, MDX)?
- Migration effort and tooling reported by people who did it?
- Hosting, SEO and lock-in implications?

Write the plan down (briefly) before searching. It keeps the search honest.

### 3. Search broad, then narrow

- Start with 2-3 broad queries per sub-question using different wording. Use both
  `web_search` and `brave_search` when available; they return different results.
- Then narrow: add the official domain, a year, a version number, `site:` operators,
  exact phrases in quotes, or the local language for regional topics.
- Prefer, in order: primary sources (official docs, filings, specs, papers, changelogs,
  datasets, the original announcement) > reputable reporting that cites primaries >
  expert blogs > aggregators, listicles and SEO content farms.
- Budget: stop searching a sub-question when two independent good sources agree, or
  after ~5 queries without progress (then report the gap).

### 4. Open and read

- Open the most promising 1-3 results per sub-question with `fetch_url`. Read the
  relevant section, not just the first paragraph.
- Extract: the exact claim, the number with its unit and date, who says it, and the
  URL. Keep short quotes for key facts.
- If a page cites a primary source, open the primary and check that it says what the
  secondary claims. Secondaries often round, drop caveats or misquote.
- If a page fails to load or is paywalled, say so; try another source rather than
  reconstructing its content.

### 5. Cross-check

For each important claim, ask:

- Do at least two **independent** sources agree? (Two articles quoting the same press
  release count as one.)
- Is the source in a position to know? Is it selling something?
- Is it current? Check the date against the claim's volatility.
- Does anything contradict it? Search explicitly for the opposite
  ("X criticism", "X does not", "X vs", "X problems").

See [references/source-evaluation.md](references/source-evaluation.md) for a quick
credibility checklist and common traps.

### 6. Assign confidence

- **High**: primary source or two independent reliable sources, recent, consistent.
- **Medium**: one reliable source, or several that partly disagree on details.
- **Low**: single weak source, old data, snippet only, or your inference.

Disagreements are findings, not noise. Report them with both sides and why they differ
(different dates, definitions, regions, methodology).

### 7. Write the report

Use the structure in [references/output-format.md](references/output-format.md).
In short:

1. **Answer first**: 2-5 sentences that directly answer the question.
2. **Key findings**: bullets, each with confidence and inline citation.
3. **Disagreements and open questions.**
4. **Method**: what you searched and what you could not verify.
5. **Sources**: only URLs opened, with title and date.

Match depth to the request: a quick question gets a short answer with 2-3 sources; a
"deep dive" gets the full structure.

## Checklist before sending

- [ ] Every link in the answer was opened in this task (or supplied by the user).
- [ ] No URL was assembled by hand.
- [ ] Every number has a date and a source.
- [ ] Volatile facts were checked, not recalled.
- [ ] Contradictions are reported, not silently resolved.
- [ ] Confidence is stated for the main conclusions.
- [ ] Assumptions (region, timeframe) are stated.
- [ ] The first paragraph answers the question.

## Common failure modes

- Answering from the conversation history or memory and adding links "for support".
- Treating one aggregator that copies another as two sources.
- Mixing data from different years or regions in one comparison table.
- Quoting a vendor's own benchmark as neutral evidence.
- Burying the answer under methodology.
- Padding with generic background the user did not ask for.
