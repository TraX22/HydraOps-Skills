# On-page audit checklist

Mark each item OK / Issue / Not checked. Only report what you actually saw in the fetched
HTML or text.

## Indexing and URL

- [ ] Page returns content (not an error, login wall or empty JS shell).
- [ ] No `<meta name="robots" content="noindex">` unless intended.
- [ ] `<link rel="canonical">` present and pointing to the preferred URL.
- [ ] `hreflang` tags consistent if the site has language versions.
- [ ] URL is readable; no session IDs or tracking parameters in canonical.
- [ ] robots.txt does not block the page (if checked).
- [ ] Page is in the XML sitemap (if checked).

## Head

- [ ] `<title>` unique, specific, primary query early, not truncated (~50-60 chars).
- [ ] Meta description present, specific, ~140-160 chars, matches intent.
- [ ] `<html lang>` set correctly.
- [ ] Viewport meta tag present.
- [ ] Open Graph / social card tags (og:title, og:description, og:image) for sharing.

## Content structure

- [ ] Exactly one H1, describing the page.
- [ ] H2/H3 form a logical outline; skim-reading headings tells the story.
- [ ] First screen answers the query or states the value.
- [ ] Covers the sub-questions found in research (search results, forums).
- [ ] Contains specifics: numbers, examples, steps, screenshots, first-hand notes.
- [ ] Author and date visible where it matters (news, advice, reviews).
- [ ] No large duplicated blocks from other pages.
- [ ] Clear next step (CTA) that matches intent.

## Links

- [ ] Descriptive anchor text (not "click here").
- [ ] Links to 2-5 relevant internal pages; suggest which pages should link here.
- [ ] External links to credible sources for claims.
- [ ] No obviously broken links among those checked.

## Media

- [ ] Images have meaningful alt text (describe, do not stuff keywords).
- [ ] Images have width/height or aspect-ratio to prevent layout shift.
- [ ] Modern formats (WebP/AVIF) and reasonable sizes.
- [ ] The main (LCP) image is not lazy-loaded.

## Structured data

- [ ] JSON-LD type matches the page (Article, Product, LocalBusiness, BreadcrumbList,
      Organization, Event, Recipe, FAQPage/HowTo only where still eligible - check).
- [ ] All values match visible content.
- [ ] Suggest validating with the Rich Results Test / Schema.org validator.

## Performance hints from HTML

- [ ] Few render-blocking scripts in `<head>` (use `defer`/`async`).
- [ ] Third-party tags count reasonable.
- [ ] Fonts preloaded or `font-display: swap`.
- [ ] No huge inline base64 assets.

## Example JSON-LD (Article)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to repot a monstera without killing it",
  "datePublished": "2026-03-02",
  "dateModified": "2026-09-10",
  "author": { "@type": "Person", "name": "Ana Ruiz" },
  "image": "https://example.com/img/monstera-repot.webp"
}
```
