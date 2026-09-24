---
name: human-writing
description: Rewrite or write text so it reads as natural human prose in any language - removes AI tells (filler openers, stock phrases, reflexive lists of three, em-dash overuse, hedging, generic conclusions, over-formatting), varies rhythm, adds concrete detail and keeps the author's voice. Use when the user asks to humanize, naturalize, de-AI, polish or "make it sound like me", and whenever writing emails, posts, bios or articles meant to be read as written by a person.
metadata:
  author: HydraOps
  version: 1.0.0
  tools: []
---

# Human writing

Readers spot machine prose by its patterns, not by any single word. The fix is not a
thesaurus swap; it is saying something specific, the way a particular person would say
it.

## Before you start

1. **Whose voice?** If the user gave samples of their writing, match their sentence
   length, vocabulary, punctuation habits and humor. If they gave a draft to fix, keep
   their voice; change as little as needed.
2. **Language variant and register.** If the user has not said which regional variant,
   accent or register to use (for example Rioplatense vs neutral Spanish, US vs UK
   English, European vs Brazilian Portuguese, formal vs casual) **and it matters for the
   piece** (marketing copy, dialogue, a local audience, pronouns like vos/tú/usted),
   ask once, briefly. Otherwise default to a neutral, widely understood variant and keep
   it consistent.
3. **Purpose and reader.** One sentence: who reads this and what should they do or feel
   afterwards. Everything that does not serve that goes.

## The tells to remove

Full list with examples in several languages:
[references/ai-tells.md](references/ai-tells.md).

- **Throat-clearing openers**: "In today's fast-paced world", "In the ever-evolving
  landscape of", "Let's dive in", "Great question". Start with the point.
- **Stock vocabulary**: delve, tapestry, testament, realm, navigate (figurative),
  leverage, seamless, robust, pivotal, crucial, elevate, unlock, embark, foster,
  "plays a vital role". Use the plain word or a concrete claim.
- **Reflexive triads**: "fast, reliable, and scalable" in every paragraph. Use one, two
  or four items when that is the true number.
- **Em-dash habit**: one or two per page is fine; one per sentence is a signature. Use
  commas, periods, parentheses or colons.
- **Hedging and qualifiers**: "it's important to note", "arguably", "can potentially",
  "it may be worth considering". Commit, or state the real uncertainty once.
- **Symmetrical structures**: "It's not just X, it's Y." "Whether you're A or B..."
  "From X to Y". Fine once; not as a template.
- **Generic conclusions**: "In conclusion", "Ultimately", "By following these tips, you
  can...". End on the last useful point, a concrete next step, or a line with a view.
- **Over-formatting**: headings on a 200-word email, bold on every other phrase, bullets
  for things that read better as a sentence, emoji as bullet markers.
- **Empty intensifiers and praise**: "truly", "incredibly", "game-changer",
  "revolutionary", "I hope this email finds you well".
- **Uniform rhythm**: every sentence 15-20 words, every paragraph three sentences.

## What to do instead

- **Be specific.** Replace abstractions with a number, a name, a place, an example, a
  short anecdote. "Saves time" -> "cut our weekly report from 3 hours to 40 minutes".
- **Vary rhythm.** Mix short sentences with longer ones. A fragment now and then. Let a
  paragraph be one line when it lands a point.
- **Active voice, real subjects.** "We shipped it late" not "Delays were experienced".
- **Say it once.** Cut the sentence that restates the previous one.
- **Use the words the reader uses.** Plain verbs, everyday nouns, the jargon of the
  field only when the reader shares it.
- **Allow opinion and texture** where the author would: a preference, a doubt, a small
  aside. Humans are not perfectly balanced.
- **Format for the medium.** Chat and email: plain paragraphs. Docs: headings if they
  help navigation. Social: see the platform skills.
- **Idiom belongs to the language.** Do not translate English idioms or English
  punctuation habits into other languages; write natively.

## Process

1. Read the whole text first. Note the core message in one sentence.
2. Cut: openers, closers that summarize, duplicate sentences, hedges.
3. Replace: stock words and vague claims with plain words and specifics. If the specific
   fact is unknown, ask or leave a clear placeholder like `[number]`; never invent facts,
   quotes or anecdotes.
4. Restructure: break the rhythm, remove unneeded lists and headings.
5. Read it aloud (mentally). Anything you would not say to a colleague, rewrite.
6. Check length: usually shorter than the original.

Before/after examples: [references/examples.md](references/examples.md).

## Output

- Return the rewritten text only, unless the user asked for explanations. If they want
  to learn, add a short list of the main changes afterwards.
- Keep the original language, meaning, facts and any required terms, names or links.
- Do not claim the text will pass AI detectors; detectors are unreliable. The goal is
  good writing.
