---
name: social-tiktok
description: Write TikTok short-video scripts with a hook in the first 1-2 seconds, on-screen text, captions, hashtags and posting plan, plus trend adaptation and repurposing. Use when the user wants a TikTok video idea, script, caption or hashtags, a content plan for TikTok, or to turn other content into TikToks.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: [web_search, fetch_url]
---

# TikTok

TikTok shows each video to a test audience regardless of follower count and expands it
if people watch, rewatch, comment, share and save. The first second decides whether any
of that happens. Write for a thumb that is already moving.

## Current facts (as of September 2026 - re-check with `web_search` if a number matters)

- Video length: up to **10 minutes** recorded in-app; uploads up to **60 minutes** for
  eligible accounts. Short videos (roughly 15-60 s) remain the default for reach; longer
  videos work when retention holds.
- Caption: up to **4,000 characters** (most sources; a few still cite 2,200). The feed
  shows roughly the first 100-150 characters.
- Vertical 9:16, 1080x1920 is the standard.
- Captions and on-screen text are indexed for TikTok search, which many users use like a
  search engine.

## Audience and what performs

- Broad and young-skewing but increasingly all ages; strong niches ("BookTok",
  "FoodTok", "CleanTok", tech tips, small business, education).
- Performs: native-feeling, lo-fi, face to camera, fast pacing, clear payoff, trends
  adapted to the niche, series ("Part 2"), useful tips people save, stories with tension.
- Does not: polished ads that look like ads, slow intros, logos first, horizontal video,
  reposts with other platforms' watermarks.

## Script structure (15-60 s)

1. **Hook, 0-2 s**: visual + spoken + on-screen text at once. Start mid-action or with
   the result.
   - "Stop doing <common thing> - do this instead."
   - "I spent $<n> so you don't have to."
   - "3 apps that feel illegal to know about." (only if they truly are that useful)
   - Show the finished result first, then "here's how".
2. **Promise / tension, 2-5 s**: why keep watching.
3. **Body**: one idea, fast cuts every 1-3 s, each beat adds something. No filler.
4. **Payoff**: deliver what the hook promised.
5. **End**: loop back to the first frame, a punchline, or a reason to comment ("Which
   one would you pick?") or follow ("Part 2 tomorrow").

## On-screen text

- Hook text in the first frame, large, inside safe zones (avoid the bottom ~20% and right
  edge where UI sits).
- Short phrases, synced to speech; many viewers watch muted.
- Auto-captions on for accessibility; fix errors.

## Caption

- First line extends the hook or adds context; include the key search words naturally.
- Optional question to invite comments.
- 3-5 relevant hashtags: 1-2 niche, 1-2 topic, maybe 1 broad. Skip #fyp-style tags;
  they add nothing.

## Trends and sounds

- `web_search` for current trends in the niche ("TikTok trends <niche> <month year>");
  trends move in days, so never rely on memory.
- Adapt the format to the user's message; do not copy the content.
- Commercial accounts must use the Commercial Music Library; flag this for business
  users.

## Cadence

- Frequent is fine on TikTok: 3-7 posts a week is a common range for growing accounts;
  consistency matters more than the exact number.
- Test multiple hooks for the same idea across posts; the hook is the variable that
  matters most.
- Reply to comments with video replies; they are cheap, native content.

## Repurposing

- To Instagram Reels and YouTube Shorts: re-export without the TikTok watermark, adjust
  caption and hashtags per platform.
- From long-form (YouTube, podcasts, blog): pull single insights, each becomes one video.
- From X threads: each point becomes a video in a series.

## Avoid

- Hooks that the video does not pay off (people swipe, and retention drops).
- Medical, financial or legal claims presented as fact without sources; misleading edits.
- Copyrighted music on business accounts.
- Engagement bait ("comment 'yes' for part 2" as the only content).
- Fake reviews, undisclosed paid promotion (use the branded content toggle).
- Publishing anything without the user's explicit approval.

## Output

Use [templates/short-video-script.md](templates/short-video-script.md). Provide 3 hook
variants and mark the recommended one.
