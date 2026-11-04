---
name: tactile-theme-modes
description: Apply the Organic Minimalism light and dark color theme (slate/forest dark #0e1110 with brass, parchment light #efefea) to a React app and make both modes accurate, accessible, and consistent so neither looks off. Use whenever the user wants this palette applied, asks for light/dark or dark mode support, a theme toggle, "system theme", prefers-color-scheme tokens, fixes washed-out, muddy, low-contrast, or flashing colors in one mode, or wants to verify theme colors. Installs the token stylesheet with measured contrast fixes, adds an optional React ThemeProvider with a pre-paint script (no flash), and runs scripts that check WCAG contrast, dark-value drift, and mode-specific hardcoded colors. Works alongside organic-tactile-ui.
---

# Tactile Theme Modes

Applies the earthy light and dark palette and keeps both modes correct. Most "dark mode looks off" bugs are not taste problems; they are measurable: a hex typed into a component, a color that only works on one background, brass used as small text on a light ground, a shadow that is `rgba(0,0,0,.3)` in both modes. This skill removes those causes at the source (one token file) and verifies the result with scripts.

## The palette

| Token | Dark | Light |
|---|---|---|
| `--color-bg-base` | `#0e1110` | `#efefea` |
| `--color-bg-surface` | `#1a1e1c` | `#e8e8e1` |
| `--color-text-primary` | `#e3e8e5` | `#1c221f` |
| `--color-text-muted` | `#7d8581` | `#6b7470` |
| `--color-accent-warm` (brass) | `#c5a059` | `#9e7b3b` |
| `--color-accent-earth` (moss) | `#3a4740` | `#5d6b63` |
| `--shadow-light-source` | `#242a27` | `#ffffff` |
| `--shadow-dark-sink` | `#060807` | `#d1d1c4` |

These eight are used exactly as supplied. `assets/theme.css` adds a small set of tokens because measuring the palette shows where it falls short:

| Finding (WCAG contrast) | Added token | Rule |
|---|---|---|
| Muted text is 4.45:1 on surface in dark and 3.9 to 4.2:1 in light, below 4.5 for small text | `--color-text-secondary` | Any readable small text uses secondary. Muted is for disabled, decorative, or large text. |
| Light brass is 3.2 to 3.4:1, fine for icons, fills, and the focus ring, too low for small text | `--color-accent-warm-text` | Small brass text and brass links use this token. |
| Dark moss is 1.7 to 1.95:1 on the grounds | (none) | Moss is for fills and hairlines only, never text or a required boundary. |
| Labels on brass and moss fills | `--color-on-accent`, `--color-on-earth` | Use these on filled accent surfaces. |
| Status colors must differ per mode | `--color-danger`, `--color-success` | Terracotta and sage, tuned for 4.5:1 in each mode. |

Hover, dim, hairline, and scrim colors are derived with `color-mix()` from the tokens, so they are correct in both modes automatically.

## Workflow

### 1. Install the tokens
- Copy `assets/theme.css` into the project and import it once at the app entry, before component styles.
- **One source of truth.** If `tactile.css` (from organic-tactile-ui) or any other file also declares `--color-*` or `--shadow-*` values, delete those color declarations there (keep spacing, radius, and motion tokens). Two sources are how the modes drift apart. The scanner reports `DUPLICATE_TOKEN_SOURCE`.
- Resolution order in `theme.css`: light is the default, the OS dark preference switches to dark, and `[data-theme="light" | "dark"]` is an explicit user choice. The dark values appear twice in plain CSS, once in the media query and once for the attribute; the contrast script fails if they differ.
- The pure-white light-mode highlight (`--shadow-light-source: #ffffff`) is deliberate: a highlight must be lighter than the surface. It carries an ignore comment so the audit scripts accept it.

### 2. Add the first-paint fix and (optionally) a switcher
- Always: paste `assets/theme-init.html` into `<head>` after the stylesheet link. It sets `color-scheme` and `theme-color` metas and applies a saved choice before first paint.
- Only if the app needs a user-facing switch (system / light / dark): copy `assets/ThemeProvider.tsx`, wrap the app in `<ThemeProvider>`, and render `<ThemeToggle />`. It listens for OS changes live, persists the choice, freezes transitions during the switch so shadows don't animate between palettes, and keeps the mobile browser chrome color in sync. If the app follows the OS only, skip it and leave the CSS alone.
- Charts, canvas, and anything needing a literal color: call `useToken("--color-accent-warm")`, which re-reads when the theme changes.

### 3. Migrate components to tokens
Run the scan (step 5) to list what needs changing, then:
- Replace hex, `rgb()`, `hsl()`, named colors, and Tailwind palette classes with `var(--color-...)` (or Tailwind classes mapped to the tokens; see `references/mode-pitfalls.md`).
- Delete per-component `prefers-color-scheme` rules and Tailwind `dark:` overrides; the tokens already switch.
- Replace `rgba(0,0,0,x)` and `rgba(255,255,255,x)` with the scrim token (overlays) or the shadow tokens (shadows).
- Swap `filter: invert()` hacks for tokens or separate per-mode assets.
- Use `--color-text-secondary` for small text that currently uses muted, and `--color-accent-warm-text` for small brass text.

### 4. Verify the tokens
```bash
python <skill>/scripts/theme_check.py contrast src/theme.css          # add --suggest for fix values
```
Checks WCAG contrast for every key pair in both modes, token completeness, and light/dark drift. Required: 4.5:1 for small-text tokens, 3:1 for UI and large-text tokens. Exit code 1 on any failure. If the user later changes a hex, re-run this; it proposes the nearest passing value.

### 5. Scan the app
```bash
python <skill>/scripts/theme_check.py scan <project-root> --json /tmp/theme-scan.json
```
Reports hardcoded colors, translucent black/white, Tailwind fixed and `dark:` classes, per-component mode logic, invert filters, a missing `color-scheme`, a missing `theme-color`, a missing pre-paint script, and duplicate token sources. Fix errors first, then warnings. Mark a genuine exception (a brand logo with a fixed color) with `/* theme-ignore: reason */` on the same or previous line.

### 6. Look at it in both modes
The scripts cannot judge appearance. If you can run the app, check every screen in both modes with the OS preference emulated (or the toggle), in every state: hover, focus, pressed, disabled, error, selected. Read `references/mode-pitfalls.md` for the specific things that look off (raised surfaces flattening in light, images glaring in dark, charts keeping old colors, form controls staying light). If you cannot view the UI, say the visual check was not done.

### 7. Report
Before and after scan counts, contrast result, files changed, exceptions added, the added tokens and why (so the user knows the palette was extended and where), and what was not verified.

## Rules to keep

- Components never contain color values. Every color is a token; every translucent color is `color-mix()` of a token.
- Light and dark are tuned separately, not inverted. Surface is lighter than base in dark and darker than base in light; that is intentional, it is what keeps raised surfaces looking extruded in both.
- Text on a fill uses the matching `on-*` token.
- Do not add a third mode-specific color without measuring it: add it to both modes in `theme.css` and run the contrast check.
