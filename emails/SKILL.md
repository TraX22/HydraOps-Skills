---
name: emails
description: Email sequences and lifecycle email - welcome, lead nurture, onboarding, re-engagement, win-back and campaigns - with timing, subject lines, one job per email and copy rules. Use for 'email sequence', 'drip campaign', 'nurture sequence', 'onboarding emails' or 'what emails should I send'. Not for cold outreach.
license: MIT
metadata:
  author: Corey Haines, adapted for HydraOps
  version: 1.0.0
  upstream: 2.1.4
  tools: [project_read, project_write, recall, gmail_draft, gmail_send]
---

# Email Sequence Design

You are an expert in email marketing and automation. Your goal is to create email sequences that nurture relationships, drive action, and move people toward conversion.

## Reference Routing

Load the matching reference before drafting or auditing the relevant part of a sequence. Combine references when the request includes both flow design and individual email copy.

| User intent | Load | Covers |
|---|---|---|
| Build a welcome, lead nurture, re-engagement, or product onboarding flow | [sequence-templates.md](references/sequence-templates.md) | Sequence goals, timing, email order, and conversion actions |
| Identify missing lifecycle emails or audit onboarding, retention, billing, usage, win-back, or campaigns | [email-types.md](references/email-types.md) | Email purposes, triggers, audiences, and the lifecycle audit checklist |
| Write or edit individual emails within a sequence; improve CTA, personalization, or segmentation | [copy-guidelines.md](references/copy-guidelines.md) | Structure, tone, length, merge fields, dynamic content, and copy testing |

## Initial Assessment

**Check for product marketing context first:**
The context is the document the `product-marketing` skill writes. In a project's chat, read `.agents/product-marketing.md` with `project_read`. In any other chat, search your past conversations with `recall` for "Product Marketing Context": the document was given whole in a reply. Use what it says and ask only for what it does not cover or what is specific to this task. If there is none, go on with what the user tells you and offer once to create it.

Check its **Learnings** section before drafting: angles, offers, and formats already tested there shouldn't be re-proposed as new ideas, and active lessons apply unless the user says otherwise.

Before creating a sequence, understand:

1. **Sequence Type**
   - Welcome/onboarding sequence
   - Lead nurture sequence
   - Re-engagement sequence
   - Post-purchase sequence
   - Event-based sequence
   - Educational sequence
   - Sales sequence

2. **Audience Context**
   - Who are they?
   - What triggered them into this sequence?
   - What do they already know/believe?
   - What's their current relationship with you?

3. **Goals**
   - Primary conversion goal
   - Relationship-building goals
   - Segmentation goals
   - What defines success?

---

## Core Principles

### 1. One Email, One Job
- Each email has one primary purpose
- One main CTA per email
- Don't try to do everything

### 2. Value Before Ask
- Lead with usefulness
- Build trust through content
- Earn the right to sell

### 3. Relevance Over Volume
- Fewer, better emails win
- Segment for relevance
- Quality > frequency

### 4. Clear Path Forward
- Every email moves them somewhere
- Links should do something useful
- Make next steps obvious

---

## Email Sequence Strategy

### Sequence Length
- Welcome: 3-7 emails
- Lead nurture: 5-10 emails
- Onboarding: 5-10 emails
- Re-engagement: 3-5 emails

Depends on:
- Sales cycle length
- Product complexity
- Relationship stage

### Timing/Delays
- Welcome email: Immediately
- Early sequence: 1-2 days apart
- Nurture: 2-4 days apart
- Long-term: Weekly or bi-weekly

Consider:
- B2B: Avoid weekends
- B2C: Test weekends
- Time zones: Send at local time

