---
name: organic-tactile-ui
description: Design system for "Organic Minimalism & Immersive Tactile UI", a dark, earthy, neumorphic interface style where components look sculpted from slate, stone, and brushed brass, with serif display type, generous negative space, raised and sunken surfaces, and low haptic and audio feedback. Use this skill whenever the user asks to build, style, or restyle any web UI (landing pages, dashboards, portfolios, forms, app screens, components) in this aesthetic, or mentions organic minimalism, tactile UI, neumorphism, soft UI, sculpted or carved surfaces, earthy dark themes, brass or moss accents, or wants an interface that "feels physical". Also use it when extending an existing project that already uses these tokens. Includes ready-made CSS tokens and components, a haptic and sound helper, and accessibility rules that keep neumorphism usable.
---

# Organic Minimalism & Immersive Tactile UI

An interface that feels like a heavy, elegant instrument carved from raw materials (slate, stone, dark wood, brushed brass). Expansive negative space, soft forms that emerge from the canvas, and quiet physical feedback.

The weakness of this style is well known: neumorphism has low contrast, unclear boundaries, and poor affordances. The rules below keep the atmosphere and fix those problems, so the result is beautiful and usable. Where a rule seems to conflict with accessibility, accessibility wins and the material metaphor adapts.

## Workflow

1. Copy `assets/tactile.css` into the project (tokens, surfaces, components). Do not retype the tokens; consume them.
2. Build layouts from the principles in this file.
3. If the design needs click feedback, add `assets/feedback.js` and read `references/feedback.md` for the rules on haptics and sound.
4. Run the checklist at the end before delivering.

## 1. Philosophy

Reject sterile flat layouts. Every surface has a light source (top-left), a material, and a weight. Elements are either **raised** out of the surface or **pressed** into it. Nothing floats on top as a flat color block.

Never use `#000000`, `#FFFFFF`, or saturated digital primaries. Every color mimics natural light, shadow, and earth.

## 2. Tokens

Defined in `assets/tactile.css`. The core set:

| Role | Token | Value |
|---|---|---|
| Canvas | `--color-bg-base` | `#121614` midnight forest slate |
| Surface | `--color-bg-surface` | `#1E2220` sculpted surface |
| Text | `--color-text-primary` | `#E5E8E6` morning mist |
| Muted text | `--color-text-muted` | `#8A928E` weathered stone |
| Accent (warm) | `--color-accent-warm` | `#D4AF37` brushed brass |
| Accent (earth) | `--color-accent-earth` | `#4F5D53` moss lichen |
| Light shadow | `--shadow-light-source` | `#292F2C` |
| Dark shadow | `--shadow-dark-sink` | `#0B0E0D` |

Additions beyond the base palette, each there for a reason:
- `--color-accent-warm-dim`: brass at lower intensity for hover and large decorative use, so full brass stays rare and meaningful.
- `--color-danger` (`#B5654A`, terracotta) and `--color-success` (`#7F9B72`, sage): status colors drawn from the same earth family. Pure red and green would break the atmosphere.
- Elevation levels (`sm`, `md`, `lg`) and a spacing scale, so depth and rhythm stay consistent instead of ad hoc.

**Brass is an accent, not a fill.** Use it for focus rings, active indicators, key numerals, thin rules, and one primary call to action per view. If more than about 5% of a screen is brass, it stops looking like metal and starts looking like yellow.

## 3. Typography

- **Headings: sharp serif** (Playfair Display, Cinzel, Editorial New, or Cormorant). Treat them as stone-carved markers: large, authoritative, generous space above and below. Use light-to-regular weights at large sizes; heavy weights smudge on dark grounds.
- **Body and interface: clean geometric sans** (Inter, SF Pro, or similar) for utility and legibility.
- Optional third voice: a quiet mono for tiny labels or numerals, only if the design benefits.
- Body text: at least 16px, line height 1.6 to 1.75. Letter-spacing slightly open (`0.01em`) on small uppercase labels.
- Muted text is for secondary information only. Never use it for essential content or at sizes below 14px.

## 4. Space and shape

- **Double the usual padding.** If a card would normally have 16px, give it 32px. If a section would have 64px between blocks, use 120 to 160px. Layouts should feel like open clearings and wide vistas.
- **Radii**: 16px to 32px. Nothing has a sharp corner. For a hand-finished feel, vary corners slightly on large hero surfaces (for example `28px 36px 30px 40px`), but keep small controls consistent so they remain predictable.
- **No hard borders and no flat color blocks.** Separation comes from light and shadow. Hairlines are allowed only as 1px low-contrast rules between sections (use `--color-accent-earth` at low opacity), never as outlines around components.
- **Surface texture** (optional flourish): a very faint noise or grain overlay on the base canvas at 3 to 5% opacity makes the slate feel mineral instead of digital. `tactile.css` includes `.grain`.

