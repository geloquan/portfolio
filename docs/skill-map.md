# Skill map

## Scope and sources

This rebuild applies repository skills to an existing React 18, TypeScript, and Vite portfolio. Factual claims are grounded in `cv.md`, existing project source, and currently configured media. Unverified project details, publication status, and contact delivery are not converted into claims. See [`page-outline.md`](page-outline.md) for the narrative and project signature; see [`portfolio-audit.md`](portfolio-audit.md) for the pre-existing audit and final evidence.

| Skill | Application | Verification / limit |
|---|---|---|
| `antislop` | Set direction and ENERGY/RHYTHM/MOTION before implementation; test every visual choice for purpose, identity, completeness, and evidence. | The governing repository skill files were not present in `.github/skills` in this checkout, but its rules were loaded in session. Record the final gate in the audit. |
| `antislop-ui` | Use content-driven composition, visual hierarchy, intentional motion, and no template filler. | The governing repository skill file is not present in this checkout; loaded instructions apply. |
| `antislop-copywriting` | Keep portfolio copy specific, human, and free of prohibited em dash punctuation or unsupported promotional claims. | The governing repository skill file is not present in this checkout; loaded instructions apply. |
| `antislop-human` | Preserve keyboard operation, visible focus, contrast, touch targets, and reduced-motion behavior. | The governing repository skill file is not present in this checkout; loaded instructions apply. |
| `antislop-layoutmobile` | Design and verify layouts at narrow widths without overflow or clipped controls. | The governing repository skill file is not present in this checkout; loaded instructions apply. |
| `no-slop-ui` | Reject generic component and copy patterns; retain only techniques serving real content. | The skill file is not present in this checkout; loaded instructions apply. |
| `organic-tactile-ui` | Preserve the existing tactile theme and restrained physical feedback while keeping contrast and affordances accessible. | Existing implementation asset is named `assets/tacktile.css`, while the skill refers to `tactile.css`; shared `src/theme.css` remains the actual color source. |
| `tactile-theme-modes` | Reuse single-source light/dark theme tokens, verify contrast and hardcoded-color scan, preserve first-paint theme behavior. | Theme stylesheet and checker are present. Run contrast and scan after implementation. |
| `portfolio-project-showcase` | Use an evidence-led index/detail composition, lead with the strongest sourced work, and mark absent media and unverified project facts honestly. | Existing data includes one project requiring owner verification and optional environment-provided media. |
| `portfolio-contact-flow` | Keep a single-step modal, custom labeled fields, inline validation, preserved draft, async toasts, and the honest backend swap point. | No trusted endpoint is configured. Do not claim the form sends; direct email is the working route. |
| `visual-storytelling-design` | Apply a context → question → evidence → resolution narrative and progressive reading order. | Skill `SKILL.md` is effectively empty and referenced `storytelling-patterns.md` was not found in the current checkout. The available narrative-techniques reference informs the outline. |

## Design read

Reading this as a one-page engineering portfolio for technical hiring managers and collaborators, in an editorial field-index language over the existing organic tactile slate/forest theme, dial **ENERGY 2 / RHYTHM 3 / MOTION 2**. The open composition and serif display voice make the page recognizably personal; section rhythm varies because work evidence, chronology, and research need different reading structures. Motion is limited to purposeful section reveals, not decorative choreography.

## Decision ledger

- **Palette:** Keep the established theme tokens because the existing portfolio already has an accessible, paired light/dark identity; reserve brass for active emphasis and the main action.
- **Layout:** Use an editorial project index with a featured first case because the strongest evidence is concentrated in one real system and remaining projects vary in proof quality.
- **Typography:** Use the shared Georgia display serif and system sans tokens because the portfolio's tactile identity is already established and legibility must remain reliable without adding a font dependency.
- **Spacing and shape:** Use generous, varied editorial sections with restrained tactile surfaces because project evidence needs room and repeated equal cards would flatten its hierarchy.
- **Imagery:** Use only existing, configured, dimensioned media and factual portrait imagery; otherwise show an explicit media-unavailable state, never stock or invented work.
- **Motion:** Use ScrollTrigger to reveal narrative sections and emphasize reading progress; maintain static visibility and honor reduced motion because motion should orient, not gate content.
- **Contact:** Retain the modal inquiry form but disclose that delivery is unavailable until a trusted server endpoint is configured; email links provide the real route.
