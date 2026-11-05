---
name: claim-explanations
description: Adds an explanation layer on top of an existing UI without changing how it looks. Finds measurable, comparative, or superlative claims in a section (e.g. "70% faster task execution", "Best Thesis 2025", "5 years of experience", "trusted by 500+ teams"), catalogs them in a JSON dictionary, writes a plain-language explanation that makes each claim fully understood, and shows it on hover (desktop) or through an (i) icon (mobile) as an overlay. Use this skill whenever the user asks for tooltips, hover explanations, info icons, claim substantiation, or "explain these numbers/achievements" on an HTML, Blade, or React section, even if they never say "claim". The existing display must stay untouched: the skill only adds, it never restyles, restructures, or rewires what is already on the page.
---

# Claim Explanations

Two promises this skill must keep, in this order of importance:

1. **The existing display is untouched.** Same pixels, same layout, same markup, same behavior. The feature sits on top of the page, it does not rebuild it.
2. **Hovering a claim (or tapping its (i) icon) explains it well enough that the reader fully understands the claim**: what it means, what it was measured against, and where it comes from.

If a change risks either promise, do not make it; report it instead.

## Hard rules

### Additive only

The only changes allowed to existing code are:

- **(a)** Adding a `data-claim-id="..."` attribute to the element that already contains the claim.
- **(b)** When the claim is only a fragment of a larger text node (for example `Boost your workflow, 70% faster task execution, today.`), wrapping that fragment in a bare `<span data-claim-id="...">` with **no class, no style, no other attributes**. An unstyled inline span is visually inert.
- **(c)** Mounting the overlay once near the app root (one import and one line).

Everything else is forbidden: changing classes or styles, moving or reordering elements, wrapping blocks, adding inline buttons or icons into the flow, adding underlines or other visual hints to existing text, editing copy, changing media sources, upgrading or adding dependencies, editing global CSS or Tailwind config.

All new styles live inside the overlay's own scope (prefix every class `cx-` or use a CSS module or Shadow DOM), so they cannot leak into the page.

### No fabrication

An explanation may only contain facts from (1) the user's message, (2) files in the repo (READMEs, other sections, project descriptions, benchmark docs, the dictionary), or (3) an existing dictionary entry. Never invent a method, number, baseline, event name, date, or source.

When the claim is ambiguous, do not pick an interpretation. "70% faster" could mean 70% less time or 70% more throughput; if the evidence does not say which, write the open question into the report, and leave that part of the explanation out.

### Do not touch what is not a claim

Plain features, prices, dates, addresses, and labels are not claims. When unsure, include it in the report as "possible claim" and leave the page alone.

## Workflow

1. **Detect** claims in the target section only.
2. **Catalog** them in the dictionary and tag each with `data-claim-id` (rule (a) or (b) above, nothing more).
3. **Draft** explanations from evidence (see "Writing the explanation"). List every open question.
4. **Build the overlay** (see "Overlay behavior").
5. **Verify additivity** (see "Verification").

## What counts as a claim

| Type | Examples |
|---|---|
| `performance` | "70% faster task execution", "loads in under 1s" |
| `savings` | "save 5 hours a week" |
| `accuracy` | "95% detection accuracy" |
| `reliability` | "99.9% uptime" |
| `social_proof` | "trusted by 500+ teams", "10,000 users" |
| `ranking` | "#1 rated", "Best Thesis", "Champion", "best-in-class" |
| `credential` | "5 years of experience", "certified", "published" |
| `compliance` | "HIPAA compliant" |
| `comparison` | "2x cheaper than X" |

## Writing the explanation

The reader should finish the popover knowing exactly what the claim means, without prior context. Use this structure; **omit any part the evidence cannot support** (never pad it):

| Part | Answers | Example (illustrative) |
|---|---|---|
| `meaning` (required) | "What does this actually say?" in one plain sentence, jargon defined | "A typical onboarding task now takes about 3 minutes instead of 9." |
| `basis` | "Compared to what, measured how?" Baseline, scope, sample | "Median of 40 runs per version on the same hardware." |
| `context` | "Where does it come from?" Event, organization, project, period | "Measured on the onboarding flow, September 2026." |
| `fine_print` | "What does it not cover?" Limits, exclusions | "Other tasks may differ." |

Writing rules:

- Plain words, short sentences, about 40 to 70 words in total. No marketing language ("amazing", "powerful").
- Say the number with its baseline ("from 9 to 3 minutes"), not just the percentage.
- Define abbreviations and event names on first use.
- Do not repeat the claim text as the explanation ("70% faster means it is 70% faster" is a failure).
- Keep it true to the evidence even if it sounds less impressive.

## Dictionary

Use an existing dictionary if the repo has one; otherwise `src/data/claims.json` (React) or `resources/data/claims.json` (Laravel). One entry per distinct claim, stable kebab-case ids, keys sorted, 2-space indentation.

```json
{
  "version": 2,
  "claims": {
    "faster-task-execution-70": {
      "text": "70% faster task execution",
      "type": "performance",
      "status": "explained",
      "explanation": {
        "meaning": "A typical onboarding task now takes about 3 minutes instead of 9.",
        "basis": "Median of 40 runs per version on the same hardware.",
        "context": "Onboarding flow, September 2026.",
        "fine_print": "Other tasks may differ.",
        "source": "docs/benchmarks/2026-09-task-execution.md"
      },
      "open_questions": [],
      "occurrences": [{ "file": "src/App.tsx", "selector": "[data-claim-id='faster-task-execution-70']" }]
    }
  }
}
```