## 5. Surfaces and components

All of these are in `assets/tactile.css`.

| Class | Use |
|---|---|
| `.tactile-raised` | Buttons, active cards, anything pressable or prominent |
| `.tactile-sunken` | Inputs, selected states, wells, tracks |
| `.tactile-flush` | Containers that belong to the surface but carry no emphasis |
| `.tactile-button` | Raised button that sinks on press |
| `.tactile-toggle` | Latch-style switch: a raised knob in a sunken track |
| `.tactile-input` | Sunken text field with brass focus ring |
| `.tactile-card` | Raised card with generous padding |
| `.tactile-nav-item` | Nav item: flush by default, sunken when current |

**Smooth raised to sunken transitions.** CSS cannot animate between an outer shadow and an inset shadow unless both states list the same number of shadows in the same order. The stylesheet always declares four layers (two outer, two inset) and zeroes out the unused pair. If you write your own component, follow the same pattern or the `200ms` switch will snap instead of animate.

**Light direction is global.** Highlight top-left, shadow bottom-right, everywhere. Never mix directions on one screen.

**Hierarchy through depth.** Use the elevation scale: `sm` for small controls, `md` for cards, `lg` for the one or two hero surfaces. Deeper means more important.

## 6. Interaction

- **State switch**: raised to sunken animates `box-shadow` over `200ms` with an ease-out curve (`--ease-out`). Add a 1px downward `translateY` on press to sell the weight.
- **Hover**: a slight increase in highlight and a shift of the surface color a few percent lighter. No bright color flashes.
- **Focus**: every interactive element has a visible brass focus ring (`:focus-visible`). Neumorphic shadows alone are not a valid focus indicator.
- **Disabled**: flatten the surface (`tactile-flush`), drop opacity to about 0.5, and set `cursor: not-allowed`. A disabled control should look like it has lost its relief.
- **Haptic and audio feedback** on click or toggle: a single deep pulse and a low mechanical thud, like a heavy latch. See `references/feedback.md`. This is a flourish layered on top of visual feedback, never the only signal.

## 7. Accessibility guardrails

These keep the style from failing real users.

- **Contrast**: body text and controls must meet WCAG AA (4.5:1 for text, 3:1 for UI boundaries and focus). `--color-text-muted` on `--color-bg-surface` passes for normal text; check any new pairing. Do not place muted text on `--color-accent-earth`.
- **Affordance**: raised surfaces look pressable, so do not use `tactile-raised` for static content. Reserve it for interactive elements and primary containers; use `tactile-flush` for the rest.
- **State is never shadow-only**: selected, checked, and error states also change something visible beyond shadow (a brass indicator, an icon, a label, or `aria-*` state exposed in markup).
- **Reduced motion**: `prefers-reduced-motion: reduce` shortens transitions to near-instant and disables parallax and press translation. Haptics and sound follow the same preference by default.
- **Contrast and forced colors**: `prefers-contrast: more` strengthens shadows and adds a visible 1px outline; `forced-colors: active` falls back to system colors with real borders. The stylesheet handles both.
- **Touch targets**: 44px minimum.
- **Sound**: opt-in friendly. Never play audio before the first user gesture, always provide a mute control, and remember the choice. See `references/feedback.md`.

## 8. Anti-patterns

- Pure black, pure white, or neon accents.
- Flat, bordered boxes, or a flat Material-style card dropped into this system.
- Drop shadows that only go downward (that is generic elevation, not a dual-light sculpt).
- Shadows so faint that raised and flat elements are indistinguishable. If you can't tell at arm's length, increase the light and dark shadow gap.
- Mixing high-pitched chimes, bouncy springs, or playful easing with this material language. Motion is slow, weighty, and ends softly.
- Brass everywhere.
- Tight layouts. If the design feels efficient, it is probably too dense for this system.

## 9. Delivery checklist

- [ ] Tokens consumed from `tactile.css`, no hardcoded duplicates.
- [ ] One light direction throughout.
- [ ] Heading serif and body sans loaded with fallbacks, and display sizes are generous.
- [ ] Spacing is roughly double a standard layout.
- [ ] Every interactive element has hover, focus-visible, active, and disabled states.
- [ ] Selected and error states are distinguishable without relying on shadow.
- [ ] Contrast verified, reduced-motion and sound mute respected.
- [ ] Brass used sparingly.
- [ ] Looks correct at about 360px wide: shadows scale down (the stylesheet shrinks offsets on small screens) and padding stays generous but not wasteful.
