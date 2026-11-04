import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import './App.css'
import portfolioLogo from './assets/portfolio-logo-light.svg'
import portfolioLogoDark from './assets/portfolio-logo-dark.svg'
import projectOneLogo from './assets/project-1-logo.svg'
import projectTwoLogo from './assets/project-2-logo.png'
import projectThreeLogo from './assets/project-3-logo.svg'
import fallbackProfilePhoto from './assets/me_speeching_9x16.jpg'
import resumePdf from './resume-ma-quanico.pdf'
import {Pause, Play, VideoOff} from "lucide-react";
import {isFeedbackEnabled, setFeedbackEnabled, tactileFeedback} from './feedback.js';

type Project = {
  name: string
  summary: string
  avatarUrl: string
  category: string
  techstack: string
  highlights: string[]
  mediaType: 'image' | 'video'
  mediaUrl?: string
  role: string
  year: string
  classification: 'Core' | 'Adjacent'
  evidence: string
}

type Inquiry = { name: string; email: string; message: string }
type FormState = 'idle' | 'validating' | 'submitting' | 'error'

async function sendInquiry(_payload: Inquiry): Promise<void> {
  // TODO(owner): Replace with a server-side contact endpoint; do not expose credentials in VITE_*.
  await new Promise((resolve) => window.setTimeout(resolve, 150))
  throw new Error('The contact endpoint is not configured yet.')
}

