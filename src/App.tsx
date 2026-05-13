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

type Project = {
  name: string
  summary: string
  avatarUrl: string
  category: string
  techstack: string
  highlights: string[]
  mediaType: 'image' | 'video'
  mediaUrl?: string
}

const primaryColor = '#92DCE5'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isNavIsland, setIsNavIsland] = useState(false)

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
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', primaryColor)
  }, [])

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
  const thesisPaperUrl = import.meta.env.VITE_THESIS_PAPER_URL

  const projects: Project[] = useMemo(
    () => [
      {
        name: 'Medical Arts Platform',
        category: 'Enterprise Healthcare Platform',
        summary:
          'A medical doctor platform with dynamic scheduling and clinic operations support for enterprise-level workflows.',
        avatarUrl: projectOneLogo,
        techstack:
          'React + Laravel + Monitoring Automation (Grafana) + Queue Jobs + Schedule Jobs + Email system + Ubuntu + Node + RESTful API + Cloudflare R2 Bucket + Git',
        highlights: [
          'Doctor dynamic scheduling',
          'Doctor directory and notifications',
          'Clinic role management',
        ],
        mediaType: 'video',
        mediaUrl: import.meta.env.VITE_PROJECT_ONE_MEDIA_URL,
      },
      {
        name: 'Seashell Counting and Logging Application',
        category: 'Android + Computer Vision',
        summary:
          'A mobile Android application that uses Kotlin with YOLOv8 OBB-assisted Python inferences to classify and quantify seashell data.',
        avatarUrl: projectTwoLogo,
        techstack: 'Kotlin + Python Inference Pipeline + YOLOv8 OBB + JSON logging structure',
        highlights: [
          'Proof-of-work for bachelor research thesis',
          'Quantifies metadata from detection outputs',
          'Stores and logs counting records',
        ],
        mediaType: 'video',
        mediaUrl: import.meta.env.VITE_PROJECT_TWO_MEDIA_URL,
      },
      {
        name: 'Doctor Directory Information System',
        category: 'Medical Compliance System',
        summary:
          "A compliance-driven local deployment for a medical center in Bacolod City, focused on admin-only doctor's directory operations.",
        avatarUrl: projectThreeLogo,
        techstack: 'PHP Blade + Laravel + PostgreSQL',
        highlights: [
          'Admin user role only',
          'Doctor directory full CRUD and search',
          'Built for local medical center compliance requirements',
        ],
        mediaType: 'video',
        mediaUrl: import.meta.env.VITE_PROJECT_THREE_MEDIA_URL,
      },
    ],
    [],
  )

  const sections = [
    {id: 'about', label: 'About'},
    {id: 'research', label: 'Research'},
    {id: 'projects', label: 'Projects'},
    {id: 'experience', label: 'Experience'},
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
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀' : '◑'}
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
              <span>Software Developer</span>
              <span>·</span>
              <span>Business-Oriented Builder</span>
            </div>
            <h1>
              Building systems that
              <br/>
              create better
              <em> outcomes.</em>
            </h1>
            <p className="hero-desc">
              Fresh Computer Science graduate with 4+ years of project-building and healthcare IT
              experience. I focus on reliable delivery, client satisfaction, and software that
              supports real business and operational goals.
            </p>
            <div className="hero-actions">
              <a href="#projects" className="btn-primary">
                Explore My Work
              </a>
              <a href={resumePdf} className="btn-ghost" target="_blank" rel="noreferrer">
                Download Resume
              </a>
              <a
                href="mailto:marcoangelo.quanico@gmail.com?subject=Free%20Consultation%20Request"
                className="btn-ghost"
              >
                Request Free Consultation
              </a>
            </div>
            <div className="hero-signals">
              <span>10 months healthcare IT industry experience</span>
              <span>9 units MSCS in progress</span>
              <span>Best in Thesis - ICT Expo 2026</span>
            </div>
          </div>
        </section>

        <section id="research">
          <div className="section-label-row">
            <span className="section-index">02</span>
            <h2>Academic Research Spotlight</h2>
          </div>
          <div className="research-grid">
            <article className="research-card">
              <h3>Determining Seashell Abundance through Image Processing</h3>
              <p>
                Research focused on computer vision with YOLOv8 for classifying and counting three
                seashell species. This thesis was presented and awarded as the Best Thesis during
                the 2026 ICT Expo and was offered a chance to be publicized at a Singaporean university.
              </p>
              <div className="research-points">
                <span>YOLOv8-based classification</span>
                <span>Three-species abundance counting</span>
                <span>Bachelor degree requirement proof-of-work</span>
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
                    <span>Set VITE_THESIS_PAPER_URL for thesis file.</span>
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
                    <p className="project-category">{project.category}</p>
                    <h3>{project.name}</h3>
                    <p>{project.summary}</p>
                  </div>
                  <span className="card-index">{String(i + 1).padStart(2, '0')}</span>
                </div>

                <p className="techstack-text">
                  <strong>Tech stack:</strong> {project.techstack}
                </p>
                <ul className="project-highlights">
                  {project.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>

                <div className="preview-box">
                  {project.mediaUrl ? (
                    project.mediaType === 'video' ? (
                      <div
                        className="video-wrapper"
                        onClick={() => handleVideoClick(i)}
                        role="button"
                        aria-label={playingIndex === i ? `Pause ${project.name} video` : `Play ${project.name} video`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleVideoClick(i)
                          }
                        }}
                      >
                        <video
                          ref={(el) => {
                            videoRefs.current[i] = el
                          }}
                          preload="metadata"
                          src={project.mediaUrl}
                          muted
                          loop
                          playsInline
                        />
                        {/* Play/Pause overlay icon */}
                        <div className={`video-overlay-icon ${playingIndex === i ? 'playing' : 'paused'}`}>
                          {playingIndex === i
                            ? <Pause size={36} strokeWidth={2}/>
                            : <Play size={36} strokeWidth={2}/>
                          }
                        </div>
                      </div>
                    ) : (
                      <img src={project.mediaUrl} alt={`${project.name} preview`} loading="lazy"/>
                    )
                  ) : (
                    <div className="preview-fallback">
                      <VideoOff size={48} strokeWidth={1.5} className="fallback-icon"/>
                      <span className="fallback-label">Video unavailable</span>
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
            <h2>Industry Experience & Client Focus</h2>
          </div>
          <div className="experience-grid">
            <article className="experience-card">
              <h3>Adventist Medical Center Bacolod · IT Staff (Probationary)</h3>
              <p>
                Led maintenance and improvement of a hospital HR system, resolved production issues,
                cleared 60% backlog fixes, and developed shift scheduling with swap/approval flow.
              </p>
            </article>
            <article className="experience-card">
              <h3>Riverside Medical Center Inc. · Practicum / OJT</h3>
              <p>
                Designed and developed an institution doctor directory with 85% UX satisfaction
                feedback from software stakeholders.
              </p>
            </article>
            <article className="experience-card consultation-card">
              <h3>Consultation Approach</h3>
              <p>
                I prioritize requirement clarity, business practicality, and measurable outcomes. I
                also accept free consultations via video-call platforms to discuss your project.
              </p>
              <a
                href="mailto:marcoangelo.quanico@gmail.com?subject=Video%20Consultation%20Booking"
                className="btn-primary"
              >
                Book a Free Video Consultation
              </a>
            </article>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="section-index">05</span>
            <p className="footer-tagline">Let&apos;s build software that your users and clients can trust.</p>
          </div>
          <div className="social-links">
            <a href="mailto:marcoangelo.quanico@gmail.com">Email</a>
            <a href="tel:+639218692170">Call</a>
            <a href="https://github.com/geloquan" target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a href="https://www.linkedin.com/in/marco-angelo-quanico-b33a2b225/" target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
            <a href="https://www.facebook.com/Yusiyernem/" target="_blank" rel="noreferrer">
              Facebook ↗
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Marco Angelo P. Quanico</span>
          <span>Bacolod City, Philippines</span>
        </div>
      </footer>
    </div>
  )
}

export default App
