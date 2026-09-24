# Keyword research without paid tools

You do not have search volume data. You can still find what people search and how
competitive it looks. Be explicit in the output that demand is judged qualitatively.

## Sources of real queries

1. **Search engine autocomplete and "related searches"** - run `web_search` on the seed
   term and on variants (`<seed> for`, `<seed> vs`, `how to <seed>`, `best <seed>`,
   `<seed> <year>`). Collect the phrasings that recur in titles and related terms.
2. **"People also ask" style questions** - search the seed as a question; note the
   questions the results answer. These become H2s or FAQ entries.
3. **Forums and communities** - `web_search` with `site:reddit.com`, `site:stackoverflow.com`,
   niche forums, or local-language forums. Read how people phrase the problem; that
   phrasing often differs from industry jargon.
4. **Competitor pages** - open the top 3-5 results with `fetch_url`; list their H2s, the
   terms they all use, and what none of them cover (your gap).
5. **The user's own data** - ask whether they have Search Console queries; those beat any
   guess.
6. **Free public tools** (suggest, do not claim to have run them): Google Trends for
   relative interest over time and by region; Search Console for existing impressions.

## Judging difficulty from the results page

| Signal in the top 10 | Reading |
|---|---|
| Big brands, government, Wikipedia everywhere | Hard; target a narrower long-tail variant |
| Forums, Q&A threads, thin listicles ranking | Opening: searchers are underserved |
| Results do not match the query well | Opening, if you can answer it precisely |
| All results are one format (videos, tools, products) | Match that format or pick another query |
| Many results updated this year | Freshness matters; plan to maintain the page |

## Building the keyword set

- **Primary**: the query that best matches the page's purpose and intent.
- **Secondary**: close variants and sub-topics that the same page should answer.
- **Separate pages**: queries with a different intent (e.g. "what is X" vs "X pricing")
  deserve their own page. Do not merge intents to "cover more keywords".
- **Language and region**: research in the target language, not by translating English
  keywords. Spelling and vocabulary vary by country.

## Output

```markdown
| Query | Intent | Evidence of demand | Difficulty read | Use as |
|---|---|---|---|---|
| ... | informational | autocomplete + 3 forum threads | forums rank -> opening | primary |
```