type Toast = { id: number; message: string; kind: 'success' | 'error' | 'info'; retry?: () => void }

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('theme')
      return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
    } catch {
      return 'dark'
    }
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isNavIsland, setIsNavIsland] = useState(false)
  const [feedbackEnabled, setFeedbackEnabledState] = useState(isFeedbackEnabled)
  const [contactOpen, setContactOpen] = useState(false)
  const [inquiry, setInquiry] = useState<Inquiry>({name: '', email: '', message: ''})
  const [touched, setTouched] = useState<Record<keyof Inquiry, boolean>>({name: false, email: false, message: false})
  const [formState, setFormState] = useState<FormState>('idle')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof Inquiry, string>>>({})
  const [toasts, setToasts] = useState<Toast[]>([])
  const [formError, setFormError] = useState('')
  const contactTriggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const firstInvalidRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const toastId = useRef(0)
  const draftLoaded = useRef(false)

  // Track which project index is currently playing (-1 = none)
  const [playingIndex, setPlayingIndex] = useState<number>(-1)

  // One ref per project slot; we'll populate them as videos mount
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

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
    let scrollTimeout: ReturnType<typeof setTimeout>

    const onScroll = () => {
      setIsNavIsland(window.scrollY > 20)

      if (menuOpen) {
        setMenuOpen(false)
      }

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
      }, 300)
    }

    window.addEventListener('scroll', onScroll, {passive: true})

    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(scrollTimeout)
    }
  }, [menuOpen])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
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
          setToasts((current) => [...current, {id: ++toastId.current, kind: 'info', message: 'Welcome back, your draft was restored.'}])
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
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && formState !== 'submitting') { event.preventDefault(); setContactOpen(false); window.setTimeout(() => contactTriggerRef.current?.focus(), 0); return }
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && formState !== 'submitting') {
        event.preventDefault()
        dialog.querySelector('form')?.requestSubmit()
      }
      if (event.key === 'Tab') {
        const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), a[href]'))
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    dialog.addEventListener('keydown', onKeyDown)
    return () => dialog.removeEventListener('keydown', onKeyDown)
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
    const dirty = Boolean(inquiry.name || inquiry.email || inquiry.message)
    setContactOpen(false)
    if (dirty) pushToast({kind: 'info', message: 'Draft saved. Reopen the form to continue.', retry: () => setContactOpen(true)})
    window.setTimeout(() => contactTriggerRef.current?.focus(), 0)
  }, [inquiry, pushToast])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const isLowPowerDevice =
      (navigator.hardwareConcurrency ?? 4) <= 2 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) <= 2
    setReducedMotion(mediaQuery.matches || isLowPowerDevice)
    const onPreferenceChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches || isLowPowerDevice)
    }
    mediaQuery.addEventListener('change', onPreferenceChange)
    return () => mediaQuery.removeEventListener('change', onPreferenceChange)
  }, [])

  useEffect(() => {
    const onScroll = () => setIsNavIsland(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const profileImageUrl = import.meta.env.VITE_PROFILE_IMAGE_URL || fallbackProfilePhoto
  const thesisPaperUrl = import.meta.env.VITE_THESIS_PAPER_URL || '/assets/research/seashell-computer-vision-thesis.pdf'
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
        highlights: ['Runs on local hardware without cloud model dependence', 'RAG knowledge base with PostgreSQL embeddings and agent logs', 'Document generation and structured record extraction with Qwen2.5-VL'],
        mediaType: 'video',
        mediaUrl: projectMedia.aiLegal,
        role: 'AI Systems Engineer · Jan–Oct 2026',
        year: '2026',
        classification: 'Core',
        evidence: 'CV: cv.md and cv-quanico.pdf',
      },
      {
        name: 'Medical Arts Platform',
        category: 'Core · Healthcare product engineering',
        summary: 'A healthcare-management application developed for a medical center. TODO(owner): Confirm the platform scope and your specific contribution against project records.',
        avatarUrl: projectOneLogo,
        techstack: 'TODO(owner): Confirm exact stack from project source.',
        highlights: ['TODO(owner): Add a verified feature or outcome.'],
        mediaType: 'image',
        mediaUrl: projectMedia.medicalArts,
        role: 'TODO(owner): Confirm personal role and dates.',
        year: 'TODO(owner): Confirm year.',
        classification: 'Core',
        evidence: 'CV: cv.md and cv-quanico.pdf; feature-level details require project-source verification.',
      },
      {
        name: 'Seashell Detection & Harvest Assessment',
        category: 'Core · Computer vision research',
        summary: 'A computer-vision research project for seashell detection, classification, and harvest assessment in coastal communities of Negros Occidental.',
        avatarUrl: projectTwoLogo,
        techstack: 'YOLOv11 instance segmentation · Kotlin · Python inference pipeline · JSON logging',
        highlights: ['AI-driven object segmentation and classification', 'Android application records inference-derived counts', 'Co-author research; TODO(owner): Verify publication status/date and add a public source link.'],
        mediaType: 'video',
        mediaUrl: projectMedia.seashell,
        role: 'Co-author · Computer vision research',
        year: '2025–2026',
        classification: 'Core',
        evidence: 'CV: cv.md and cv-quanico.pdf; Android demo asset configured in local env',
      },
      {
        name: 'Doctor Directory Information System',
        category: 'Adjacent · Healthcare product engineering',
        summary: 'A doctor-directory web application for search, filtering, and record management, developed during a medical-center practicum.',
        avatarUrl: projectThreeLogo,
        techstack: 'PHP · Laravel · Livewire · PostgreSQL',
        highlights: ['Designed the application and supporting schema', 'Iterated with the institution engineering team', '85% UX satisfaction reported in the CV'],
        mediaType: 'video',
        mediaUrl: projectMedia.doctorDirectory,
        role: 'Software Developer · Mar–Jun 2025',
        year: '2025',
        classification: 'Adjacent',
        evidence: 'CV: cv.md and cv-quanico.pdf',
      },
    ],
    [],
  )

  const sections = [
    {id: 'about', label: 'About'},
    {id: 'projects', label: 'Projects'},
    {id: 'experience', label: 'Experience'},
    {id: 'contributions', label: 'Research & contributions'},
    {id: 'contact', label: 'Contact'},
  ]

  return (
    <div className={`app-shell ${reducedMotion ? 'reduce-motion' : ''}`}>
      <div className="grain" aria-hidden="true"/>

      <header className={`top-nav ${isNavIsland ? 'island' : ''}`}>
        <a className="brand" href="#about">
          <img
            src={theme === 'dark' ? portfolioLogoDark : portfolioLogo}
            alt="Marco Angelo Quanico logo"
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
        </nav>
      </header>

      <main>
        <section className="hero" id="about">
          <div className="hero-visual">
            <div className="profile-wrap">
              <img
                className="profile-photo"
                src={profileImageUrl}
                alt="Marco Angelo P. Quanico portrait"
                loading="lazy"
              />
              <div className="profile-glow" aria-hidden="true"/>
            </div>
            <div className="hero-badge">
              <span className="badge-dot"/>
              Open for client projects + free consultations
            </div>
          </div>

          <div className="hero-text">
            <div className="hero-roles">
              <span>AI/ML &amp; Full-Stack Software Engineer</span>
              <span>·</span>
              <span>AI-integrated products for real operations</span>
            </div>
            <h1>
              I build software
              <br/>
              with AI at its
              <em> core.</em>
            </h1>
            <p className="hero-desc">
              I deliver AI-integrated business systems, from offline local-LLM workflows to computer-vision products. At Rosian Liaison Services, my workflow work cut task time by 70% and repetitive daily workload by 80%.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn-primary">Explore AI work</a>
              <a href={resumePdf} className="btn-ghost" target="_blank" rel="noreferrer">Download current CV</a>
              <button ref={contactTriggerRef} type="button" className="btn-ghost" onClick={() => setContactOpen(true)}>Building something with AI? Let&apos;s talk</button>
            </div>
            <div className="hero-signals">
              <span>5 specialized agent skills · RAG · local LLMs</span>
              <span>AI cost: about ₱1.11 per completed task (CV-reported)</span>
              <span>Best Thesis, 19th ICT EXPO 2025</span>
            </div>
          </div>
        </section>

        <section id="research" className="research-section">
          <div className="section-label-row">
            <span className="section-index">02</span>
            <h2>Academic Research Spotlight</h2>
          </div>
          <div className="research-grid">
            <article className="research-card">
              <p className="project-category">Core · Computer-vision research · publication status to verify</p>
              <h3>AI-Driven YOLOv11 Seashell Instance Segmentation</h3>
              <p>
                Co-authored research on automated seashell detection, classification, and harvest assessment for coastal communities of Negros Occidental.
              </p>
              <div className="research-points">
                <span>YOLOv11 instance segmentation</span>
                <span>Android and Python inference workflow</span>
                <span>Best Thesis, 19th ICT EXPO 2025</span>
              </div>
              <div className="research-actions">
                {thesisPaperUrl ? (
                  <>
                    <a href={thesisPaperUrl} target="_blank" rel="noreferrer" className="btn-primary">
                      Open Thesis
                    </a>
                    <a href={thesisPaperUrl} target="_blank" rel="noreferrer" className="btn-ghost">
                      Download Thesis
                    </a>
                  </>
                ) : (
                  <div className="preview-fallback">
                    <span>TODO(owner): Add the public thesis link or confirm the bundled research PDF can be shared.</span>
                  </div>
                )}
              </div>
            </article>

            <article className="thesis-preview-card">
              <div className="preview-title">Visual Thesis Preview</div>
              {thesisPaperUrl ? (
                <iframe title="Research thesis visual preview" src={thesisPaperUrl}/>
              ) : (
                <div className="preview-fallback">
                  <span>Thesis preview appears here when thesis URL is provided.</span>
                </div>
              )}
            </article>
          </div>
        </section>

        <section id="projects">
          <div className="section-label-row">
            <span className="section-index">03</span>
            <h2>Selected Projects</h2>
          </div>

          <div className="bento-grid">
            {projects.map((project, i) => (
              <article key={project.name} className={`project-card span-${i === 0 ? 'full' : 'half'}`}>
                <div className="card-stripe" aria-hidden="true"/>
                <div className="project-head">
                  <img
                    src={project.avatarUrl}
                    alt={`${project.name} logo`}
                    width={48}
                    height={48}
                    loading="lazy"
                    style={i === 2 ? {
                      padding: '10px 0',
                      objectFit: 'contain',
                      width: '48px',
                      height: '48px'
                    } : undefined}
                  />
                  <div>
                    <p className="project-category">{project.category} · {project.year}</p>
                    <h3>{project.name}</h3>
                    <p>{project.summary}</p>
                  </div>
                  <span className="card-index">{String(i + 1).padStart(2, '0')}</span>
                </div>

                <p className="project-role">{project.role}</p>
                <p className="project-proof"><strong>Evidence:</strong> {project.evidence}</p>
                <p className="techstack-text">
                  <strong>AI / delivery stack:</strong> {project.techstack}
                </p>
                <ul className="project-highlights">
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>

                <div className="preview-box">
                  {project.mediaUrl ? (
                    project.mediaType === 'video' ? (
                      <div className="video-frame">
                        <video
                          ref={(el) => { videoRefs.current[i] = el }}
                          preload="metadata"
                          src={project.mediaUrl}
                          muted
                          loop
                          playsInline
                          onPlay={() => { pauseAllExcept(i); setPlayingIndex(i) }}
                          onPause={() => setPlayingIndex((current) => current === i ? -1 : current)}
                          onError={() => setPlayingIndex((current) => current === i ? -1 : current)}
                        />
                        <button
                          type="button"
                          className="video-control"
                          onClick={() => { handleVideoClick(i); tactileFeedback() }}
                          aria-label={playingIndex === i ? `Pause ${project.name} video` : `Play ${project.name} video`}
                          aria-pressed={playingIndex === i}
                        >
                        {playingIndex === i ? <Pause size={26} strokeWidth={2} aria-hidden="true"/> : <Play size={26} strokeWidth={2} aria-hidden="true"/>}
                      </button>
                    </div>
                    ) : (
                      <img src={project.mediaUrl} alt={`${project.name} preview`} loading="lazy"/>
                    )
                  ) : (
                    <div className="preview-fallback project-media-placeholder">
                      <VideoOff size={40} strokeWidth={1.5} className="fallback-icon" aria-hidden="true"/>
                      <span className="fallback-label">{project.name === 'Medical Arts Platform' ? 'Project details need owner confirmation' : 'Media slot · Add a real project demo'}</span>
                      <small>TODO(owner): Configure a public screenshot/video URL in the matching VITE_PROJECT_*_MEDIA_URL variable. Do not use portrait video for the seashell project.</small>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="experience">
          <div className="section-label-row">
            <span className="section-index">04</span>
            <h2>AI delivery & engineering experience</h2>
          </div>
          <div className="experience-grid">
            <article className="experience-card experience-featured experience-card-featured">
              <p className="project-category">AI Systems Engineer · Jan–Oct 2026</p>
              <h3>Rosian Liaison Services</h3>
              <p>Built an offline AI legal-document workflow using local LLMs, five specialized agent skills, RAG, and a PostgreSQL knowledge base. Reported outcomes: task time reduced 70% (~20 min to ~7 min), repetitive daily workload reduced 80% (~5 hrs to ~1 hr), and department overhead reduced 67% (₱15k to ₱5k), without headcount replacement.</p>
              <p className="techstack-text"><strong>Delivery layers:</strong> Llama 3.1 8B · CodeGemma · Qwen2.5-Coder/VL · Ollama · RAG/pgvector · Laravel · React/TypeScript · Redis · PostgreSQL</p>
              <p className="project-proof">Local processing avoids cloud model dependence; reported AI cost was about ₱1.11 per completed task.</p>
            </article>
            <article className="experience-card">
              <p className="project-category">System Developer · Jun 2025–Jan 2026</p>
              <h3>Adventist Medical Center Bacolod</h3>
              <p>Maintained a C#/ASP.NET WinForms HR system, resolved production issues, and cleared 60% of the outstanding fix backlog. Built an MSSQL-backed shift scheduling workflow with swaps and approvals.</p>
            </article>
            <article className="experience-card">
              <p className="project-category">Software Developer · Mar–Jun 2025</p>
              <h3>Riverside Medical Center Inc.</h3>
              <p>Designed and developed a Laravel, Livewire, and PostgreSQL doctor directory for search, filtering, and record management. The CV reports 85% UX satisfaction after stakeholder feedback.</p>
            </article>
            <article className="experience-card">
              <p className="project-category">Freelance Full Stack Developer · 2021–Dec 2024</p>
              <h3>Business software</h3>
              <p>Built MERN applications and a multi-business financial management platform with Laravel, PostgreSQL, React/TypeScript, PDF reporting, and GitHub Actions CI/CD.</p>
            </article>
            <article className="experience-card">
              <p className="project-category">Product engineering · Adjacent</p>
              <h3>Skills by AI delivery layer</h3>
              <dl className="skill-layers">
                <div><dt>Models & APIs</dt><dd>Llama 3.1 · Qwen2.5-Coder/VL · CodeGemma · Ollama</dd></div>
                <div><dt>Orchestration & retrieval</dt><dd>Multi-agent orchestration · tool calling · RAG · pgvector</dd></div>
                <div><dt>Computer vision</dt><dd>YOLOv8 · YOLOv11 · VLM-based OCR · Re-ID tracking</dd></div>
                <div><dt>Data & serving</dt><dd>PostgreSQL · MSSQL · Redis · Docker · GitHub Actions</dd></div>
                <div><dt>Product engineering</dt><dd>Python · PHP/Laravel · React/TypeScript · Node.js · C#/ASP.NET</dd></div>
              </dl>
            </article>
            <article className="experience-card">
              <p className="project-category">Education & recognition</p>
              <h3>Research, learning & community</h3>
              <p>MS Computer Science, Recoletos de Bacolod Graduate School (2025–present; 9 units completed). BS Computer Science, STI West Negros University (2021–2025). Champion, Best Thesis, 19th ICT EXPO 2025; Champion, ICT Olympics 2024 (Web Design and Development); invited CS industry panelist.</p>
              <a href={thesisPaperUrl || undefined} target="_blank" rel="noreferrer" className={thesisPaperUrl ? 'btn-ghost' : 'text-link-disabled'} aria-disabled={!thesisPaperUrl}>Research paper (bundled thesis PDF; public citation TODO)</a>
            </article>
          </div>
        </section>

        <section id="contributions">
          <div className="section-label-row">
            <span className="section-index">05</span>
            <h2>Research & contributions</h2>
          </div>
          <article className="research-card contribution-item">
            <p className="project-category">Computer-vision research · Co-author · publication status to verify</p>
            <h3>AI-Driven YOLOv11 Instance Segmentation Model for Automated Seashell Detection, Classification and Harvest Assessment in Coastal Communities of Negros Occidental</h3>
            <p>Computer-vision research on instance segmentation and harvest assessment.</p>
            <a href={thesisPaperUrl || undefined} target="_blank" rel="noreferrer" className={thesisPaperUrl ? 'btn-primary' : 'text-link-disabled'} aria-disabled={!thesisPaperUrl}>Open publication · TODO(owner): add verified public paper URL</a>
          </article>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="section-index">06</span>
            <p className="footer-tagline">Building something with AI? Let&apos;s talk about a reliable, useful product.</p>
          </div>
          <div className="social-links">
            <button type="button" className="footer-action" onClick={() => setContactOpen(true)}>Start an AI project conversation</button>
            <button type="button" className="footer-action" onClick={() => void copyEmail()}>Copy email</button>
            <a href="mailto:marcoangelo.quanico@gmail.com">Email</a>
            <a href="https://github.com/geloquan" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="https://www.linkedin.com/in/marco-angelo-quanico-b33a2b225/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Marco Angelo P. Quanico</span>
          <span>Bacolod City, Philippines</span>
        </div>
      </footer>

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
            <button type="button" className="modal-close" onClick={closeContact} disabled={formState === 'submitting'} aria-label="Close contact form">×</button>
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
              <p className="backend-note">Demo mode: messages are not sent. TODO(owner): configure a trusted contact-service endpoint before accepting inquiries.</p>
            </form>
        </div>
      </dialog>

      <div className="toast-region" aria-live="polite" aria-label="Notifications">
        {toasts.slice(-3).map((toast) => <div key={toast.id} className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}><span>{toast.message}</span>{toast.message.toLowerCase().includes('draft was restored') && <button type="button" onClick={() => {setInquiry({name: '', email: '', message: ''}); try {localStorage.removeItem('portfolio-contact-draft')} catch { /* Optional storage. */ } setToasts((items) => items.filter((item) => item.id !== toast.id))}}>Discard</button>}{toast.message.startsWith('Draft saved.') ? <button type="button" onClick={() => {setToasts((items) => items.filter((item) => item.id !== toast.id)); setContactOpen(true)}}>Undo close</button> : toast.retry && <button type="button" onClick={toast.retry}>Retry</button>}</div>)}
      </div>
    </div>
  )
}

export default App
