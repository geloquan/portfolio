const KEY = 'tactile-feedback'
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let context
let enabled = (() => {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(KEY) !== 'off' && !reduceMotion()
  } catch {
    return !reduceMotion()
  }
})()

export const isFeedbackEnabled = () => enabled

export function setFeedbackEnabled(on) {
  enabled = typeof window !== 'undefined' && Boolean(on) && !reduceMotion()
  try {
    localStorage.setItem(KEY, enabled ? 'on' : 'off')
  } catch {
    // In-memory preference remains available when storage is blocked.
  }
}

function playThud() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextConstructor) return
  context ??= new AudioContextConstructor()
  if (context.state === 'suspended') void context.resume()

  const now = context.currentTime
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(110, now)
  oscillator.frequency.exponentialRampToValueAtTime(70, now + 0.12)
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.14, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + 0.16)
}

export function tactileFeedback(_element) {
  if (typeof window === 'undefined' || !enabled || reduceMotion()) return
  if ('vibrate' in navigator) navigator.vibrate(18)
  try {
    playThud()
  } catch {
    // Audio is optional; the visual interaction remains complete.
  }
}
