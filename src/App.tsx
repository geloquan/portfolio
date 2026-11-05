import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import type {ReactNode} from 'react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {ArrowDown, ArrowUpRight, BrainCircuit, Database, FileQuestion, FileText, Github, Linkedin, Mail, Play, ScanSearch, ServerCog, Smartphone, UsersRound, VideoOff, Workflow, X} from 'lucide-react'
import type {LucideIcon} from 'lucide-react'
import './App.css'
import portfolioLogo from './assets/portfolio-logo-light.svg'
import portfolioLogoDark from './assets/portfolio-logo-dark.svg'
import fallbackProfilePhoto from './assets/me_speeching_9x16.jpg'
import projectOneLogo from './assets/project-1-logo.svg'
import projectTwoLogo from './assets/project-2-logo.png'
import projectThreeLogo from './assets/project-3-logo.svg'
import resumePdf from './resume-ma-quanico.pdf'
import {isFeedbackEnabled, setFeedbackEnabled, tactileFeedback} from './feedback.js'
import ClaimLayer from './claims-overlay/ClaimLayer'

gsap.registerPlugin(ScrollTrigger)

type Project = {
  name: string
  summary: string
  avatarUrl: string
  category: string
  techstack: string
  highlights: Array<{text: string; icon: LucideIcon}>
  mediaType: 'image' | 'video'
  mediaUrl?: string
  role: string
  year: string
  classification: 'Core' | 'Adjacent'
}

type Inquiry = { name: string; email: string; message: string }
type FormState = 'idle' | 'validating' | 'submitting' | 'error'
async function sendInquiry(_payload: Inquiry): Promise<void> {
  // Replace with a server-side contact endpoint; do not expose credentials in VITE_*.
  await new Promise((resolve) => window.setTimeout(resolve, 150))
  throw new Error('The contact endpoint is not configured yet.')
}

type Toast = { id: number; message: string; kind: 'success' | 'error' | 'info'; retry?: () => void }
type SectionHeadingProps = {
  id: string
  index: string
  title: ReactNode
  description: string
  isVisible: boolean
  onToggle: () => void
}

function SectionHeading({id, index, title, description, isVisible, onToggle}: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <div>
        <span className="section-index">{index}</span>
        <h2>{title}</h2>
      </div>
      <div className="section-heading-context">
        <button
          className="section-description-toggle"
          type="button"
          aria-expanded={isVisible}
          aria-controls={id}
          onClick={onToggle}
        >
          {isVisible ? 'Hide context' : 'Show context'}
        </button>
        <p id={id} hidden={!isVisible}>{description}</p>
      </div>
    </header>
  )
}

function HomePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('theme')
      return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // The page remains usable when storage is unavailable.
    }
  }, [theme])

  return (
    <div className="home-page">
      <header className="home-nav">
        <a className="home-brand" href="#top" aria-label="Marco Angelo Quanico home">
          <img
            src={theme === 'dark' ? portfolioLogoDark : portfolioLogo}
            alt="Marco Angelo Quanico"
            width="180"
            height="36"
          />
        </a>
        <nav className="home-nav-links" aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#approach">Approach</a>
          <a href="#contact">Contact</a>
          <a href="/details">Detailed work</a>
          <button
            className="home-theme-toggle"
            type="button"
            onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="home-hero" aria-labelledby="home-title">
          <div className="home-hero-copy">
            <p className="home-overline">AI systems and product engineering</p>
            <h1 id="home-title">Useful software for work that matters.</h1>
            <p className="home-lead">
              I am Marco, an AI and full-stack engineer in Bacolod. I build practical systems for teams with real processes, constraints, and people.
            </p>
            <div className="home-actions">
              <a className="home-button home-button-primary" href="#work">See selected work</a>
              <a className="home-button home-button-secondary" href="mailto:marcoangelo.quanico@gmail.com">Email Marco</a>
            </div>
          </div>
          <figure className="home-portrait">
            <img
              src={import.meta.env.VITE_PROFILE_IMAGE_URL || fallbackProfilePhoto}
              alt="Marco Angelo P. Quanico"
              width="720"
              height="1280"
              fetchPriority="high"
            />
            <figcaption>Bacolod City, Philippines</figcaption>
          </figure>
        </section>

        <section className="home-section home-work" id="work" aria-labelledby="work-title">
          <div className="home-section-intro">
            <p className="home-overline">Selected work</p>
            <h2 id="work-title">A short view of the practice.</h2>
          </div>
          <div className="home-work-list">
            <article className="home-work-item">
              <span className="home-item-number">01</span>
              <div>
                <h3>Offline AI legal documents</h3>
                <p>Local language models and retrieval support a document workflow that keeps sensitive work on local hardware.</p>
              </div>
              <span className="home-item-type">AI systems</span>
            </article>
            <article className="home-work-item">
              <span className="home-item-number">02</span>
              <div>
                <h3>Seashell computer vision</h3>
                <p>YOLOv11 segmentation and an Android workflow turn coastal research into usable field records.</p>
              </div>
              <span className="home-item-type">Research</span>
            </article>
            <article className="home-work-item">
              <span className="home-item-number">03</span>
              <div>
                <h3>Healthcare information systems</h3>
                <p>Search, scheduling, and record tools shaped by the needs of medical-center teams.</p>
              </div>
              <span className="home-item-type">Product engineering</span>
            </article>
          </div>
        </section>

        <section className="home-section home-approach" id="approach" aria-labelledby="approach-title">
          <div>
            <p className="home-overline">Working approach</p>
            <h2 id="approach-title">Clarity before complexity.</h2>
          </div>
          <div className="home-approach-copy">
            <p>I start with the operating context, then choose the smallest system that can support it well.</p>
            <ul>
              <li>Understand the real workflow before choosing tools.</li>
              <li>Make the useful path clear for the people using it.</li>
              <li>Leave behind systems that can be maintained.</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="home-footer" id="contact">
        <div>
          <p className="home-overline">Start a conversation</p>
          <h2>Have a real process to improve?</h2>
        </div>
        <div className="home-footer-actions">
          <a className="home-button home-button-primary" href="mailto:marcoangelo.quanico@gmail.com">Send an email</a>
          <a className="home-text-link" href="/details">Read the detailed view</a>
        </div>
      </footer>
    </div>
  )
}

