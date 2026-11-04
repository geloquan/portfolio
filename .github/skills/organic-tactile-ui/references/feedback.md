# Haptic and audio feedback

Read this when adding the click/toggle "heavy latch" response.

## Contents
- What the spec asks for
- Platform reality
- Rules
- Usage
- Mute control

## What the spec asks for
On click or toggle: a single, low-frequency, deep haptic pulse, plus a low-pitched mechanical thud. No high-pitched digital chimes.

## Platform reality
- **Haptics**: `navigator.vibrate()` works on most Android browsers. iOS Safari does not support it. In recent Safari versions, a native `<input type="checkbox" switch>` produces system haptics on toggle, which is the only web route on iPhone. Treat haptics as progressive enhancement; always feature-detect.
- **Audio**: browsers block audio until a user gesture, so create the `AudioContext` lazily inside a click handler (the helper does this).
- **"Sub-audible"**: truly sub-audible sound cannot be perceived, and phone speakers cannot reproduce anything below roughly 100 to 150 Hz. The helper therefore combines a low body tone (about 110 Hz dropping to 65 Hz) with a 12ms low-passed noise transient. On a laptop it reads as a deep thud; on a phone it reads as a soft mechanical click.
- Prefer synthesized audio (Web Audio, as in `feedback.js`) over shipping an audio file: no download, no latency, and the pitch and decay can be tuned.

## Rules
1. Feedback is additive. The visual state change must communicate everything on its own.
2. Fire once per interaction, on `click`/toggle, not on hover, scroll, or every keystroke.
3. Keep it quiet: peak gain around 0.2, duration under 200ms.
4. Respect `prefers-reduced-motion` (the helper defaults to off in that case).
5. Always provide a visible control to mute, and persist the choice.
6. Do not use it for destructive or error states in a way that sounds celebratory; the same low thud for all actions is fine, tonal variety is not needed.

## Usage
```js
import { initTactileFeedback } from "./feedback.js";
initTactileFeedback();
```
```html
<button class="tactile-raised tactile-button" data-tactile>Save</button>
```

In React, call `tactileFeedback()` inside the existing `onClick`/`onChange` handler instead of using the data attribute.

## Mute control
Use the latch toggle component, wired to `setFeedbackEnabled`:
```html
<button class="tactile-toggle" role="switch" aria-checked="true" aria-label="Interface sounds and haptics" id="fb"><span></span></button>
<script type="module">
  import { isFeedbackEnabled, setFeedbackEnabled } from "./feedback.js";
  const t = document.getElementById("fb");
  t.setAttribute("aria-checked", isFeedbackEnabled());
  t.addEventListener("click", () => {
    const on = t.getAttribute("aria-checked") !== "true";
    t.setAttribute("aria-checked", on);
    setFeedbackEnabled(on);
  });
</script>
```
