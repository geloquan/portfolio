---
name: portfolio-contact-flow
description: Builds the "Contact / Hire Me / Get in Touch" section of a portfolio as an interactive, product-grade flow instead of a plain form. Enforces a UI standard of modals, toast notifications, custom-styled form fields, inline validation, and animated state feedback. Use this skill whenever the user is building or redesigning a portfolio's contact section, hire-me button, inquiry form, booking/call scheduler, resume-request flow, or "let's work together" CTA, even if they only say "add a contact form to my portfolio" or "make my portfolio feel less like a template." Do NOT use for the rest of a portfolio (hero, projects grid, about page, blog) or for non-portfolio forms.
---

# Portfolio Contact Flow

A specialized skill for ONE part of a portfolio: **the path from "I'm interested" to "message sent."** The goal is for this flow to feel like a small product, not a `<form>` pasted under a footer. A recruiter or client who uses it should think "this person ships polished UI."

## The non-negotiable UI standard

Every contact flow built with this skill MUST contain all of the following. If one is missing, the work is incomplete.

1. **A modal-based entry point.** The primary CTA ("Hire me", "Let's talk") opens a modal/dialog. The contact form does NOT sit inline as a bare block on the page. (An inline teaser is fine, but the real form lives in the modal.)
2. **Custom form fields.** No unstyled browser-default inputs. Fields must be visibly "modified" (see Field Standard below).
3. **Toast notifications** for every async outcome: success, error, and copy-to-clipboard. Never use `alert()`.
4. **Inline, live validation** with per-field messages. Never a single generic "something went wrong."
5. **Explicit state machine** for submission: `idle → validating → submitting → success | error`. Each state has a distinct visual.
6. **Keyboard + a11y compliance**: focus trap in the modal, `Esc` closes, focus returns to the trigger, `aria-*` roles, visible focus rings, `prefers-reduced-motion` respected.

## Workflow

1. **Detect the stack.** Check the project (package.json, files). Use its framework (React/Next/Vue/Svelte/vanilla) and styling system (Tailwind, CSS modules, etc.). If nothing exists, default to a single-file HTML/CSS/JS build. Do not introduce a new framework just for this.
2. **Detect the design tokens.** Reuse the portfolio's existing colors, radius, fonts. If none, define a small token set (see Tokens). The flow must look native to the host site.
3. **Choose a flow variant** (ask the user only if truly ambiguous; otherwise pick by default):
  - *Single-step modal*: name, email, message. Default for simple portfolios.
  - *Multi-step modal (recommended for freelancers)*: Step 1 intent (project type chips), Step 2 details (budget, timeline), Step 3 contact info. Progress indicator at top.
  - *Quick-actions modal*: three cards (Send message / Book a call / Download resume), each leading to its own sub-view.
4. **Build in this order**: tokens → modal shell → fields → validation → submit state machine → toast system → success view → a11y pass.
5. **Wire a real or mockable backend.** Provide a `submitInquiry(payload)` function with a clearly marked swap point (Formspree, Resend, EmailJS, a serverless route). In demo mode, simulate latency and a 15% failure so error toasts can be seen.
6. **Self-check against the Review Checklist** at the end before delivering.

## Modal Standard

- Overlay: dimmed + `backdrop-filter: blur(6px)`. Click on overlay closes (unless the form is dirty; then ask via a confirm sub-dialog or toast-with-undo).
- Container: max-width 520px (single-step) or 640px (multi-step), radius 16-24px, layered soft shadow, subtle 1px border using a translucent token.
- Entrance: scale from 0.96 + fade + 8px upward translate, ~220ms ease-out. Exit is faster (~160ms).
- Use the native `<dialog>` element where the framework allows, or a headless primitive (Radix Dialog, Headless UI). If hand-rolling, implement the focus trap and `aria-modal="true"` yourself.
- Lock body scroll while open. Restore on close.
- Header: title + one-line human subtext ("Usually reply within 24h"). Close button top-right with `aria-label`.
- Footer: primary action on the right, secondary/cancel on the left. Show the keyboard hint (`Esc` to close, `⌘/Ctrl + Enter` to send) in muted text.

## Field Standard ("modified form fields")

Default inputs are banned. Every field must have:

- **Floating or stacked label** that animates (floating label shrinks and moves up on focus/filled). Never placeholder-as-label.
- **Custom focus treatment**: animated border/glow ring in the accent color, not the browser outline. Keep a visible focus indicator for a11y.
- **Leading icon** (lucide/inline SVG) inside text inputs where it adds meaning (mail, user, link).
- **Trailing status slot**: spinner while validating, check icon when valid, alert icon when invalid.
- **Helper/error line** reserved beneath the field (fixed height, so layout never jumps). Errors animate in with a short slide/fade.
- **Character counter** on the message textarea, plus auto-grow behavior.
- **Replace native controls**:
  - `<select>` → custom listbox or segmented control
  - checkboxes/radios → chip-style toggles ("Web app", "Branding", "Consulting")
  - budget → a styled range slider with live-formatted value, or selectable tier cards
  - date → custom picker or quick-pick buttons ("This week", "This month", "Flexible")
