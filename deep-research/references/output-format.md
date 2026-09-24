# Output format for research answers

Adapt headings to the request. Drop sections that would be empty. Write in the user's
language.

```markdown
## Answer

<2-5 sentences that directly answer the question, including the main caveat.>

## Key findings

- <Finding with the specific number/fact and its date.> (High) [Source title](url)
- <Finding.> (Medium) [Source A](url), [Source B](url)
- <Finding based on inference or a single weak source.> (Low, inferred from ...)

## Where sources disagree

- <Topic>: <Source A> says X (date); <Source B> says Y (date). Likely reason: <...>.

## Open questions / not verified

- <What you could not confirm and why (paywall, no primary source, page failed).>

## Method

Searched: <main queries or angles>. Opened: <n> pages. Assumed: <region/timeframe>.

## Sources

1. <Title> - <publisher>, <date> - <url>
2. ...
```

## Notes

- Keep citations next to the claims they support, not only at the end.
- Only list URLs you opened with `fetch_url` in this task or that the user provided.
- For comparisons, a table is fine, but every cell with a number needs a source and a
  date (put them in a footnote row if the table gets crowded).
- For a quick question, collapse to: answer paragraph + 2-3 bullet findings + sources.

## Example (short form)

> **Answer:** As of the vendor's pricing page (checked 2026-09-24), the Team plan costs
> 12 USD per user per month billed annually; the 2025 price of 10 USD quoted in several
> blogs is outdated.
>
> - Annual billing required for the 12 USD price; monthly is 15 USD. (High) [Pricing](https://example.com/pricing)
> - The free tier dropped SSO in March 2026. (Medium, one source) [Changelog](https://example.com/changelog)
>
> Sources: Pricing page (opened 2026-09-24); Changelog entry dated 2026-03-11.
