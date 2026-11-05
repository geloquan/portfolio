import {useCallback, useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import dictionary from './claims.overlay.json'
import type {ClaimsDictionary} from './types'
import './ClaimLayer.css'

const claims = (dictionary as ClaimsDictionary).claims
const draftVisible = () => import.meta.env.DEV || new URLSearchParams(window.location.search).get('claims') === 'draft'
const visibleClaims = Object.entries(claims).filter(([, entry]) => entry.status === 'explained' || (entry.status === 'draft' && draftVisible()))
type Position = {top: number; left: number}

function findTarget(id: string) {
  return document.querySelector<HTMLElement>(`[data-claim-id="${id}"]`)
}

export default function ClaimLayer() {
  const [positions, setPositions] = useState<Map<string, Position>>(new Map())
  const [activeId, setActiveId] = useState<string | null>(null)
  const [popoverPosition, setPopoverPosition] = useState<Position>({top: 8, left: 8})
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const popoverRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const active = activeId ? claims[activeId] : undefined

  const updatePositions = useCallback(() => {
    const next = new Map<string, Position>()
    visibleClaims.forEach(([id]) => {
      const target = findTarget(id)
      if (!target) return
      const rect = target.getBoundingClientRect()
      next.set(id, {
        top: Math.max(0, Math.min(rect.top + (rect.height - 24) / 2, window.innerHeight - 28)),
        left: Math.max(0, Math.min(rect.right - 24, window.innerWidth - 28)),
      })
    })
    setPositions(next)
  }, [])

  const close = useCallback((restoreFocus = false) => {
    window.clearTimeout(closeTimer.current)
    setActiveId(null)
    if (restoreFocus && activeId) buttonRefs.current.get(activeId)?.focus()
  }, [activeId])

  useEffect(() => {
    updatePositions()
    const observer = new ResizeObserver(updatePositions)
    visibleClaims.forEach(([id]) => {
      const target = findTarget(id)
      if (target) observer.observe(target)
    })
    window.addEventListener('resize', updatePositions)
    window.addEventListener('scroll', updatePositions, true)
    window.addEventListener('load', updatePositions)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updatePositions)
      window.removeEventListener('scroll', updatePositions, true)
      window.removeEventListener('load', updatePositions)
    }
  }, [updatePositions])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && activeId) {
        event.preventDefault()
        close(true)
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!activeId) return
      const target = event.target as Node
      if (popoverRef.current?.contains(target) || buttonRefs.current.get(activeId)?.contains(target) || findTarget(activeId)?.contains(target)) return
      close()
    }
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [activeId, close])

  useEffect(() => {
    const cleanups: Array<() => void> = []
    visibleClaims.forEach(([id]) => {
      const target = findTarget(id)
      if (!target) return
      const show = () => {
        window.clearTimeout(closeTimer.current)
        setActiveId(id)
      }
      const hide = () => {
        closeTimer.current = window.setTimeout(() => {
          if (!popoverRef.current?.matches(':hover')) setActiveId((current) => current === id ? null : current)
        }, 150)
      }
      target.addEventListener('pointerenter', show)
      target.addEventListener('pointerleave', hide)
      target.addEventListener('focusin', show)
      target.addEventListener('focusout', hide)
      cleanups.push(() => {
        target.removeEventListener('pointerenter', show)
        target.removeEventListener('pointerleave', hide)
        target.removeEventListener('focusin', show)
        target.removeEventListener('focusout', hide)
      })
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [positions])

  useEffect(() => {
    if (!activeId) return
    const target = findTarget(activeId)
    const popover = popoverRef.current
    if (!target || !popover) return
    const rect = target.getBoundingClientRect()
    const bounds = popover.getBoundingClientRect()
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - bounds.width - 8))
    const below = rect.bottom + 8
    const top = below + bounds.height <= window.innerHeight - 8 ? below : Math.max(8, rect.top - bounds.height - 8)
    setPopoverPosition({top, left})
  }, [activeId, positions])

  if (typeof document === 'undefined' || positions.size === 0) return null
  return createPortal(
    <div className="cx-layer" aria-live="polite">
      {visibleClaims.map(([id, entry]) => {
        const position = positions.get(id)
        if (!position) return null
        return <button
          key={id}
          ref={(button) => { if (button) buttonRefs.current.set(id, button); else buttonRefs.current.delete(id) }}
          type="button"
          className="cx-trigger"
          style={{top: position.top, left: position.left}}
          aria-label={`Explain: ${entry.text}`}
          aria-expanded={activeId === id}
          onFocus={() => setActiveId(id)}
          onClick={() => setActiveId((current) => current === id ? null : id)}
          onBlur={() => {
            if (!popoverRef.current?.matches(':hover')) setActiveId((current) => current === id ? null : current)
          }}
        >i</button>
      })}
      {active && <div
        ref={popoverRef}
        className="cx-popover"
        role="dialog"
        aria-modal="false"
        style={{top: popoverPosition.top, left: popoverPosition.left}}
        onPointerEnter={() => window.clearTimeout(closeTimer.current)}
        onPointerLeave={() => setActiveId(null)}
      >
        <h2>{active.text}</h2>
        <p className="cx-meaning">{active.explanation?.meaning}</p>
        {active.explanation?.basis && <p><span>Basis</span>{active.explanation.basis}</p>}
        {active.explanation?.context && <p><span>Context</span>{active.explanation.context}</p>}
        {active.explanation?.fine_print && <p><span>Fine print</span>{active.explanation.fine_print}</p>}
      </div>}
    </div>,
    document.body,
  )
}
