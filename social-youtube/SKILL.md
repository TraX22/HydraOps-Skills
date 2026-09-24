---
name: social-youtube
description: Plan and write YouTube content - titles, descriptions, chapters, thumbnail text, tags, long-form video outlines and Shorts scripts - plus competitor analysis from transcripts. Use when the user wants a YouTube video idea, script, title, description, thumbnail concept, Shorts script, or to analyze or repurpose a YouTube video.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: [web_search, fetch_url, youtube_transcript]
---

# YouTube

YouTube is a search engine and a recommendation feed at once. A video wins when the title
and thumbnail earn the click and the first 30 seconds prove the click was right. Viewers
satisfied (watch time, returning, not bouncing) is what the system rewards.

## Current facts (as of September 2026 - re-check with `web_search` if a number matters)

- Title: up to **100 characters**; keep the key words in the first ~50-60 because feeds
  and mobile truncate.
- Description: up to **5,000 characters**; roughly the first 100-150 show before
  "more", so lead with the value and main keywords.
- Chapters: timestamps in the description, first one `00:00`, at least **3**, each at
  least **10 seconds**, ascending order (YouTube Help, "Video Chapters").
- Custom thumbnail: 1280x720 (16:9) recommended, commonly a **2 MB** file limit.
- Shorts: videos up to **3 minutes** with a square or vertical aspect ratio are
  classified as Shorts (for uploads since 15 Oct 2024). Use 16:9 to keep something
  long-form. Most library songs can be used for up to ~90 seconds in a Short (some tracks
  only 30-60 s).

## Audience and what performs

- Viewers come with intent (how-to, reviews, explainers, entertainment, deep dives).
- Performs: a clear promise delivered fast, strong retention, a recognizable format or
  series, a face or a distinct voice, specific titles ("I tested 5 budget mics under
  $50" beats "Microphone review").
- Does not: slow intros, "Hey guys, welcome back" openings, clickbait that the video
  does not pay off, vague titles.

## Research first

1. `web_search` the topic (`site:youtube.com <topic>`) to see what exists; note titles,
   angles and gaps.
2. Use `youtube_transcript` on 2-3 top videos to learn what they cover, how fast they get
   to the point, and what viewers ask about. Do not copy their script.
3. Pick an angle: better (more complete/current), different (contrarian, specific
   audience), or first (new topic).

## Titles

- Promise a specific outcome, curiosity gap or stake. Include the searchable phrase
  naturally.
- Patterns: "How I <result> in <time>", "<Number> <things> that <outcome>", "I tried
  <X> for <time>", "<X> vs <Y>: which one <decision>", "Why <surprising claim>".
- Title and thumbnail should complement each other, not repeat the same words.
- Give 3-5 options and say which you recommend and why.

## Thumbnail text

- 0-4 words, large, high contrast; readable on a phone.
- One focal point (face with clear emotion, product, before/after).
- Avoid bottom-right corner (duration overlay).
- Do not repeat the title; add the emotional or visual beat ("It broke.", "$37", "Day 30").

## Description

1. First 1-2 lines: what the viewer gets, with the main keyword.
2. Short summary paragraph (2-4 sentences).
3. Chapters.
4. Links mentioned (only real URLs the user provides or you opened), affiliate
   disclosures if any.
5. 2-3 hashtags at most (the first three may appear above the title).

## Long-form script outline

1. **Hook (0-30 s)**: state the promise or show the result, raise a question, tell them
   what they will get. No channel intro.
2. **Context (30-60 s)**: why this matters, credibility in one line.
3. **Body in chapters**: each chapter opens with a mini-hook, delivers one point with
   visuals/examples, and closes with a transition that creates the next question.
4. **Re-hooks** every 1-2 minutes: preview what's next, a pattern interrupt, a twist.
5. **Payoff**: deliver the result promised in the title.
6. **End**: one CTA (next video, subscribe) and end screen; do not trail off.

## Shorts script

- 0-2 s: hook on screen and in voice (bold claim, result first, question).
- One idea only; cut every pause.
- Loop-friendly ending that flows back into the start, or a punchline.
- On-screen text for sound-off viewers.
- Link the related long video; Shorts are discovery for the channel.

## Tags and keywords

- Tags matter little; add a few for common misspellings and the core phrase.
- Keywords belong in the title, the first description lines, chapter titles and the
  spoken script (YouTube transcribes audio).

## Cadence

- A realistic, steady schedule beats bursts: e.g. one long video every 1-2 weeks, plus
  2-4 Shorts per week cut from it. Series help viewers return.

## Repurposing

- Long video -> 3-5 Shorts (best moments), an X thread of key points, a LinkedIn post
  with the lesson, an Instagram carousel of the steps, a blog post from the transcript.
- From a blog post -> talking-head explainer or screen-recorded tutorial.

## Avoid

- Clickbait that the content does not deliver (hurts retention and trust).
- Misleading thumbnails, fake reactions, reused content without transformation.
- Keyword-stuffed descriptions and tag lists.
- Invented statistics or links.

## Output

Use [templates/video-package.md](templates/video-package.md) for a full video package or
the Shorts section alone for short-form.
