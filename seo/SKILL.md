---
name: seo
description: On-page SEO audit and optimization for a live URL or a draft - search intent, title and meta description, headings, keyword research without paid tools, internal links, structured data, Core Web Vitals notes and content quality - ending in a prioritized fix list. Use when the user asks to audit, optimize or "improve the SEO" of a page, post or landing page, or wants keywords or titles for search.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: [fetch_url, web_search]
---

# SEO audit and optimization

Output is always a **prioritized fix list** with concrete rewrites, not a lecture on SEO.
You cannot see the site's Search Console, analytics or rendering engine; say so and focus
on what the page itself and the live search results show.

## Inputs

- A URL: open it with `fetch_url`. Also try `<origin>/robots.txt` and `<origin>/sitemap.xml`
  if indexing is in question (only report them if they actually loaded).
- A draft: work from the text; ask for the target URL/slug if links or canonicals matter.
- Ask once, if unknown and it matters: target country/language, primary audience, and the
  one action the page should drive. Otherwise state assumptions.

## Workflow

### 1. Determine the target query and intent

- Identify 1 primary query and 3-8 secondary/related queries the page should rank for.
- Classify intent: informational (learn), commercial (compare), transactional (buy/sign
  up), navigational (find a brand).
- **Check the live results**: `web_search` the primary query (in the target language and,
  if possible, region). Note what ranks: format (guide, list, tool, product page, video),
  depth, freshness, and who ranks (brands, forums, publishers). The page must match the
  dominant format, or the intent is wrong and no tweak will fix it.

Keyword research without paid tools: see
[references/keyword-research.md](references/keyword-research.md).

### 2. Audit the page

Work through [references/audit-checklist.md](references/audit-checklist.md). The
essentials:

| Element | What good looks like |
|---|---|
| Title tag | Unique, primary query near the front, clear benefit, roughly 50-60 characters so it is not truncated; brand at the end if space |
| Meta description | 1-2 sentences, roughly 140-160 characters, matches intent, gives a reason to click; not a ranking factor but affects clicks |
| H1 | One, says what the page is, close to the title (not necessarily identical) |
| Headings H2/H3 | Logical outline; answer the sub-questions searchers have; no keyword stuffing |
| Opening | Answers the query or states the value in the first 2-3 sentences |
| Body | Covers the topic better than what ranks: specifics, examples, data, first-hand experience |
| URL slug | Short, readable, lowercase, hyphens; do not change existing URLs without a 301 redirect |
| Images | Descriptive file names and alt text; compressed; width/height set |
| Internal links | Links in from related pages and out to relevant pages with descriptive anchor text |
| External links | To credible sources where claims need support |
| Structured data | JSON-LD matching visible content (Article, Product, FAQ where eligible, HowTo, Organization, BreadcrumbList, LocalBusiness...) |
| Indexing | Not `noindex` by mistake; canonical points to itself (or to the right master); in the sitemap |
| Mobile & speed | See Core Web Vitals notes below |

### 3. Content quality

Ask the questions a quality rater would:

- Does it show first-hand experience or expertise (who wrote it, why trust them)?
- Is there something here that the top results lack (data, examples, a tool, a clearer
  answer, a more recent update)?
- Is it written for people first? Remove filler intros, repeated keyword variants and
  generic paragraphs.
- Is the date shown and honest? Updating a date without updating content is a bad signal.
- Would a reader leave satisfied, or go back to search?

### 4. Core Web Vitals notes

You usually cannot measure from here. Give notes, not scores:

- Thresholds for "good" (as of September 2026, verify with `web_search` if it matters):
  LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1, at the 75th percentile of real users.
- Point the user to PageSpeed Insights or Search Console for field data.
- From the HTML you can still flag likely issues: huge hero images without dimensions,
  render-blocking scripts in `<head>`, many third-party tags, web fonts without
  `font-display`, lazy-loading the LCP image, layout shifts from late-injected banners.

### 5. Prioritize and write the fix list

Rank each fix by impact x effort:

- **P1** - blocks ranking or clicks: wrong intent, `noindex`/canonical errors, missing or
  duplicate title/H1, thin content vs competitors, broken key links.
- **P2** - meaningful gains: title/meta rewrite, missing sections searchers need,
  internal links, structured data, image alt text, obvious speed issues.
- **P3** - polish: slug tweaks (only on new pages), minor heading wording, extra FAQ.

## Output format

```markdown
**Target:** <primary query> (<intent>, <country/language>)
**What ranks now:** <1-2 lines on the dominant format and competitors>

### Fixes
| # | Priority | Issue | Fix | Effort |
|---|---|---|---|---|
| 1 | P1 | ... | ... | S/M/L |

### Rewrites
- Title: "<new title>" (<n> chars)
- Meta description: "<new description>" (<n> chars)
- H1: "<new H1>"
- Suggested outline: H2 ... / H2 ...

### Structured data (if relevant)
<JSON-LD snippet matching visible content>

### Not checked
<what needs Search Console, PageSpeed or a crawl>
```

## Do not

- Promise rankings or traffic numbers.
- Recommend keyword stuffing, hidden text, doorway pages, buying links, or mass
  AI-generated pages; these violate search engine spam policies.
- Add structured data for content not visible on the page.
- Recommend changing ranking URLs without redirects.
- Invent search volumes. Without a data tool, describe demand qualitatively and say how
  you judged it.