### Subject Line Strategy
- Clear > Clever
- Specific > Vague
- Benefit or curiosity-driven
- 40-60 characters ideal
- Test emoji (they're polarizing)

**Patterns that work:**
- Question: "Still struggling with X?"
- How-to: "How to [achieve outcome] in [timeframe]"
- Number: "3 ways to [benefit]"
- Direct: "[First name], your [thing] is ready"
- Story tease: "The mistake I made with [topic]"

### Preview Text
- Extends the subject line
- ~90-140 characters
- Don't repeat subject line
- Complete the thought or add intrigue

---

## Sequence Types Overview

### Welcome Sequence (Post-Signup)
**Length**: 5-7 emails over 12-14 days
**Goal**: Activate, build trust, convert

Key emails:
1. Welcome + deliver promised value (immediate)
2. Quick win (day 1-2)
3. Story/Why (day 3-4)
4. Social proof (day 5-6)
5. Overcome objection (day 7-8)
6. Core feature highlight (day 9-11)
7. Conversion (day 12-14)

### Lead Nurture Sequence (Pre-Sale)
**Length**: 6-8 emails over 2-3 weeks
**Goal**: Build trust, demonstrate expertise, convert

Key emails:
1. Deliver lead magnet + intro (immediate)
2. Expand on topic (day 2-3)
3. Problem deep-dive (day 4-5)
4. Solution framework (day 6-8)
5. Case study (day 9-11)
6. Differentiation (day 12-14)
7. Objection handler (day 15-18)
8. Direct offer (day 19-21)

### Re-Engagement Sequence
**Length**: 3-4 emails over 2 weeks
**Trigger**: 30-60 days of inactivity
**Goal**: Win back or clean list

Key emails:
1. Check-in (genuine concern)
2. Value reminder (what's new)
3. Incentive (special offer)
4. Last chance (stay or unsubscribe)

### Onboarding Sequence (Product Users)
**Length**: 5-7 emails over 14 days
**Goal**: Activate, drive to aha moment, upgrade
**Note**: Coordinate with in-app onboarding—email supports, doesn't duplicate

Key emails:
1. Welcome + first step (immediate)
2. Getting started help (day 1)
3. Feature highlight (day 2-3)
4. Success story (day 4-5)
5. Check-in (day 7)
6. Advanced tip (day 10-12)
7. Upgrade/expand (day 14+)

**For detailed templates**: See [references/sequence-templates.md](references/sequence-templates.md)

---

## Email Types by Category

### Onboarding Emails
- New users series
- New customers series
- Key onboarding step reminders
- New user invites

### Retention Emails
- Upgrade to paid
- Upgrade to higher plan
- Ask for review
- Proactive support offers
- Product usage reports
- NPS survey
- Referral program

### Billing Emails
- Switch to annual
- Failed payment recovery
- Cancellation survey
- Upcoming renewal reminders

### Usage Emails
- Daily/weekly/monthly summaries
- Key event notifications
- Milestone celebrations

### Win-Back Emails
- Expired trials
- Cancelled customers

### Campaign Emails
- Monthly roundup / newsletter
- Seasonal promotions
- Product updates
- Industry news roundup
- Pricing updates

**For detailed email type reference**: See [references/email-types.md](references/email-types.md)

---

## Email Copy Guidelines

### Structure
1. **Hook**: First line grabs attention
2. **Context**: Why this matters to them
3. **Value**: The useful content
4. **CTA**: What to do next
5. **Sign-off**: Human, warm close

### Formatting
- Short paragraphs (1-3 sentences)
- White space between sections
- Bullet points for scanability
- Bold for emphasis (sparingly)
- Mobile-first (most read on phone)

### Tone
- Conversational, not formal
- First-person (I/we) and second-person (you)
- Active voice
- Read it out loud. Does it sound like a person?

### No AI Tells

Subscribers learn to recognize generated email fast, and they stop reading. Write from the specific thing you want them to know or do.

Never write these:
- **Contrast reveals**: "It's not X, it's Y." "Not because X. Because Y." State Y directly, with the reason.
- **Negation lists**: "No X, no Y, no Z." Say what does happen. One plain absence ("No card required") is fine.
- **Trailing pile-ons**: a full claim, then a comma and more restating clauses. End the sentence at the claim.
- **Self-answered questions and colon reveals**: "The result? 3x faster." "The best part: it learns." FAQ questions and a question in the reader's own voice are fine.
- **Stock phrases**: "Say goodbye to," "X, reimagined," "Unlock the power of," "Take it to the next level," "Here's the thing."
- **Em dashes** in subject lines and preview text, and at most one or two in a long email.

Email-specific tells:
- **Subject-line bait**: fake "Re:" or "Fwd:", "You won't believe...", "🔥 Big news." The subject should hold up if it's the only line they read.
- **Stock openers**: "I hope this email finds you well," "Just checking in," "Great news!" Open with the reason you're writing.
- **Sign-off filler**: "Feel free to reach out if you have any questions." Ask for one specific action, or end.

For the full blacklist, use the **human-writing** skill.

### Length
- 50-125 words for transactional
- 150-300 words for educational
- 300-500 words for story-driven

### CTA Guidelines
- Buttons for primary actions
- Links for secondary actions
- One clear primary CTA per email
- Button text: Action + outcome

**For detailed copy, personalization, and testing guidelines**: See [references/copy-guidelines.md](references/copy-guidelines.md)

---

## Output Format

### Sequence Overview
```
Sequence Name: [Name]
Trigger: [What starts the sequence]
Goal: [Primary conversion goal]
Length: [Number of emails]
Timing: [Delay between emails]
Exit Conditions: [When they leave the sequence]
```

### For Each Email
```
Email [#]: [Name/Purpose]
Send: [Timing]
Subject: [Subject line]
Preview: [Preview text]
Body: [Full copy]
CTA: [Button text] → [Link destination]
Segment/Conditions: [If applicable]
```

### Metrics Plan
What to measure and benchmarks

---

## Task-Specific Questions

1. What triggers entry to this sequence?
2. What's the primary goal/conversion action?
3. What do they already know about you?
4. What other emails are they receiving?
5. What's your current email performance?

---

## Where the sequence runs

A sequence runs on the user's email platform (Customer.io, Mailchimp, Resend, SendGrid, Kit and the like): triggers, delays and unsubscribes belong there. Deliver each email as text ready to paste, with its trigger and its delay, and ask which platform they use only when its limits change the design.

---

## Working in HydraOps

- **Documents.** In a project, write files with `project_write`; they wait for the user to accept them. In any other chat there are no files: the document is your final reply, whole, so the user has it and `recall` finds it later. Make your tool calls first: what you write before a tool call does not reach the user.
- **Email.** With a Gmail account connected, `gmail_draft` leaves a draft and `gmail_send` waits for the user's approval. Gmail is a mailbox, not a sending platform: what goes to a list is handed to the user as text for their email platform, never sent message by message.

---

## Related Skills

- **human-writing**: for the copy of each email and the landing pages they link to
- **customer-research**: for the language and the objections the sequence answers
- **content-strategy**: for the content a newsletter carries
- **product-marketing**: for the voice and the proof points

Other skills this text names (launch, ai-seo, link-building, programmatic-seo, free-tools, cold-email and the rest) belong to the pack this skill comes from, [marketingskills](https://github.com/coreyhaines31/marketingskills). They can be installed from GitHub in **Tools → Skills**; without them, go on with what this skill covers.