Status values:

- `needs_explanation`: no usable evidence. `explanation` is `null` and `open_questions` lists exactly what is missing.
- `draft`: written by Copilot from repo or user-provided evidence, awaiting the owner's approval.
- `explained`: the owner confirmed it.

Only the owner (the user, in the conversation) can promote `draft` to `explained`.

Visibility: `explained` always shows. `draft` shows only in development builds (`import.meta.env.DEV`, `process.env.NODE_ENV !== 'production'`, or a `?claims=draft` URL parameter), so the owner can review it on the real page before approving. `needs_explanation` never shows anything to visitors.

## Overlay behavior

One overlay component, mounted once. It finds claims at runtime through `[data-claim-id]`, so the page's own components stay as they are.

### Desktop (hover-capable pointer)

- Hovering a claim opens the explanation after about 150 ms. It closes when the pointer leaves both the claim and the popover (so the reader can move onto the popover to read or click a link), or on Escape.
- **No visual change to the claim itself**: no underline, no icon, no color. At most `cursor: help`, applied only while hovering.
- Keyboard users get the explanation through the (i) button described below, which is hidden visually until it receives focus.

### Touch (`(hover: none), (pointer: coarse)`)

- A small (i) icon appears at the trailing edge of each claim that has an explanation, positioned by the overlay, **not inserted into the page flow**. Tapping it toggles the popover; tapping outside or pressing Escape closes it.
- Touch target at least 24 by 24 px, offset so it does not cover the claim's text. If it would collide with neighboring elements, nudge it outward; if the entry has an `anchor` field (`"top-right"`, `"bottom-right"`), honor it.

### Positioning (this is what keeps the layout untouched)

- Render the popover and the icons in a layer attached to `document.body` (a portal in React), `position: absolute` in document coordinates or `position: fixed` with viewport coordinates, computed from `getBoundingClientRect()` of the claim element.
- Nothing is added inside the claim's parent, so nothing can shift, wrap, or reflow.
- Recompute on `resize`, `scroll` (for fixed positioning), window `load`, and with a `ResizeObserver` on the claim elements.
- Keep the popover inside the viewport: flip above/below and clamp horizontally. Maximum width `min(320px, 90vw)`.
- Use a high but bounded `z-index` and `pointer-events: none` on the layer itself, `auto` only on the popover and icons.

### Accessibility

- The (i) button exists in the DOM for every device; it is the keyboard path to the explanation. It has an accessible name (`"Explain: <claim text>"`) and `aria-expanded`.
- The popover is `role="dialog"` with `aria-modal="false"` and a label; it does not trap focus. Escape closes it and returns focus to the (i) button.
- Respect `prefers-reduced-motion` (no animation) and keep text contrast at WCAG AA against both light and dark backgrounds (read colors from existing CSS variables when present, otherwise use a neutral surface with its own text color).
- Known trade-off: because the (i) buttons live in the overlay layer, their Tab order follows the layer, not the claim's position on the page. Do not fix this by inserting buttons into the page, which would break the additive rule.

### Visual style of the popover

Neutral card, one level of elevation, 8 px radius, 14 px text, the four parts of the explanation as short lines (the `meaning` line slightly stronger, the rest at normal weight with a small label). Styles stay inside the overlay scope.

## Optional evidence assets

An explanation may link to evidence (an image, a video, a document) through an `assets` array of `{ type, label, key | env, alt?, width?, height?, format?, duration? }`.

- This applies only to **new references introduced by this feature**. Existing images, videos, and documents on the page are not touched, rerouted, or re-sourced.
- Assets live in Cloudflare R2. Resolve them through the project's existing asset resolver or helper, using the variable names in `.env.example`. If there is none, add the smallest possible helper in the overlay's own folder. A `key` joins the public base URL variable; an `env` names a variable that already holds a full URL.
- Never write a resolved URL, secret, account id, or bucket hostname into code or JSON. Never read `.env`.
- Only attach an asset whose key or variable name the user gave or the repo already references. Never guess one.
- Images: thumbnail with `alt`, `width`, `height`, `loading="lazy"`. Video and documents: labeled links opening in a new tab with `rel="noopener"`. Load only on first open.
- If there are no confirmed assets, skip all of this and do not create a resolver.

## Verification (required)

Before reporting, prove the page was not changed:

1. Run `git diff -U0` and list **every removed line** (`-` lines). Each one must be a line that is re-added unchanged except for a new `data-claim-id` attribute or the bare wrapper span. Revert any hunk that does more.
2. Confirm no class, style, copy, import of existing media, global CSS, Tailwind config, or dependency changed. List the files changed; new files should be limited to the overlay component, its styles, and the dictionary (plus the optional asset helper).
3. Run the project's own checks from `package.json`: type check, lint, production build. Include the final lines of each output.
4. If a dev server and headless browser are available, capture before and after screenshots of the target section at 390 px and 1280 px with the overlay idle and confirm they are identical. If not possible, say so.
5. Never say the work is complete without these results.

## Report format

```
Claims found: N
Explained / Draft / Needs explanation: X / Y / Z
For each draft: claim -> explanation text, plus its evidence (file or user message)
Open questions for the owner: <per claim, exactly what is missing or ambiguous>
Possible claims left alone: <list>
Existing code changes: <number of lines; each is data-claim-id or bare span>
Removed lines in git diff: <list, each justified>
Files added / changed: <list>
Verification: <command: pass/fail, final output lines>
Visual check: <done at widths / not possible>
```