function DetailedHome() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('theme')
      return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
    } catch {
      return 'dark'
    }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [isNavIsland, setIsNavIsland] = useState(false)
  const [feedbackEnabled, setFeedbackEnabledState] = useState(isFeedbackEnabled)
  const [showSectionDescriptions, setShowSectionDescriptions] = useState(false)
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})
  const [contactOpen, setContactOpen] = useState(false)
  const [inquiry, setInquiry] = useState<Inquiry>({name: '', email: '', message: ''})
  const [touched, setTouched] = useState<Record<keyof Inquiry, boolean>>({name: false, email: false, message: false})
  const [formState, setFormState] = useState<FormState>('idle')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Inquiry, string>>>({})
  const [toasts, setToasts] = useState<Toast[]>([])
  const [formError, setFormError] = useState('')
  const contactTriggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeContactRef = useRef<() => void>(() => undefined)
  const firstInvalidRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const toastId = useRef(0)
  const draftLoaded = useRef(false)

  const [playingIndex, setPlayingIndex] = useState<number>(-1)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const motionScopeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motionScopeRef.current) return
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        if (reducedMotion) {
          gsap.set(element, {autoAlpha: 1, clearProps: 'transform'})
          return
        }
        gsap.fromTo(element, {autoAlpha: 0, y: 18}, {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          scrollTrigger: {trigger: element, start: 'top 88%', once: true},
        })
      })
    }, motionScopeRef)
    return () => context.revert()
  }, [reducedMotion])

  // Pause all videos except the one at `exceptIndex`
  const pauseAllExcept = useCallback((exceptIndex: number) => {
    videoRefs.current.forEach((vid, idx) => {
      if (vid && idx !== exceptIndex) {
        vid.pause()
      }
    })
  }, [])

  // Toggle play/pause for a given project index
  const handleVideoClick = useCallback((projectIndex: number) => {
    const vid = videoRefs.current[projectIndex]
    if (!vid) return

    if (vid.paused) {
      // Pause every other video first
      pauseAllExcept(projectIndex)
      vid.play().catch(() => {
      })
      setPlayingIndex(projectIndex)
    } else {
      vid.pause()
      setPlayingIndex(-1)
    }
  }, [pauseAllExcept])

  // Intersection observer: auto-pause when a video scrolls out of view
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observers: IntersectionObserver[] = []

    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            vid.pause()
            setPlayingIndex((prev) => (prev === idx ? -1 : prev))
          }
        },
        {threshold: 0.3},
      )

      observer.observe(vid)
      observers.push(observer)
    })

    return () => observers.forEach((obs) => obs.disconnect())
  }, []) // runs once after mount; refs are stable

  useEffect(() => {
    const onScroll = () => {
      setIsNavIsland(window.scrollY > 20)
      setMenuOpen(false)
    }

    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg-base').trim()
    if (themeMeta && themeColor) themeMeta.setAttribute('content', themeColor)
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // The theme remains usable for this session when storage is unavailable.
    }
  }, [theme])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('portfolio-contact-draft')
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<Inquiry>
        const restored = {name: parsed.name ?? '', email: parsed.email ?? '', message: parsed.message ?? ''}
        setInquiry(restored)
        if (restored.name || restored.email || restored.message) {
          const id = ++toastId.current
          setToasts((current) => [...current, {id, kind: 'info', message: 'Welcome back, your draft was restored.'}])
          window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4000)
        }
      }
    } catch {
      // Drafts are optional; the form falls back to in-memory state.
    }
    draftLoaded.current = true
  }, [])

  useEffect(() => {
    if (!draftLoaded.current) return
    const timeout = window.setTimeout(() => {
      try {
        localStorage.setItem('portfolio-contact-draft', JSON.stringify(inquiry))
      } catch {
        // Keep the active draft in memory if browser storage is blocked.
      }
    }, 250)
    return () => window.clearTimeout(timeout)
  }, [inquiry, formState])

  useEffect(() => {
    if (!contactOpen) return
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    dialog.querySelector<HTMLElement>('input:not([tabindex="-1"]), textarea')?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && formState !== 'submitting') {
        event.preventDefault()
        dialog.querySelector('form')?.requestSubmit()
      }
      if (event.key === 'Escape' && formState !== 'submitting') {
        event.preventDefault()
        closeContactRef.current()
        return
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]'))
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) { event.preventDefault(); first.focus() }
      }
    }
    dialog.addEventListener('keydown', onKeyDown)
    return () => {
      dialog.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [contactOpen, formState])

  const pushToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = ++toastId.current
    setToasts((current) => [...current.slice(-2), {...toast, id}])
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), toast.kind === 'error' ? 6000 : 4000)
  }, [])

  const validateInquiry = useCallback((value: Inquiry) => {
    const errors: Partial<Record<keyof Inquiry, string>> = {}
    if (!value.name.trim()) errors.name = 'Please add your name.'
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.email.trim())) errors.email = 'Enter an email address like name@example.com.'
    if (value.message.trim().length < 20) errors.message = 'A little more detail helps me reply better (at least 20 characters).'
    return errors
  }, [])

  const submitInquiry = useCallback(async () => {
    if (formState === 'submitting') return
    setFormState('validating')
    const errors = validateInquiry(inquiry)
    setFieldErrors(errors)
    setTouched({name: true, email: true, message: true})
    await new Promise((resolve) => window.setTimeout(resolve, 120))
    if (Object.keys(errors).length) {
      setFormState('idle')
      setFormError('Please review the highlighted fields.')
      firstInvalidRef.current?.focus()
      pushToast({kind: 'error', message: `${Object.keys(errors).length} fields need attention.`})
      return
    }
    setFormState('submitting')
    setFormError('')
    try {
      await sendInquiry(inquiry)
    } catch (error) {
      setFormState('error')
      const message = error instanceof Error ? error.message : 'The message could not be sent.'
      setFormError(message)
      pushToast({kind: 'error', message, retry: () => void submitInquiry()})
    }
  }, [formState, inquiry, pushToast, validateInquiry])

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('marcoangelo.quanico@gmail.com')
      pushToast({kind: 'success', message: 'Email address copied.'})
    } catch {
      pushToast({kind: 'error', message: 'Could not copy the email. Please use the email link.'})
    }
  }, [pushToast])

  const closeContact = useCallback(() => {
    if (formState === 'submitting') return
    const dirty = Boolean(inquiry.name || inquiry.email || inquiry.message)
    setContactOpen(false)
    if (dirty) pushToast({kind: 'info', message: 'Draft saved. Reopen the form to continue.', retry: () => setContactOpen(true)})
    window.setTimeout(() => contactTriggerRef.current?.focus(), 0)
  }, [formState, inquiry, pushToast])
  closeContactRef.current = closeContact

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isLowPowerDevice =
      (navigator.hardwareConcurrency ?? 4) <= 2 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) <= 2
    setReducedMotion(mediaQuery.matches || isLowPowerDevice)
    const onPreferenceChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches)
    }
    mediaQuery.addEventListener('change', onPreferenceChange)
    return () => mediaQuery.removeEventListener('change', onPreferenceChange)
  }, [])

  const profileImageUrl = import.meta.env.VITE_PROFILE_IMAGE_URL || fallbackProfilePhoto
  const thesisPaperUrl = import.meta.env.VITE_THESIS_PAPER_URL || '/assets/research/seashell-computer-vision-thesis.pdf'
  const calendlyUrl = import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/marco-angelo-quanico'
  const projectMedia = {
    medicalArts: import.meta.env.VITE_PROJECT_MEDICAL_ARTS_MEDIA_URL,
    aiLegal: import.meta.env.VITE_PROJECT_AI_LEGAL_MEDIA_URL || import.meta.env.VITE_PROJECT_ONE_MEDIA_URL,
    seashell: import.meta.env.VITE_PROJECT_SEASHELL_MEDIA_URL,
    doctorDirectory: import.meta.env.VITE_PROJECT_DOCTOR_DIRECTORY_MEDIA_URL,
  }

  const projects: Project[] = useMemo(
    () => [
      {
        name: 'Offline AI Legal Document System',
        category: 'Core · AI-native business workflow',
        summary: 'An offline legal-document workflow that generates Deeds of Absolute Sale as DOCX and PDF using local language models.',
        avatarUrl: projectOneLogo,
        techstack: 'Local LLMs (Llama 3.1 8B, CodeGemma, Qwen2.5-Coder) · 5 agent skills · RAG · PostgreSQL/pgvector · Laravel · React/TypeScript · Redis · RTX 3060',
        highlights: [
          {text: 'Runs on local hardware without cloud model dependence', icon: ServerCog},
          {text: 'RAG knowledge base with PostgreSQL embeddings and agent logs', icon: Database},
          {text: 'Document generation and structured record extraction with Qwen2.5-VL', icon: FileText},
        ],
        mediaType: 'video',
        mediaUrl: projectMedia.aiLegal,
        role: 'AI Systems Engineer · Jan–Oct 2026',
        year: '2026',
        classification: 'Core',
      },
      {
        name: 'Medical Arts Platform',
        category: 'Core · Healthcare product engineering',
        summary: 'Healthcare-management work is part of the project record; platform scope and personal contribution are not yet confirmed.',
        avatarUrl: projectOneLogo,
        techstack: 'Stack details are not published.',
        highlights: [{text: 'Feature-level details are not published yet', icon: FileQuestion}],
        mediaType: 'image',
        mediaUrl: projectMedia.medicalArts,
        role: 'Role and dates not published pending verification.',
        year: 'Unverified',
        classification: 'Core',
      },
      {
        name: 'Seashell Detection & Harvest Assessment',
        category: 'Core · Computer vision research',
        summary: 'A computer-vision research project for seashell detection, classification, and harvest assessment in coastal communities of Negros Occidental.',
        avatarUrl: projectTwoLogo,
        techstack: 'YOLOv11 instance segmentation · Kotlin · Python inference pipeline · JSON logging',
        highlights: [
          {text: 'AI-driven object segmentation and classification', icon: ScanSearch},
          {text: 'Android application records inference-derived counts', icon: Smartphone},
          {text: 'Co-author research project', icon: BrainCircuit},
        ],
        mediaType: 'video',
        mediaUrl: projectMedia.seashell,
        role: 'Co-author · Computer vision research',
        year: '2025–2026',
        classification: 'Core',
      },
      {
        name: 'Doctor Directory Information System',
        category: 'Adjacent · Healthcare product engineering',
        summary: 'A doctor-directory web application for search, filtering, and record management, developed during a medical-center practicum.',
        avatarUrl: projectThreeLogo,
        techstack: 'PHP · Laravel · Livewire · PostgreSQL',
        highlights: [
          {text: 'Designed the application and supporting schema', icon: Workflow},
          {text: 'Iterated with the institution engineering team', icon: UsersRound},
          {text: '85% UX satisfaction following stakeholder feedback', icon: Database},
        ],
        mediaType: 'video',
        mediaUrl: projectMedia.doctorDirectory,
        role: 'Software Developer · Mar–Jun 2025',
        year: '2025',
        classification: 'Adjacent',
      },
    ],
    [],
  )

  const sections = [
    {id: 'about', label: 'About'},
    {id: 'projects', label: 'Projects'},
    {id: 'experience', label: 'Experience'},
    {id: 'contributions', label: 'Research'},
    {id: 'contact', label: 'Contact'},
  ]

  const toggleSectionDescription = (sectionId: string) => {
    setExpandedDescriptions((current) => ({...current, [sectionId]: !current[sectionId]}))
  }

  const isDescriptionVisible = (sectionId: string) => showSectionDescriptions || Boolean(expandedDescriptions[sectionId])

  return (
    <div ref={motionScopeRef} className={`app-shell ${reducedMotion ? 'reduce-motion' : ''}`}>
      <div className="grain" aria-hidden="true"/>

      <header className={`top-nav ${isNavIsland ? 'island' : ''}`}>
        <a className="brand" href="#about">
          <img
            src={theme === 'dark' ? portfolioLogoDark : portfolioLogo}
            alt="Marco Angelo Quanico logo"
            width="180"
            height="36"
          />
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((c) => !c)}
        >
          <span/>
          <span/>
          <span/>
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          {sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} onClick={() => setMenuOpen(false)}>
              {section.label}
            </a>
          ))}
          <button
            className="theme-toggle"
            type="button"
            onClick={() => { setTheme((t) => (t === 'dark' ? 'light' : 'dark')); tactileFeedback() }}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? '☀' : '◑'}
          </button>
          <button
            className="theme-toggle feedback-toggle"
            type="button"
            role="switch"
            aria-checked={feedbackEnabled}
            aria-label="Interface sound and haptic feedback"
            onClick={() => {
              const next = !feedbackEnabled
              setFeedbackEnabled(next)
              setFeedbackEnabledState(next && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
              if (next) tactileFeedback()
            }}
          >
            {feedbackEnabled ? 'Sound on' : 'Sound off'}
          </button>
          <button
            className="theme-toggle context-toggle"
            type="button"
            role="switch"
            aria-checked={showSectionDescriptions}
            aria-label="Show section context"
            onClick={() => setShowSectionDescriptions((current) => !current)}
          >
            {showSectionDescriptions ? 'Context on' : 'Context off'}
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="about" data-reveal>
          <div className="hero-index"><span className="eyebrow">Independent engineer · Bacolod, Philippines</span><span className="hero-index-number">Portfolio / 2026</span></div>
          <div className="hero-grid">
            <div className="hero-copy hero-text">
              <p className="hero-kicker">AI / systems / product engineering</p>
              <div className="hero-roles">
                <span>AI/ML &amp; Full-Stack Software Engineer</span>
                <span>·</span>
                <span>AI-integrated products for real operations</span>
              </div>
              <h1>Useful AI,<br /><em>built to work.</em></h1>
              <p className="hero-desc">I’m Marco Angelo P. Quanico, an AI/ML and full-stack software engineer. I build business systems that fit real operations, from offline document workflows to computer-vision products.</p>
              <p className="hero-acknowledgement">This portfolio reflects my work, with direct and indirect help from the developer and engineer community. I acknowledge that support as part of my practice; it does not mean those contributors co-authored every project.</p>
              <div className="hero-actions"><a href="#projects" className="btn-primary">Explore selected work <ArrowDown size={17} aria-hidden="true" /></a><a href={resumePdf} className="btn-ghost" target="_blank" rel="noreferrer">Download profile PDF <ArrowUpRight size={16} aria-hidden="true" /></a></div>
              <p className="hero-location">Based in Bacolod City, Negros Occidental · Philippines</p>
            </div>
            <div className="hero-visual">
              <div className="profile-wrap">
                <img
                  className="profile-photo"
                  src={profileImageUrl}
                  alt="Marco Angelo P. Quanico portrait"
                  width="720"
                  height="1280"
                  fetchPriority="high"
                />
                <div className="profile-glow" aria-hidden="true"/>
              </div>
            </div>
          </div>

          <div className="hero-proof" aria-label="Selected project outcomes"><div><span><strong>70%</strong><span>faster task execution</span></span></div><div><span><strong>80%</strong><span>less repetitive daily workload</span></span></div><div><span><strong>67%</strong><span>lower department overhead</span></span></div></div>

        </section>

        <section id="projects" className="projects-section" data-reveal>
          <div className="section-label-row">
            <span className="section-index">01 / FIELD NOTES</span>
            <h2>Selected work</h2>
          </div>

          <article className="project-featured" aria-labelledby="project-title-1">
            <div className="project-featured-meta"><span>01</span><span>{projects[0].category}</span><span>{projects[0].year}</span></div>
            <div className="project-featured-body">
              <div className="project-featured-copy">
                <p className="project-role">AI Systems Engineer · Rosian Liaison Services</p>
                <h3 id="project-title-1">Offline AI Legal Document System</h3>
                <p className="project-summary">Generates Deeds of Absolute Sale as DOCX and PDF using local language models, built for a legal workflow that needs to keep working without cloud model dependence.</p>
                <div className="project-outcomes">
                  <div><span><strong>70%</strong><span>faster task execution</span></span></div>
                  <div><span><strong>80%</strong><span>less repetitive daily workload</span></span></div>
                  <div><span><strong>67%</strong><span>lower department overhead</span></span></div>
                </div>
                <p className="project-proof">Task time reduced 70%, repetitive daily workload reduced 80%, and department overhead reduced 67%, without headcount replacement. AI cost was about ₱1.11 per completed task.</p>
                <div className="skill-list" aria-label="Capabilities">{projects[0].highlights.map((highlight, index) => { const Icon = highlight.icon; return <span key={highlight.text}><small>0{index + 1}</small><Icon size={16} strokeWidth={1.7} aria-hidden="true" />{highlight.text}</span> })}</div>
                <p className="techstack-text"><strong>Built with</strong> {projects[0].techstack}</p>
              </div>
              <div className="preview-box featured-preview">
                {projects[0].mediaUrl ? <div className="video-frame"><video ref={(el) => { videoRefs.current[0] = el }} preload="metadata" width="960" height="540" src={projects[0].mediaUrl} muted loop playsInline onPlay={() => { pauseAllExcept(0); setPlayingIndex(0) }} onPause={() => setPlayingIndex(-1)} aria-label="Offline AI legal document system preview" /><button className="video-control" type="button" aria-label={playingIndex === 0 ? 'Pause project preview' : 'Play project preview'} aria-pressed={playingIndex === 0} onClick={() => { handleVideoClick(0); tactileFeedback() }}>{playingIndex === 0 ? 'Ⅱ' : <Play size={22} aria-hidden="true" />}</button></div> : <div className="project-media-placeholder"><VideoOff size={34} aria-hidden="true"/><span>Demo media not configured</span><small>Add an authorized demo using VITE_PROJECT_ONE_MEDIA_URL.</small></div>}
              </div>
            </div>
          </article>

          <div className="project-index">{projects.slice(1).map((project, index) => { const projectIndex = index + 1; return <article className="project-row" key={project.name}><div className="project-row-number">0{projectIndex + 1}</div><div className="project-row-main"><p className="project-category">{project.classification} · {project.category} · {project.year}</p><h3>{project.name}</h3><p>{project.summary}</p><p className="project-role">{project.role}</p><p className="techstack-text"><strong>Stack:</strong> {project.techstack}</p><div className="skill-list" aria-label={`${project.name} capabilities`}>{project.highlights.map((highlight, highlightIndex) => { const Icon = highlight.icon; return <span key={highlight.text}><small>0{highlightIndex + 1}</small><Icon size={16} strokeWidth={1.7} aria-hidden="true" />{highlight.text}</span> })}</div></div><div className="project-row-media">{project.mediaUrl ? project.mediaType === 'video' ? <video src={project.mediaUrl} preload="metadata" width="640" height="360" muted loop playsInline aria-label={`${project.name} preview`} /> : <img src={project.mediaUrl} alt={`${project.name} preview`} width="640" height="360" loading="lazy" /> : <div className="project-media-placeholder"><img src={project.avatarUrl} alt="" width={42} height={42} loading="lazy"/><VideoOff size={18} aria-hidden="true"/><span>{project.name === 'Medical Arts Platform' ? 'Details need owner confirmation' : 'No public demo configured'}</span></div>}</div></article> })}</div>
        </section>

        <section id="experience" data-reveal>
          <SectionHeading
            id="experience-context"
            index="02 / PRACTICE"
            title="Work behind the work"
            description="Production systems, healthcare IT, and independent product engineering: each shaped by a different operating context."
            isVisible={isDescriptionVisible('experience')}
            onToggle={() => toggleSectionDescription('experience')}
          />
          <article className="experience-feature"><div className="experience-feature-label"><span>01</span><span>AI systems engineering</span><span>Jan–Oct 2026</span></div><div><h3>Rosian Liaison Services</h3><p>Built an offline AI legal-document workflow using local LLMs, five specialized agent skills, RAG, and a PostgreSQL knowledge base. Task time reduced by 70% (~20 to ~7 minutes), repetitive daily workload by 80% (~5 to ~1 hour), and department overhead by 67% (₱15k to ₱5k), without headcount replacement.</p><p className="project-proof">Llama 3.1 8B · CodeGemma · Qwen2.5-Coder/VL · Ollama · pgvector · Laravel · React/TypeScript · Redis · PostgreSQL</p><p className="project-proof">AI cost about ₱1.11 per completed task.</p></div></article>
          <div className="experience-list"><article><span>02</span><div><p className="project-category">System Developer · Jun 2025–Jan 2026</p><h3>Adventist Medical Center Bacolod</h3><p>Maintained a C#/ASP.NET WinForms HR system, resolved production issues, and cleared 60% of the outstanding fix backlog. Built an MSSQL-backed shift-scheduling workflow with swaps and approvals.</p></div></article><article><span>03</span><div><p className="project-category">Software Developer · Mar–Jun 2025</p><h3>Riverside Medical Center Inc.</h3><p>Designed and developed a Laravel, Livewire, and PostgreSQL doctor directory for search, filtering, and record management.</p></div></article><article><span>04</span><div><p className="project-category">Freelance Full Stack Developer · 2021–Dec 2024</p><h3>Independent business software</h3><p>Built MERN applications and a multi-business financial-management platform with Laravel, PostgreSQL, React/TypeScript, PDF reporting, and GitHub Actions CI/CD.</p></div></article></div>
          <div className="skills-strip"><span>TOOLS / SYSTEMS</span><p>Local LLMs · Multi-agent orchestration · RAG · pgvector · YOLOv8/YOLOv11 · VLM-based OCR · Python · Laravel · React/TypeScript · C#/ASP.NET · PostgreSQL · MSSQL · Redis · Docker · GitHub Actions</p></div>

        </section>

        <section id="contributions" data-reveal>
          <SectionHeading
            id="research-context"
            index="03 / RESEARCH & LEARNING"
            title={<>Research, study,<br />and recognition</>}
            description="Computer vision in a local context, graduate study in progress, and work recognized by the academic community."
            isVisible={isDescriptionVisible('research')}
            onToggle={() => toggleSectionDescription('research')}
          />
          <article className="research-spread"><div className="research-spread-mark" aria-hidden="true">RESEARCH<br />/ 01</div><div className="research-spread-content"><p className="project-category">Computer-vision research · Co-author</p><h3>AI-Driven YOLOv11 Instance Segmentation Model for Automated Seashell Detection, Classification and Harvest Assessment in Coastal Communities of Negros Occidental</h3>          <p>Research on automated seashell detection, classification, and harvest assessment in coastal communities of Negros Occidental.</p><div className="research-points"><span>YOLOv11 instance segmentation</span><span>Android + Python inference workflow</span><span data-claim-id="best-thesis-ict-expo-2025">Best Thesis · 19th ICT EXPO 2025</span></div><div className="research-actions"><a href={thesisPaperUrl} target="_blank" rel="noreferrer" className="btn-primary">View bundled thesis PDF <ArrowUpRight size={16} aria-hidden="true" /></a></div></div><div className="thesis-preview-card"><div className="preview-title">THESIS / PDF</div><iframe title="Seashell computer-vision thesis PDF preview" src={thesisPaperUrl} loading="lazy" /></div></article>
          <div className="education-row"><article><span className="project-category">2025 — present · 9 units completed</span><h3>MS Computer Science</h3><p>Recoletos de Bacolod Graduate School</p></article><article><span className="project-category">2021 — 2025</span><h3>BS Computer Science</h3><p>STI West Negros University</p></article><article><span className="project-category">Recognition</span><h3>Best Thesis + ICT Olympics</h3><p>Champion, 19th ICT EXPO 2025; <span data-claim-id="web-design-champion-ict-olympics">Champion, ICT Olympics 2024 (Web Design and Development)</span>; invited CS industry panelist.</p></article></div>
        </section>
      </main>

      <section id="contact" className="contact-section" data-reveal>
        <div className="contact-inner">
          <div><span className="section-index">04 / CONTACT</span><h2>Build something<br /><em>useful.</em></h2><p>For work around AI systems, product engineering, and practical automation, start a conversation by email or book a free call.</p></div>
          <div className="contact-actions"><button ref={contactTriggerRef} type="button" className="btn-primary" onClick={() => setContactOpen(true)}>Open inquiry form <ArrowUpRight size={16} aria-hidden="true" /></button><a href="mailto:marcoangelo.quanico@gmail.com" className="btn-ghost"><Mail size={16} aria-hidden="true" /> Email directly</a><button type="button" className="text-action" onClick={() => void copyEmail()}>Copy email address</button><p>The inquiry form is not connected to a delivery service yet. Use the email link for a message that needs to reach me.</p></div>
          <aside className="booking-card" aria-labelledby="booking-title">
            <p className="section-index">OPEN INVITATION</p>
            <h3 id="booking-title">Book a free call</h3>
            <p>Everyone is welcome. You will leave with practical insights on possible solutions and a clear quotation for the work we discuss.</p>
            <p className="booking-prep"><strong>Come prepared:</strong> bring your goals, current process, constraints, and any examples that help explain the problem.</p>
            <a className="btn-ghost booking-link" href={calendlyUrl} target="_blank" rel="noreferrer">Choose a time on Calendly <ArrowUpRight size={16} aria-hidden="true" /></a>
            <p className="booking-note">If we lock in a project, everything will be documented and transparent from scope through delivery. A support bot assistant will also help once the project is underway.</p>
          </aside>
        </div>
      </section>
      <footer className="footer"><div className="footer-inner"><a className="footer-name" href="#about">Marco Angelo P. Quanico</a><p>AI/ML + full-stack engineer · Bacolod City, Philippines</p><div className="social-links"><a href="https://github.com/geloquan" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} aria-hidden="true" /></a><a href="https://www.linkedin.com/in/marco-angelo-quanico-b33a2b225/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} aria-hidden="true" /></a><a href="mailto:marcoangelo.quanico@gmail.com" aria-label="Email"><Mail size={18} aria-hidden="true" /></a></div></div><div className="footer-bottom"><span>© 2026 Marco Angelo P. Quanico</span><a href={resumePdf} target="_blank" rel="noreferrer">Profile PDF <ArrowUpRight size={14} aria-hidden="true" /></a></div></footer>

      <ClaimLayer />
      <dialog
        className="contact-dialog"
        ref={dialogRef}
        aria-labelledby="contact-title"
        onCancel={(event) => { event.preventDefault(); if (formState !== 'submitting') closeContact() }}
        onClick={(event) => { if (event.target === dialogRef.current && formState !== 'submitting') closeContact() }}
        onClose={() => { if (contactOpen && formState !== 'submitting') closeContact() }}
      >
        <div className="contact-modal">
          <div className="contact-modal-header">
            <div><p className="project-category">AI product inquiry</p><h2 id="contact-title">Let&apos;s build something useful.</h2>            <p>Share a little context. Messages are not currently delivered; use the email link while the contact service is configured.</p></div>
            <button type="button" className="modal-close" onClick={closeContact} disabled={formState === 'submitting'} aria-label="Close contact form"><X size={18} aria-hidden="true" /></button>
          </div>
            <form className="contact-form" noValidate onSubmit={(event) => { event.preventDefault(); void submitInquiry() }}>
              <div className="honeypot" aria-hidden="true"><label htmlFor="company-website">Leave this field empty</label><input id="company-website" name="company-website" tabIndex={-1} autoComplete="off" /></div>
              <div className="form-field">
                <label htmlFor="contact-name">Your name</label>
                <div className="input-wrap"><span aria-hidden="true">♙</span><input ref={firstInvalidRef as React.RefObject<HTMLInputElement>} id="contact-name" name="name" autoComplete="name" value={inquiry.name} disabled={formState === 'submitting'} aria-invalid={Boolean(touched.name && fieldErrors.name)} aria-describedby="name-error" onBlur={() => {setTouched((state) => ({...state, name: true})); setFieldErrors((state) => ({...state, name: validateInquiry(inquiry).name}))}} onChange={(event) => {setInquiry((state) => ({...state, name: event.target.value})); if (touched.name) setFieldErrors((state) => ({...state, name: validateInquiry({...inquiry, name: event.target.value}).name}))}} /></div>
                <span className="field-status" aria-hidden="true">{touched.name && !fieldErrors.name ? '✓' : touched.name && fieldErrors.name ? '!' : ''}</span><small id="name-error" className="field-error">{touched.name ? fieldErrors.name || 'Your name helps me address the reply.' : ' '}</small>
              </div>
              <div className="form-field">
                <label htmlFor="contact-email">Email address</label>
                <div className="input-wrap"><span aria-hidden="true">✉</span><input id="contact-email" name="email" type="email" autoComplete="email" value={inquiry.email} disabled={formState === 'submitting'} aria-invalid={Boolean(touched.email && fieldErrors.email)} aria-describedby="email-error" onBlur={() => {setTouched((state) => ({...state, email: true})); setFieldErrors((state) => ({...state, email: validateInquiry(inquiry).email}))}} onChange={(event) => {setInquiry((state) => ({...state, email: event.target.value})); if (touched.email) setFieldErrors((state) => ({...state, email: validateInquiry({...inquiry, email: event.target.value}).email}))}} /></div>
                <span className="field-status" aria-hidden="true">{touched.email && !fieldErrors.email ? '✓' : touched.email && fieldErrors.email ? '!' : ''}</span><small id="email-error" className="field-error">{touched.email ? fieldErrors.email || 'I’ll use this address to reply.' : ' '}</small>
              </div>
              <div className="form-field">
                <label htmlFor="contact-message">What are you building?</label>
                <div className="input-wrap textarea-wrap"><textarea id="contact-message" name="message" rows={4} maxLength={2000} value={inquiry.message} disabled={formState === 'submitting'} aria-invalid={Boolean(touched.message && fieldErrors.message)} aria-describedby="message-error message-count" onBlur={() => {setTouched((state) => ({...state, message: true})); setFieldErrors((state) => ({...state, message: validateInquiry(inquiry).message}))}} onChange={(event) => {setInquiry((state) => ({...state, message: event.target.value})); if (touched.message) setFieldErrors((state) => ({...state, message: validateInquiry({...inquiry, message: event.target.value}).message}))}} /></div>
                <span className="field-status" aria-hidden="true">{touched.message && !fieldErrors.message ? '✓' : touched.message && fieldErrors.message ? '!' : ''}</span><small id="message-error" className="field-error">{touched.message ? fieldErrors.message || 'Thanks — this gives me enough context to respond.' : ' '}</small>
                <small id="message-count" className="character-count">{inquiry.message.length}/2000</small>
              </div>
              {formError && <p className="form-status-error" role="alert">{formError}</p>}
              <div className="modal-footer"><p>Esc to close · Ctrl/⌘ + Enter to submit</p><div className="modal-actions"><button type="button" className="btn-ghost" onClick={closeContact} disabled={formState === 'submitting'}>Cancel</button><button type="submit" className="btn-primary" disabled={formState === 'submitting'}>{formState === 'validating' ? 'Checking…' : formState === 'submitting' ? 'Sending…' : formState === 'error' ? 'Retry sending' : 'Send inquiry'}</button></div></div>
              <p className="backend-note">Demo mode: messages are not sent. A trusted contact-service endpoint must be configured before accepting inquiries.</p>
            </form>
        </div>
      </dialog>

      <div className="toast-region" aria-live="polite" aria-label="Notifications">
        {toasts.slice(-3).map((toast) => <div key={toast.id} className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}><span>{toast.message}</span>{toast.message.toLowerCase().includes('draft was restored') && <button type="button" onClick={() => {setInquiry({name: '', email: '', message: ''}); try {localStorage.removeItem('portfolio-contact-draft')} catch { /* Optional storage. */ } setToasts((items) => items.filter((item) => item.id !== toast.id))}}>Discard</button>}{toast.message.startsWith('Draft saved.') ? <button type="button" onClick={() => {setToasts((items) => items.filter((item) => item.id !== toast.id)); setContactOpen(true)}}>Undo close</button> : toast.retry && <button type="button" onClick={toast.retry}>Retry</button>}</div>)}
      </div>
    </div>
  )
}

function App() {
  const isDetailedView = window.location.pathname === '/details' || window.location.pathname === '/archive'
  return isDetailedView ? <DetailedHome /> : <HomePage />
}

export default App
