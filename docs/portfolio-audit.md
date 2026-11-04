# Portfolio skill and content audit

## Scope and evidence

This audit covers the portfolio UI against the repository skills `organic-tactile-ui`, `portfolio-contact-flow`, `portfolio-project-showcase`, and `tactile-theme-modes`. Public professional claims should be checked against `cv.md` and `cv-quanico.pdf`; those sources report facts but do not independently establish that every detail is current or cleared for publication. Items not established by the available CV or project files remain clearly marked for owner verification in the UI and are listed in [`TODOs.md`](../TODOs.md). No private contact data or credentials belong in public metadata.

## Skill findings

### Organic tactile UI

- Theme tokens and raised/sunken surfaces are centralized in `src/theme.css`; components use shared surface, text, accent, focus, and shadow tokens.
- Project surfaces and preview frames have tactile treatments. Motion and interaction feedback are implemented with reduced-motion considerations and optional haptic/sound feedback.
- Keyboard focus, contrast, and narrow layouts should be checked in a real browser at launch; the automated contrast check is not a substitute for visual/accessibility review.

### Portfolio contact flow

- The primary contact action opens a native dialog. The form is not embedded as a bare inline section.
- Custom-styled, labeled fields, inline validation, a submission state model, toast feedback, draft persistence, keyboard handling, and a backend swap point are present.
- **Important limitation:** `sendInquiry` intentionally rejects because no endpoint is configured. The form clearly warns that messages are not delivered; do not advertise it as working until the owner configures and tests a trusted server-side endpoint.
- A launch review must exercise focus entry/trapping/return, dirty-close and undo, storage-denied behavior, live validation, reduced motion, all toast outcomes, and mobile viewport behavior. Do not treat static code inspection as proof of these interactions.

### Portfolio project showcase

- Project entries communicate category, role, evidence, and technology context and use project media when configured.
- Medical Arts details and some media are intentionally not asserted without source evidence. Configure authorized media and verify the content using [`TODOs.md`](../TODOs.md).
- The research spotlight includes the bundled thesis PDF. Confirm publication status/date and public distribution rights before promoting it as a publication.

### Tactile theme modes

- Light and dark theme tokens are provided in `src/theme.css`; theme aliases are defined for both modes.
- Automated token contrast verification is recorded below. The broad scanner can also inspect immutable skill-reference examples, so its repository-wide duplicate/color warnings must not be mistaken for app-source violations.
- Theme-color metadata and the pre-paint theme behavior should be visually tested in both modes and in browser chrome.

## CV coverage and claim handling

| CV evidence | Portfolio treatment |
|---|---|
| Rosian Liaison Services, Jan–Oct 2026, with CV-reported task/workload/overhead metrics | Work-history content uses CV-reported experience; retain the source context and verify dates/metrics are still intended for public display. |
| Adventist Medical Center Bacolod, Jun 2025–Jan 2026 | Work-history entry; avoid adding unverified project details. |
| Riverside, Mar–Jun 2025 | Work-history entry; avoid adding unverified project details. |
| Best Thesis, 19th ICT EXPO 2025 | Research distinction is attributed as CV-reported. |
| ICT Olympics 2024 Champion | Achievement is represented using the CV entry. |
| Seashell computer-vision paper; CV lists publication in Sep 2026 | Publication date/status is explicitly marked for owner verification because it is future-relative and needs a confirmed public source. |
| Private phone/contact information | Excluded from public structured metadata. |

Descriptions of specific project roles, exact stacks, features, dates, performance results, media, and publication links must not be inferred from a title alone. See [`TODOs.md`](../TODOs.md).

## Validation record

Run these checks after making changes:

- `npm run build` — passed; TypeScript and Vite production build completed.
- `npm run check:placeholders` — passed; reviewed existing verification markers are allowlisted, and new markers fail the check.
- `py -3 .github\\skills\\tactile-theme-modes\\scripts\\theme_check.py contrast src\\theme.css` — passed for light and dark tokens.
- `git diff --check` — passed; only Git's LF-to-CRLF working-copy notices were emitted.
- `npm run lint` — blocked by the repository's ESLint 9 flat-config incompatibility (`plugins` is an array of strings); this is not a passing lint result.

Automated checks do not replace owner verification, screen-reader/keyboard checks, or testing at mobile and desktop sizes. Update this record with actual final run results before treating the audit as release sign-off.