- **Honeypot field** (visually hidden, `tabindex=-1`, `autocomplete=off`) for basic spam protection.

## Validation Rules

- Validate on blur first, then on input after the first error (avoid yelling at users mid-typing).
- Email: pragmatic regex plus a "Did you mean gmail.com?" typo hint for common domain mistakes.
- Message: minimum ~20 characters with a friendly message ("A little more detail helps me reply better").
- On submit with errors: focus the first invalid field, shake it subtly (disabled under reduced motion), and fire an error toast summarizing ("2 fields need attention").
- Error copy is human and specific, never "Invalid input."

## Toast System Standard

Build one reusable toast manager (not ad-hoc divs):

- API: `toast.success(msg)`, `toast.error(msg, {action})`, `toast.info(msg)`, `toast.promise(promise, {loading, success, error})`.
- Position: bottom-right on desktop, top-center on mobile. Stack with max 3 visible.
- Auto-dismiss 4s (errors 6s). Pause on hover/focus. Progress bar optional.
- Use `role="status"` / `aria-live="polite"` (`assertive` for errors).
- Required toast moments in this flow:
  - Submit success: "Message sent. I'll reply within 24h."
  - Submit failure: error toast with a **Retry** action that resubmits the preserved payload (never lose the user's text).
  - Email copied to clipboard (from a "copy email" button).
  - Draft restored ("Welcome back, restored your draft" with a **Discard** action).
  - Closing a dirty modal: toast with **Undo** that reopens it with data intact.

## State Machine and Feedback

| State | Visual |
|---|---|
| idle | Primary button enabled, subtle hover lift |
| validating | Field-level spinners only |
| submitting | Button shows inline spinner and "Sending…", fields disabled, modal cannot be dismissed |
| success | Form cross-fades to a success view: animated check, summary of what was sent, "Send another" and "Close" actions, confetti or soft particle burst (skipped under reduced motion) |
| error | Form stays intact, error toast with Retry, button returns to idle |

Persist a draft to `localStorage` (debounced) so accidental closes lose nothing. Clear on success. In environments where browser storage is unsupported (e.g. sandboxed previews), fall back to in-memory state without throwing.

## Design Tokens (fallback only)

Use the host site's tokens when they exist. Otherwise:

```css
:root {
  --surface: #ffffff;
  --surface-2: #f6f6f8;
  --text: #14141a;
  --muted: #6b6b78;
  --accent: #5b5bf0;
  --danger: #e5484d;
  --success: #30a46c;
  --radius: 16px;
  --ring: 0 0 0 4px color-mix(in srgb, var(--accent) 22%, transparent);
  --shadow: 0 1px 2px rgb(0 0 0 / .06), 0 12px 40px rgb(0 0 0 / .16);
}
@media (prefers-color-scheme: dark) {
  :root { --surface:#16161c; --surface-2:#1e1e26; --text:#f2f2f5; --muted:#9a9aa8; }
}
```

## Anti-patterns (do not do)

- Inline form dumped under a heading that says "Contact Me"
- `alert()`, `confirm()`, or native validation bubbles
- Placeholder-only labels
- Native `<select>` / default checkbox in the final UI
- Success shown only by a text line that appears below the form
- Clearing the form on error
- Modal without focus trap or Esc handling
- Animations that ignore `prefers-reduced-motion`
- Lorem ipsum or "Your Name Here" copy left in place

## Review Checklist (run before delivering)

- [ ] CTA opens a modal; focus moves in, traps, and returns on close
- [ ] Esc, overlay click, and close button all behave correctly (and guard dirty state)
- [ ] Every field is custom-styled with label animation, status slot, and reserved error line
- [ ] No native select/checkbox/radio/date visible
- [ ] Live validation works; first invalid field gets focus on failed submit
- [ ] Toasts fire for success, error (with Retry), copy, and draft restore
  - [ ] All five states in the state machine are visually distinct
- [ ] Draft persistence works and fails gracefully
- [ ] Reduced-motion and keyboard-only use verified
- [ ] Mobile viewport (≈375px) checked: modal becomes a bottom sheet or full-screen, tap targets ≥ 44px
- [ ] Backend swap point is clearly marked with a comment

## Output Expectations

Deliver the flow as working code integrated into the user's project (or a single self-contained HTML file if starting fresh), plus a short note listing: which variant was chosen, where to plug in the real endpoint, and which tokens map to the site's theme. Keep explanation brief; the UI is the deliverable.
