# Mode pitfalls: why a theme "looks off"

Read when a screen looks wrong in one mode after the tokens are in place. Contents: raised surfaces, text, accents, images and media, overlays, form controls, charts and embeds, switching, Tailwind and libraries.

## Raised and sunken surfaces
- **Flat in light mode.** The highlight (`#ffffff`) is only 1.23:1 against the light surface, so depth is subtle by nature. If raised and sunken are hard to tell apart, increase the offsets for light only (do not change the palette):
  ```css
  @media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) { --elev-md-d: 8px; --elev-md-b: 20px; } }
  :root[data-theme="light"] { --elev-md-d: 8px; --elev-md-b: 20px; }
  ```
  (This relies on the `--elev-*` variables from tactile.css; load it before or after consistently.)
- **Dirty halo in light mode.** A shadow using `rgba(0,0,0,x)` turns the warm parchment gray. Shadows must use `--shadow-dark-sink`.
- **Invisible highlight in dark mode.** Hand-written `rgba(255,255,255,.05)` highlights look blue-gray. Use `--shadow-light-source`.

## Text
- Small muted text is the most common contrast failure. Use `--color-text-secondary`.
- Placeholder text uses secondary (already set in `theme.css`), not muted.
- Disabled text can be muted; disabled controls also lose their relief, so contrast is not the only cue.

## Accents
- Brass on light: fills, icons, borders, and the focus ring are fine. Small text and links use `--color-accent-warm-text`.
- Moss in dark is nearly the same value as the surface. Do not use it for text, icons, or any boundary that carries meaning.
- Brass fills need `--color-on-accent` for their label; white labels on light brass are only 3.9:1.
- Status colors: use `--color-danger` and `--color-success`, never a Tailwind red/green. Pair the color with an icon or text so state is not color-only.

## Images, logos, and media
- A transparent PNG or SVG logo drawn in dark ink vanishes in dark mode. Prefer SVG with `fill="currentColor"`, or ship both variants:
  ```html
  <picture>
    <source srcset="logo-dark.svg" media="(prefers-color-scheme: dark)" />
    <img src="logo-light.svg" alt="" />
  </picture>
  ```
  A forced `data-theme` bypasses that media query; for a manual toggle, swap by `resolved` from `useTheme()` instead.
- Photos glare on a dark ground. A gentle `img { filter: brightness(.92); }` in dark mode helps; apply it through a token-driven class, not by editing every image.
- Screenshots of the app in marketing sections show one mode. Choose deliberately, or provide both.

## Overlays and elevation layers
- Modal and drawer scrims: `background: var(--color-scrim)`. `rgba(0,0,0,.5)` is too heavy over parchment and too weak over slate.
- Layered surfaces: a card on a card should not use the same surface token twice (it disappears). Use sunken or hover tint for the inner layer.

## Form controls, scrollbars, selection
- Missing `color-scheme` leaves native inputs, date pickers, and scrollbars light in dark mode. `theme.css` sets it; also keep the `<meta name="color-scheme">` in `<head>`.
- Autofill backgrounds can ignore your tokens in Chrome. If a filled input turns bright yellow or blue, override with an inset box-shadow or `-webkit-autofill` rule using `--color-bg-surface`.

## Charts, canvas, maps, and embeds
- Libraries that take literal colors (Recharts, Chart.js, Canvas) need real values: read tokens with `useToken()` and re-render when the theme changes. A chart that keeps the old palette after toggling is almost always a cached color array.
- Third-party iframes and widgets cannot read your variables. Use their own light/dark option and pass `resolved`.

## Switching
- Without the pre-paint script, a dark-mode user sees a light flash on load. Install `theme-init.html`.
- Animating through the switch makes shadows and colors tween between palettes and look muddy for 200ms. `ThemeProvider` freezes transitions for the switch.
- Keep `theme-color` in sync or mobile browsers show a mismatched bar at the top.

## Tailwind and component libraries
- Map tokens, do not duplicate palettes:
  ```js
  colors: { base: "var(--color-bg-base)", surface: "var(--color-bg-surface)", ink: "var(--color-text-primary)",
            secondary: "var(--color-text-secondary)", brass: "var(--color-accent-warm)", "brass-text": "var(--color-accent-warm-text)",
            moss: "var(--color-accent-earth)", danger: "var(--color-danger)", success: "var(--color-success)" }
  ```
  With variable-backed colors there is no need for `dark:` classes. If Tailwind opacity modifiers (`bg-base/50`) are needed, define colors as `color-mix` functions or provide RGB channel variables.
- MUI / Chakra / Ant: set the theme's palette, background, text, and shadow values to the CSS variables once (or generate light and dark theme objects from `useToken`), and turn off the library's built-in dark palette so there is one source.

## Final checklist
- [ ] `theme_check.py contrast` passes and `scan` shows zero errors.
- [ ] Both modes viewed on at least: a form, a card grid, a modal, a table, an empty state.
- [ ] Hover, focus-visible, pressed, disabled, error, selected states viewed in both modes.
- [ ] No flash on hard reload in either mode; mobile `theme-color` matches the page.
- [ ] Images, logos, and charts are legible in both modes.
