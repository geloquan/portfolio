---
name: claim-explanations
description: Finds measurable, comparative, or superlative claims in an HTML section (e.g. "70% faster task execution", "99.9% uptime", "trusted by 500+ teams", "#1 rated"), catalogs them in a JSON dictionary, flags the ones that still lack an explanation, and attaches the explanation in the UI as a hover/focus tooltip on desktop and an (i) tap-to-open popover on mobile. Use this skill whenever the user hands over an HTML/Blade/JSX section, landing page, hero, pricing block, or feature list and mentions claims, statistics, metrics, proof points, "needs explanation", tooltips, info icons, or substantiation, even if they never say "claim".
---

# Claim Explanations

Every number or superlative in the UI is a promise. This skill makes each promise traceable: it lives in a JSON dictionary, it is either explained or visibly flagged as unexplained, and once explained it is delivered to the reader through hover (desktop) or an (i) icon (mobile).

## Hard rules

1. **Never invent an explanation.** Do not make up a methodology, sample size, source, date, or benchmark. An explanation may only contain facts that come from (a) the user's message, (b) files in this repository (benchmark results, docs, changelogs, tests), or (c) an existing entry in the dictionary. If the evidence is not there, the claim stays `needs_explanation`.
2. **Never change the claim text** shown to the reader. This skill documents claims, it does not rewrite marketing copy. If a claim looks unsupportable, say so in the report and leave the wording to the human.
3. **Never show "TODO", "needs explanation", or placeholder text to end users.** Unexplained claims get a marker in the JSON and a dev-only marker in the DOM, nothing public.
4. **Do not re-explain what is already explained.** If a claim already has an `explained` entry, only wire the UI to it.
5. **Do not add dependencies** for tooltips. Use plain HTML, CSS, and a few lines of JS (or the project's existing popover primitive if it has one).

## Inputs

- An HTML section (a file path, a selector, or a pasted snippet). Blade, JSX/TSX, and Vue templates count as HTML here.
- Optionally the dictionary path. Default: `resources/data/claims.json` in Laravel projects, `src/data/claims.json` elsewhere. If a dictionary already exists anywhere in the repo, use it and do not create a second one.

## Step 1: Detect claims

Scan the section's visible text (including `alt`, `title`, and `aria-label`) for statements the reader could ask "says who?" about. A claim is any of:

| Type | Examples |
|---|---|
| `performance` | "70% faster task execution", "10x throughput", "loads in under 1s" |
| `savings` | "save 5 hours a week", "cut costs by 40%" |
| `accuracy` | "95% detection accuracy", "zero false positives" |
| `reliability` | "99.9% uptime", "never loses data" |
| `social_proof` | "trusted by 500+ teams", "10,000 active users" |
| `ranking` | "#1 rated", "best-in-class", "industry-leading" |
| `compliance` | "HIPAA compliant", "ISO 27001 certified" |
| `comparison` | "faster than X", "2x cheaper than the alternative" |

Not claims: plain feature descriptions ("Export to CSV"), prices, dates, addresses, and numbers that are only labels (step numbers, list counts).

When unsure, treat it as a claim and let the report show the doubt. A false positive costs one line in the report; a false negative ships an unsupported promise.

## Step 2: Catalog in the JSON dictionary

Create or update the dictionary. One entry per distinct claim, keyed by a stable kebab-case `id` derived from the claim (`faster-task-execution-70`). If the same claim appears in several places, it is one entry with several `occurrences`.

Schema:

```json
{
  "version": 1,
  "claims": {
    "faster-task-execution-70": {
      "text": "70% faster task execution",
      "type": "performance",
      "status": "explained",
      "explanation": {
        "summary": "Median time to complete the standard 12-step onboarding task dropped from 9.2 to 2.8 minutes.",
        "basis": "Internal benchmark, 40 task runs per version, same hardware.",
        "source": "docs/benchmarks/2026-09-task-execution.md",
        "as_of": "2026-09-14",
        "caveats": "Measured on the onboarding flow only; other tasks may differ."
      },
      "occurrences": [
        { "file": "resources/views/landing/hero.blade.php", "selector": "[data-claim-id='faster-task-execution-70']" }
      ]
    },
    "trusted-by-500-teams": {
      "text": "Trusted by 500+ teams",
      "type": "social_proof",
      "status": "needs_explanation",
      "explanation": null,
      "occurrences": [
        { "file": "resources/views/landing/hero.blade.php", "selector": "[data-claim-id='trusted-by-500-teams']" }
      ]
    }
  }
}
```

Field rules:

- `status` is one of:
  - `needs_explanation`: no evidence available. `explanation` is `null`.
  - `draft`: an explanation was assembled from repo evidence but a human has not confirmed it. The UI treats `draft` like `needs_explanation` (nothing public) until it is promoted.
  - `explained`: a human supplied or confirmed the explanation.
- Only a human (the user saying so in the conversation, or an existing `explained` entry) can move an entry to `explained`. Copilot may move entries up to `draft`.
- `explanation.summary` is required for `draft` and `explained`. It must be one or two plain sentences a visitor can read in under ten seconds. `basis`, `source`, `as_of`, `caveats` are optional but include whichever the evidence supports.
- Keep `text` identical to what the page displays, so the dictionary and the UI can be checked against each other.
- Keep keys sorted alphabetically and the file pretty-printed with 2 spaces so diffs stay readable.

## Step 3: Mark the HTML

Wrap each claim in a span carrying its id and status. The status attribute is the "needs to be explained" marker in the DOM.

```html
<span class="claim" data-claim-id="faster-task-execution-70" data-claim-status="explained">
  70% faster task execution
</span>
```

- `data-claim-status="needs-explanation"` for `needs_explanation` and `draft`.
- `data-claim-status="explained"` for `explained`.
- Do not wrap more text than the claim itself.
- Do not nest claims inside links or buttons; if the claim is inside one, put the (i) button right after the interactive element instead, not inside it.

## Step 4: Deliver explained claims in the UI

Only `explained` claims get a visible affordance. The explanation text comes from the dictionary (inline it at build or render time, or fetch it once); never hard-code it into the template as a second copy.

### Behavior

- **Desktop (hover-capable pointer):** hovering or keyboard-focusing the claim shows the explanation in a tooltip. No icon is required visually, but the claim gets a subtle dotted underline so people discover it.
- **Mobile / touch:** an **(i)** icon button sits right after the claim. Tapping it opens the explanation as a popover; tapping outside or pressing Escape closes it.
- **Keyboard and screen readers:** the (i) button exists in the DOM on every device and is focusable. On desktop it is visually hidden until focused, so keyboard users reach the same content as touch users.
- Distinguish devices with CSS (`@media (hover: hover) and (pointer: fine)`), not user-agent sniffing.

### Markup

```html
<span class="claim" data-claim-id="faster-task-execution-70" data-claim-status="explained">
  70% faster task execution
  <button type="button" class="claim-info"
          aria-label="How we measured: 70% faster task execution"
          aria-expanded="false"
          aria-controls="claim-pop-faster-task-execution-70">
    <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/>
      <rect x="7.25" y="7" width="1.5" height="5" fill="currentColor"/>
      <circle cx="8" cy="4.75" r="1" fill="currentColor"/>
    </svg>
  </button>
  <span role="tooltip" id="claim-pop-faster-task-execution-70" class="claim-pop" hidden>
    <span class="claim-pop__summary">Median time to complete the standard 12-step onboarding task dropped from 9.2 to 2.8 minutes.</span>
    <span class="claim-pop__meta">Internal benchmark, 40 task runs per version. As of Sep 2026.</span>
  </span>
</span>
```

### CSS (adapt tokens to the project; Tailwind equivalents are fine)

```css
.claim { position: relative; }
.claim[data-claim-status="explained"] {
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}
.claim-info {
  display: inline-grid; place-items: center;
  min-width: 24px; min-height: 24px;      /* comfortable touch target */
  margin-left: .25em; padding: 0;
  border: 0; background: none; color: inherit; cursor: pointer;
  vertical-align: middle;
}
.claim-pop {
  position: absolute; z-index: 20; left: 0; top: calc(100% + 8px);
  width: max-content; max-width: min(320px, 90vw);
  padding: .75rem .875rem; border-radius: .5rem;
  background: var(--surface-raised, #fff); color: var(--text, #111);
  box-shadow: 0 6px 24px rgb(0 0 0 / .18);
  font-size: .875rem; line-height: 1.45; text-decoration: none;
}
.claim-pop[hidden] { display: none; }
.claim-pop__meta { display: block; margin-top: .375rem; opacity: .7; font-size: .8125rem; }

/* Desktop: icon hidden until keyboard focus; hover/focus on the claim opens the tooltip */
@media (hover: hover) and (pointer: fine) {
  .claim-info:not(:focus-visible) { position: absolute; width: 1px; height: 1px; min-width: 0; min-height: 0; overflow: hidden; clip-path: inset(50%); }
}
/* Touch: icon always visible, no underline needed */
@media (hover: none), (pointer: coarse) {
  .claim[data-claim-status="explained"] { text-decoration: none; }
}
/* Dev-only flag for unexplained claims; enable with <html data-debug-claims> */
html[data-debug-claims] .claim[data-claim-status="needs-explanation"] {
  outline: 2px dashed #d97706; outline-offset: 2px;
}
```

### JS (one small module, no dependencies)

```js
const canHover = matchMedia('(hover: hover) and (pointer: fine)');

function setOpen(claim, open) {
  const btn = claim.querySelector('.claim-info');
  const pop = claim.querySelector('.claim-pop');
  if (!btn || !pop) return;
  pop.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
}

document.querySelectorAll('.claim[data-claim-status="explained"]').forEach((claim) => {
  const btn = claim.querySelector('.claim-info');

  // Desktop: hover and focus
  claim.addEventListener('mouseenter', () => canHover.matches && setOpen(claim, true));
  claim.addEventListener('mouseleave', () => canHover.matches && setOpen(claim, false));
  claim.addEventListener('focusin',   () => canHover.matches && setOpen(claim, true));
  claim.addEventListener('focusout',  () => canHover.matches && setOpen(claim, false));

  // Touch (and keyboard Enter/Space on the button): toggle
  btn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(claim, btn.getAttribute('aria-expanded') !== 'true');
  });
});

// Close on outside tap / Escape
document.addEventListener('click', () =>
  document.querySelectorAll('.claim-info[aria-expanded="true"]').forEach((b) => setOpen(b.closest('.claim'), false)));
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.claim-info[aria-expanded="true"]').forEach((b) => {
    setOpen(b.closest('.claim'), false);
    b.focus();
  });
});
```

If the project is React/TypeScript, port this into a single `<Claim id="..." >` component that reads from the dictionary by id and renders the markup above. If it is Laravel Blade, make it a `<x-claim id="...">` component for the same reason. In both cases the component, not each call site, owns the markup, so the section's HTML stays readable.

Popover hygiene: keep the popover inside the viewport (flip to `right: 0` if it would overflow), never let it cover the (i) button, and do not trap focus; it is a non-modal disclosure.

## Step 5: Report back

End with a short report in this exact shape so the human can act on it:

```
Claims found: N
Explained (wired to UI): X
  - faster-task-execution-70: "70% faster task execution"
Needs explanation (flagged, nothing public): Y
  - trusted-by-500-teams: "Trusted by 500+ teams"
    Missing: basis for the number, source, as-of date
Draft (needs human confirmation): Z
  - ...
Possible unsupportable wording: (list anything absolute like "never", "zero", "best", or "guaranteed")
Files changed: ...
```

For each unexplained claim, say exactly what information would unlock it (for example "the user count and where it was measured", "the benchmark run behind the 70%"). Do not ask for all of them at once if there are many; list them and let the human answer in any order.

## Re-running on the same section

Running the skill again must be idempotent:

- Existing `explained` entries and their text are untouched.
- Claims already in the dictionary are matched by `id` first, then by normalized `text` (lowercased, whitespace collapsed), so renaming a span never creates a duplicate.
- An entry whose claim no longer appears anywhere gets `"status": "orphaned"` in the report (do not delete it automatically).
- If displayed text changed but the `id` is the same, flag it as "claim text changed, explanation may be stale" and leave the entry as it was.

## Checklist before finishing

- [ ] Every claim in the section has a dictionary entry and a `data-claim-id`.
- [ ] No explanation contains a fact that did not come from the user or the repo.
- [ ] Unexplained claims show nothing to end users.
- [ ] Explained claims work with hover, keyboard focus, and tap on the (i) icon.
- [ ] The (i) button has an accessible name and `aria-expanded`; Escape closes the popover.
- [ ] The report lists what is still missing for each unexplained claim.

## Assets

Keep section media references in arrays and pass each configured environment reference or object key through the shared `resolveAssetUrl` helper in `src/assetUrl.ts`. The helper returns `null` for missing or unapproved external references; render no media element when it returns `null`. Claim explanation assets use the same resolver and load only when a visitor opens the explanation.
