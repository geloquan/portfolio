// Tactile feedback: one deep haptic pulse + one low mechanical "thud".
// Visual feedback is always primary; this layer is optional and user-controllable.

const KEY = "tactile-feedback"; // "on" | "off"
const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

let ctx;                 // created lazily, only after a user gesture
let enabled = (() => {
  try { return localStorage.getItem(KEY) !== "off" && !reduceMotion(); }
  catch { return !reduceMotion(); }
})();

export const isFeedbackEnabled = () => enabled;
export function setFeedbackEnabled(on) {
  enabled = !!on;
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch {}
}

function haptic() {
  // Android browsers; iOS Safari ignores this API.
  if ("vibrate" in navigator) navigator.vibrate(18);
}

function thud() {
  ctx ??= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  const t = ctx.currentTime;

  // Low body: ~80Hz sine, fast decay, with a small pitch drop for weight.
  const osc = ctx.createOscillator();
  const body = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(110, t);
  osc.frequency.exponentialRampToValueAtTime(65, t + 0.12);
  body.gain.setValueAtTime(0.0001, t);
  body.gain.exponentialRampToValueAtTime(0.22, t + 0.005);
  body.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  osc.connect(body).connect(ctx.destination);
  osc.start(t); osc.stop(t + 0.18);

  // Mechanical latch transient: 12ms of low-passed noise so phone speakers
  // (which cannot reproduce sub-100Hz) still convey a "click".
  const len = Math.floor(ctx.sampleRate * 0.012);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  const lp = ctx.createBiquadFilter();
  const click = ctx.createGain();
  lp.type = "lowpass"; lp.frequency.value = 900;
  click.gain.value = 0.12;
  src.buffer = buf;
  src.connect(lp).connect(click).connect(ctx.destination);
  src.start(t);
}

export function tactileFeedback() {
  if (!enabled) return;
  haptic();
  try { thud(); } catch {}
}

// Wire up: any element with data-tactile gives feedback on click/toggle.
// Uses pointerdown-free "click" so it only fires after a real user gesture.
export function initTactileFeedback(root = document) {
  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-tactile]")) tactileFeedback();
  });
}
