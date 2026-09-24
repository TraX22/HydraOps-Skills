---
name: social-x
description: Write posts, threads and replies for X (formerly Twitter) - hooks, thread structure, reply strategy, link placement, hashtags, cadence and repurposing. Use when the user wants a tweet, an X post or thread, a reply, a launch announcement for X, or to adapt other content for X.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: [web_search, fetch_url]
---

# X (Twitter)

X rewards conversation and speed. Posts that start replies travel; posts that send people
away travel less. Write for someone scrolling fast who will decide in one line.

## Current facts (as of September 2026 - re-check with `web_search` if a number matters)

- Standard post: **280 characters**. URLs count as a fixed short length (t.co), not their
  full length.
- Premium subscribers can publish long posts (up to **25,000 characters**); the timeline
  shows roughly the first 280 characters and a "Show more".
- Up to 4 images per post; video and GIFs supported (length limits depend on account tier).
- X published its For You ranking code (August 2026 release). Commonly reported takeaways:
  predicted replies and conversation weigh far more than likes; there is no hard-coded
  link penalty, but posts with external links tend to get less reach because people
  leave the app. Treat specific weights you read online as approximate.

## Audience and what performs

- Tech, media, politics, finance, crypto, gaming, founders, niche expert communities.
- Performs: a clear opinion, a surprising number, a useful list, a short story with a
  lesson, behind-the-scenes, fast takes on news in the user's field, good replies to
  larger accounts.
- Does not: corporate announcements with no angle, link-only posts, hashtag-stuffed copy,
  threads that are one idea padded to ten posts.

## Formats

### Single post

- One idea. First line is the hook; often the whole post is the hook.
- Concrete beats clever: numbers, names, specific outcomes.
- Line breaks for scannability; no walls of text.
- Ending that invites a reply when natural (a question, a fill-in, a contrarian claim),
  but no engagement bait ("Like if you agree").

### Thread

- Use when you have 4-10 genuinely separate points or a story with steps.
- Post 1 must stand alone: promise the payoff ("How we cut cloud costs 40% in a month -
  the 6 changes:"). Avoid "A thread 🧵" as the whole hook.
- One point per post, each readable on its own (people land mid-thread from quotes).
- Number posts only if order matters (1/, 2/...).
- Last post: summary or takeaway + the link or CTA + optional "follow for more on X".
- Put links in the last post or in a reply to post 1, not in post 1.

### Replies

- Reply early to relevant larger accounts with something that adds: data, a counterpoint,
  an example. Not "Great point!".
- Reply to replies on your own posts in the first hour; conversation is the signal.

### Long post (Premium)

- Useful for essays and announcements; still write the first ~280 characters as a
  complete hook because that is what the timeline shows.

## Hooks that work

- Specific result: "We removed our onboarding call. Activation went up 18%."
- Contrarian: "Most 'AI agents' are cron jobs with a chatbot. Here's the difference."
- List promise: "7 Git commands I use every day that nobody taught me:"
- Story start: "In 2023 I shipped a feature that deleted user data. Here's what I changed."
- Question with stakes: "What's the one tool you'd keep if you had to drop the rest?"

## Hashtags and keywords

- 0-2 hashtags, only if they are active community tags (events, chats). Hashtags rarely
  drive reach on X now.
- Put the words people search for in plain text; X search and the ranking both read text.
- Tag accounts only when relevant to them; mass tagging looks spammy.

## Cadence

- Consistency over volume: 1-3 posts a day plus replies is a solid baseline for an
  active account; for a small brand, a few quality posts per week plus daily replies.
- Post when your audience is awake (check the user's analytics if available).
- Do not delete and repost to game timing.

## Repurposing

- From a blog post or video: thread of the key points, one post with the single best
  insight, a quote card image, a question post to spark discussion.
- To LinkedIn: expand the thread into a narrative post with context.
- To Instagram/TikTok: the thread's list becomes a carousel or a talking-head script.

## Avoid

- Links in the first post of a launch when reach matters (link in reply instead).
- Thread-bait hooks that do not deliver.
- Walls of hashtags and emoji.
- Posting the same text across all networks unchanged.
- Fabricated stats, fake screenshots, impersonation or astroturfing.
- Anything the user has not approved: never post on their behalf without explicit OK.

## Output

Use [templates/post-and-thread.md](templates/post-and-thread.md). Always show character
counts for each post and flag any over the limit.
