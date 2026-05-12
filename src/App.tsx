import { useEffect, useMemo, useState } from 'react'
import resumePdf from './resume-ma-quanico.pdf'
import projectOneLogo from './assets/project-1-logo.svg'
import projectTwoLogo from './assets/project-2-logo.png'
import projectThreeLogo from './assets/project-3-logo.svg'
import './App.css'

type Project = {
  name: string
  summary: string
  stack: string[]
  outcome: string
  logo: string
  mediaType: 'image' | 'video' | 'none'
  mediaUrl?: string
}

const primaryColor = '#92DCE5'
const env = import.meta.env

const getCloudflareR2EnvValue = (name: string) =>
  env[`CLOUDFLARE_R2_${name}`] ?? env[`CLOUDFLARE_R2_${name}`]

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme')
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark'
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [isNavIsland, setIsNavIsland] = useState(false)

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
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const profileImageUrl = getCloudflareR2EnvValue('PROFILE_IMAGE_URL')
  const projectOneVideoUrl = getCloudflareR2EnvValue('PROJECT_ONE_MEDIA_URL')
  const thesisPaperUrl = import.meta.env.VITE_THESIS_PAPER_URL

  const projects: Project[] = useMemo(
    () => [
      {
        name: 'Project 1 · Enterprise Medical Doctor Platform',
        summary:
          'A production-focused healthcare platform with dynamic doctor scheduling, searchable directory, notification workflows, and clinic role management.',
        stack: [
          'React',
          'Laravel',
          'Grafana Automation',
          'Queue Jobs',
          'Schedule Jobs',
          'Email System',
          'Ubuntu',
          'Node',
          'RESTful API',
          'Cloudflare R2',
          'Git',
        ],
        outcome:
          'Built for enterprise-level operations with reliability, observability, and communication flow as core priorities.',
        logo: projectOneLogo,
        mediaType: 'video',
        mediaUrl: projectOneVideoUrl,
      },
      {
        name: 'Project 2 · Kotlin Mobile Research Application',
        summary:
          "An Android app developed with Kotlin that uses YOLOv8 OBB outputs and Python inference readings to quantify metadata and store structured results.",
        stack: ['Kotlin', 'Android', 'YOLOv8 OBB', 'Python Inference', 'Data Quantification'],
        outcome:
          'Served as proof-of-work for a bachelor research thesis requirement, validating practical mobile-to-model workflow integration.',
        logo: projectTwoLogo,
        mediaType: 'none',
      },
      {
        name: "Project 3 · Doctor's Directory Information System",
        summary:
          'A compliance-driven implementation for a local medical center in Bacolod City, focused on secure and streamlined doctor directory management.',
        stack: ['Admin Role', 'Directory Management', 'Healthcare Compliance', 'Records Workflow'],
        outcome:
          'Delivered as an admin-only solution aligned with organizational controls and local operational requirements.',
        logo: projectThreeLogo,
        mediaType: 'none',
      },
    ],
    [projectOneVideoUrl],
  )

  const sections = [
    { id: 'about', label: 'About' },
    { id: 'research', label: 'Research' },
    { id: 'projects', label: 'Projects' },
    { id: 'services', label: 'Client Value' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
    <div className={`app-shell ${reducedMotion ? 'reduce-motion' : ''}`}>
      <div className="grain" aria-hidden="true" />

      <header className={`top-nav ${isNavIsland ? 'island' : ''}`}>
        <a className="brand" href="#about">MAQ</a>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
          <span />
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
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
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
              {profileImageUrl ? (
                <img
                  className="profile-photo"
                  src={profileImageUrl}
                  alt="Marco Angelo Quanico profile"
                  loading="lazy"
                />
              ) : (
                <div className="preview-fallback">
                  <span>Set CLOUDFLARE_R2_PROFILE_IMAGE_URL in your env file.</span>
                </div>
              )}
              <div className="profile-glow" aria-hidden="true" />
            </div>
            <div className="hero-badge">
              <span className="badge-dot" />
              Open for client collaboration
            </div>
          </div>

          <div className="hero-text">
            <div className="hero-roles">
              <span>Computer Vision Researcher</span>
              <span>·</span>
              <span>Business-Oriented Software Builder</span>
            </div>
            <h1>
              I build<br />
              <em>outcome-first</em><br />
              digital systems.
            </h1>
            <p className="hero-desc">
              I prioritize client satisfaction, measurable outcomes, and reliable delivery. I also offer free
              consultation sessions via your preferred video-call platform.
            </p>
            <div className="hero-actions">
              <a href="#research" className="btn-primary">View Research</a>
              <a href={resumePdf} className="btn-ghost" download>Download Resume</a>
            </div>
          </div>
        </section>

        <section id="research">
          <div className="section-label-row">
            <span className="section-index">02</span>
            <h2>Academic Research Highlight</h2>
          </div>

          <div className="research-grid">
            <article className="research-card">
              <p className="research-tag">Best Thesis · 2026 ICT Expo</p>
              <h3>YOLOv8-based Computer Vision for Classifying and Counting Three Species</h3>
              <p>
                The thesis explores practical computer vision pipelines using YOLOv8 to classify and count three
                species accurately, with emphasis on real-world deployment reliability and output interpretation.
              </p>
              <div className="hero-actions">
                {thesisPaperUrl ? (
                  <a href={thesisPaperUrl} className="btn-primary" target="_blank" rel="noreferrer" download>
                    Download Thesis Paper
                  </a>
                ) : (
                  <span className="research-note">Set VITE_THESIS_PAPER_URL to enable paper preview and download.</span>
                )}
                <a href={resumePdf} className="btn-ghost" download>
                  Download Resume
                </a>
              </div>
            </article>

            <article className="thesis-preview">
              {thesisPaperUrl ? (
                <iframe
                  title="Research thesis paper preview"
                  src={thesisPaperUrl}
                  loading="lazy"
                />
              ) : (
                <div className="preview-fallback">
                  <span>Thesis preview appears here when VITE_THESIS_PAPER_URL is set.</span>
                </div>
              )}
            </article>
          </div>
        </section>

        <section id="projects">
          <div className="section-label-row">
            <span className="section-index">03</span>
            <h2>Project Portfolio</h2>
          </div>

          <div className="bento-grid">
            {projects.map((project, index) => (
              <article key={project.name} className="project-card span-full">
                <div className="card-stripe" aria-hidden="true" />

                <div className="project-head">
                  <img src={project.logo} alt={`${project.name} logo`} width={48} height={48} loading="lazy" />
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.summary}</p>
                  </div>
                  <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
                </div>

                <div className="stack-list" aria-label={`${project.name} technologies`}>
                  {project.stack.map((item) => (
                    <span key={`${project.name}-${item}`}>{item}</span>
                  ))}
                </div>

                <p className="project-outcome">{project.outcome}</p>

                <div className="preview-box">
                  {project.mediaUrl && project.mediaType === 'video' ? (
                    <video controls preload="metadata" src={project.mediaUrl} />
                  ) : project.mediaUrl && project.mediaType === 'image' ? (
                    <img src={project.mediaUrl} alt={`${project.name} preview`} loading="lazy" />
                  ) : (
                    <div className="preview-fallback">
                      <span>
                        No public media file is attached for this project. Demo walk-through is available by request.
                      </span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="services">
          <div className="section-label-row">
            <span className="section-index">04</span>
            <h2>Client Outcome Focus</h2>
          </div>
          <p className="section-body">
            I work with a business lens: aligning system design, delivery pace, and product decisions with client
            goals, satisfaction, and long-term operational value.
          </p>
          <div className="floater-showcase" aria-label="Client value pillars">
            <span>Outcome-driven planning</span>
            <span>Transparent communication</span>
            <span>Quality-first implementation</span>
            <span>Free video-call consultation</span>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="section-index">05</span>
            <p className="footer-tagline">Let’s plan your next system with clarity and business impact.</p>
          </div>
          <div className="social-links">
            <a href="mailto:geloquanico@gmail.com">Email for Consultation ↗</a>
            <a href="https://github.com/geloquan" target="_blank" rel="noreferrer">GitHub ↗</a>
            <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn ↗</a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">Facebook ↗</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Marco Angelo Quanico</span>
          <span>Bacolod City / Cebu City, PH</span>
        </div>
      </footer>
    </div>
  )
}

export default App
