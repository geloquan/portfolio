interface Window {
  webkitAudioContext?: typeof AudioContext
}

export function isFeedbackEnabled(): boolean
export function setFeedbackEnabled(enabled: boolean): void
export function tactileFeedback(element?: HTMLElement): void
