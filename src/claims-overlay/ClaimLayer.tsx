import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import dictionary from './claims.overlay.json'
import type {ClaimEntry, ClaimsDictionary} from './types'
import './ClaimLayer.css'

const claims = dictionary as ClaimsDictionary
const isDraftEnabled = import.meta.env.DEV || new URLSearchParams(window.location.search).get('claims') === 'draft'
const canUsePointerHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

function isVisible(entry: ClaimEntry) {
  return entry.status === 'explained' || (entry.status === 'draft' && isDraftEnabled)
}

export default function ClaimLayer() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const leaveTimer = useRef<number | undefined>(undefined)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const buttonsRef = useRef(new Map<string, HTMLButtonElement>())
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const popoverPosition = useRef({top: 8, left: 8})
  const [touchLayout, setTouchLayout] = useState(new Map<string, {top: number; left: number}>())

  const active = activeId ? claims[activeId] : null
  const visibleClaims = useMemo(() => Object.entries(claims).filter(([, entry]) => isVisible(entry)), [])

  const close = useCallback((restoreFocus = false) => {
    window.clearTimeout(timer.current)
    setActiveId(null)
    if (restoreFocus) buttonRef.current?.focus()
  }, [])

  const visibleFor = (id: string) => isVisible(claims[id])


  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape' && activeId && visibleFor(activeId)) close(true) }
    const onOutside = (event: PointerEvent) => {
      if (!activeId) return
      const target = event.target as Node
      if (popoverRef.current?.contains(target) || buttonRef.current?.contains(target)) return
      if (Array.from(document.querySelectorAll<HTMLElement>('[data-claim-id]')).some((el) => el.dataset.claimId === activeId && el.contains(target))) return
      close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onOutside)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onOutside) }
  }, [activeId, close])


  useEffect(() => {
    const data = new Map(visibleClaims)
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-claim-id]')).filter((el) => {
      const id = el.dataset.claimId
      return Boolean(id && data.has(id))
    })
    const cleanups: Array<() => void> = []
    targets.forEach((target) => {
      const id = target.dataset.claimId!
      const show = () => {
        buttonRef.current = buttonsRef.current.get(id) ?? null
        setActiveId(id)
      }
      const enter = () => {
        if (!canUsePointerHover) return
        window.clearTimeout(leaveTimer.current)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(show, 150)
      }
      const leave = () => {
        if (!canUsePointerHover) return
        window.clearTimeout(timer.current)
        window.clearTimeout(leaveTimer.current)
        leaveTimer.current = window.setTimeout(() => {
          if (!popoverRef.current?.matches(':hover')) setActiveId((current) => current === id ? null : current)
        }, 140)
      }
      target.addEventListener('pointerenter', enter)
      target.addEventListener('pointerleave', leave)
      target.addEventListener('focusin', show)
      target.addEventListener('focusout', leave)
      cleanups.push(() => {
        target.removeEventListener('pointerenter', enter)
        target.removeEventListener('pointerleave', leave)
        target.removeEventListener('focusin', show)
        target.removeEventListener('focusout', leave)
      })
    })

    const update = () => {
      const next = new Map<string, {top: number; left: number}>()
      targets.forEach((target) => {
        const id = target.dataset.claimId!
        const rect = target.getBoundingClientRect()
        next.set(id, {top: Math.max(0, Math.min(rect.top + rect.height / 2 - 22, window.innerHeight - 44)), left: Math.max(0, Math.min(rect.right + 4, window.innerWidth - 44))})
      })
      setTouchLayout(next)
      if (activeId && popoverRef.current) {
        const activeTarget = targets.find((target) => target.dataset.claimId === activeId)
        const rect = activeTarget?.getBoundingClientRect()
        const bounds = popoverRef.current.getBoundingClientRect()
        if (rect) {
          const left = Math.max(8, Math.min(rect.left, window.innerWidth - bounds.width - 8))
          const below = rect.bottom + 8
          const top = below + bounds.height <= window.innerHeight - 8 ? below : Math.max(8, rect.top - bounds.height - 8)
          popoverPosition.current = {top, left}
          popoverRef.current.style.top = `${top}px`
          popoverRef.current.style.left = `${left}px`
        }
      }
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.addEventListener('load', update)
    const observer = new ResizeObserver(update)
    targets.forEach((target) => observer.observe(target))
    cleanups.push(() => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('load', update)
      observer.disconnect()
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [activeId, visibleClaims])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const layer = document.createElement('div')
    layer.className = 'cx-trigger-layer'
    document.body.append(layer)
    const buttons = new Map<string, HTMLButtonElement>()
    visibleClaims.forEach(([id, entry]) => {
      const button = document.createElement('button')
      button.type = 'button'
      button.className = 'cx-trigger'
      button.textContent = 'i'
      button.setAttribute('aria-label', `Explain: ${entry.text}`)
      button.setAttribute('aria-expanded', 'false')
      button.addEventListener('focus', () => {
        buttonRef.current = button
        setActiveId(id)
      })
      button.addEventListener('click', () => {
        buttonRef.current = button
        setActiveId((current) => current === id ? null : id)
      })
      button.addEventListener('keydown', (event) => {
        if ((event as KeyboardEvent).key === 'Escape') {
          event.preventDefault()
          setActiveId(null)
          button.focus()
        }
      })
      button.addEventListener('blur', () => {
        if (!popoverRef.current?.matches(':hover')) {
          setActiveId((current) => current === id ? null : current)
        }
      })
      layer.append(button)
      buttons.set(id, button)
    })
    buttonsRef.current = buttons
    return () => {
      layer.remove()
      buttons.clear()
      buttonsRef.current.clear()
    }
  }, [visibleClaims])

  useEffect(() => {
    buttonsRef.current.forEach((button, id) => {
      button.setAttribute('aria-expanded', String(activeId === id))
      const point = touchLayout.get(id)
      if (point) {
        button.style.top = `${point.top}px`
        button.style.left = `${point.left}px`
      }
    })
  }, [activeId, touchLayout])
  useEffect(() => {
    if (!activeId || !popoverRef.current) return
    const target = Array.from(document.querySelectorAll<HTMLElement>('[data-claim-id]')).find((item) => item.dataset.claimId === activeId)
    if (!target) return
    const update = () => {
      const rect = target.getBoundingClientRect()
      const bounds = popoverRef.current?.getBoundingClientRect()
      if (!bounds || !popoverRef.current) return
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - bounds.width - 8))
      const below = rect.bottom + 8
      const top = below + bounds.height <= window.innerHeight - 8 ? below : Math.max(8, rect.top - bounds.height - 8)
      popoverPosition.current = {top, left}
      popoverRef.current.style.top = `${top}px`
      popoverRef.current.style.left = `${left}px`
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    const observer = new ResizeObserver(update)
    observer.observe(target)
    observer.observe(popoverRef.current)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      observer.disconnect()
    }
  }, [activeId])
  const handlePopoverEnter = () => {
    window.clearTimeout(timer.current)
    window.clearTimeout(leaveTimer.current)
  }
  const handlePopoverLeave = () => {
    if (canUsePointerHover) close()
  }

  return active && typeof document !== 'undefined' ? createPortal(
    <div ref={popoverRef} className="cx-popover" role="dialog" aria-modal="false" style={{top: popoverPosition.current.top, left: popoverPosition.current.left, maxWidth: 'min(320px, 90vw)'}} onPointerEnter={handlePopoverEnter} onPointerLeave={handlePopoverLeave}>
      <h2>{active.text}</h2>
      {active.explanation && Object.entries(active.explanation).map(([part, text]) => <p key={part}>{text}</p>)}
    </div>, document.body) : null
}
