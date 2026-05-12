import { useEffect, useMemo, useState } from 'react'
import './App.css'

type Project = {
  name: string
  summary: string
  avatarUrl: string
  mediaType: 'image' | 'video'
  mediaUrl?: string
  youtubeUrl?: string
  facebookUrl?: string
}

const primaryColor = '#92DCE5'
const env = import.meta.env as Record<string, string | undefined>

const getCloudflareR2EnvValue = (name: string) =>
  env[`CLOUDflare_R2_${name}`] ?? env[`CLOUDFLARE_R2_${name}`]

const toEmbedYoutubeUrl = (url?: string) => {
  if (!url) return undefined
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : undefined
    }
    const videoId = parsedUrl.searchParams.get('v')
    return videoId ? `https://www.youtube.com/embed/${videoId}` : undefined
  } catch {
    return undefined
  }
}

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

  const projects: Project[] = useMemo(
      () => [
        {
          name: 'Portfolio Experience',
          summary: 'A responsive, conversion-focused portfolio showcasing product, UI, and frontend engineering work.',
          avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=portfolio',
          mediaType: 'image',
          mediaUrl: getCloudflareR2EnvValue('PROJECT_ONE_MEDIA_URL'),
          youtubeUrl: import.meta.env.VITE_PROJECT_ONE_YOUTUBE_URL,
          facebookUrl: import.meta.env.VITE_PROJECT_ONE_FACEBOOK_URL,
        },
        {
          name: 'Creator Demo Reel',
          summary: 'A short-form highlight reel for social campaigns and interactive launch pages.',
          avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=creator',
          mediaType: 'video',
          mediaUrl: getCloudflareR2EnvValue('PROJECT_TWO_MEDIA_URL'),
          youtubeUrl: import.meta.env.VITE_PROJECT_TWO_YOUTUBE_URL,
        },
        {
          name: 'Cloud Media Hub',
          summary: 'Cloudflare-first media delivery with optimized image/video pipelines and lightweight UX.',
          avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=cloud',
          mediaType: 'image',
          mediaUrl: getCloudflareR2EnvValue('PROJECT_THREE_MEDIA_URL'),
          facebookUrl: import.meta.env.VITE_PROJECT_THREE_FACEBOOK_URL,
        },
        {
          name: 'Community Launch Kit',
          summary: 'Landing experience with social storytelling, creator assets, and audience-ready previews.',
          avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=community',
          mediaType: 'video',
          mediaUrl: getCloudflareR2EnvValue('PROJECT_FOUR_MEDIA_URL'),
        },
      ],
      [],
  )

  const sections = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ]

  return (
      <div className={`app-shell ${reducedMotion ? 'reduce-motion' : ''}`}>
        <div className="grain" aria-hidden="true" />

        {/* ── NAV ── */}
        <header className={`top-nav ${isNavIsland ? 'island' : ''}`}>
          <a className="brand" href="#about">MAQ</a>

          <button
              className="menu-toggle"
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen((c) => !c)}
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
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀' : '◑'}
            </button>
          </nav>
        </header>

        <main>
          {/* ── HERO ── */}
          <section className="hero" id="about">
            <div className="hero-visual">
              <div className="profile-wrap">
                {profileImageUrl ? (
                    <img
                        className="profile-photo"
                        src={profileImageUrl}
                        alt="Marco Angelo Quanico character portrait"
                        loading="lazy"
                    />
                ) : (
                    <div className="preview-fallback">
                      <span>Set CLOUDflare_R2_PROFILE_IMAGE_URL in .env to show profile photo.</span>
                    </div>
                )}
                <div className="profile-glow" aria-hidden="true" />
              </div>
              <div className="hero-badge">
                <span className="badge-dot" />
                Available for work
              </div>
            </div>

            <div className="hero-text">
              <div className="hero-roles">
                <span>Frontend Engineer</span>
                <span>·</span>
                <span>Product Builder</span>
              </div>
              <h1>
                Building<br />
                <em>expressive</em><br />
                experiences.
              </h1>
              <p className="hero-desc">
                I design and ship modern portfolio and product experiences that blend
                performance, storytelling, and visual interaction.
              </p>
              <div className="hero-actions">
                <a href="#projects" className="btn-primary">View Projects</a>
                <a href="#contact" className="btn-ghost">Get in Touch ↗</a>
              </div>
            </div>
          </section>

          {/* ── PROJECTS ── */}
          <section id="projects">
            <div className="section-label-row">
              <span className="section-index">02</span>
              <h2>Selected Projects</h2>
            </div>

            <div className="bento-grid">
              {projects.map((project, i) => {
                const youtubeEmbed = toEmbedYoutubeUrl(project.youtubeUrl)
                return (
                    <article key={project.name} className={`project-card span-${i === 0 || i === 3 ? 'full' : 'half'}`}>
                      <div className="card-stripe" aria-hidden="true" />

                      <div className="project-head">
                        <img src={project.avatarUrl} alt={`${project.name} avatar`} width={48} height={48} loading="lazy" />
                        <div>
                          <h3>{project.name}</h3>
                          <p>{project.summary}</p>
                        </div>
                        <span className="card-index">{String(i + 1).padStart(2, '0')}</span>
                      </div>

                      <div className="preview-box">
                        {project.mediaUrl ? (
                            project.mediaType === 'video' ? (
                                <video controls preload="metadata" src={project.mediaUrl} />
                            ) : (
                                <img src={project.mediaUrl} alt={`${project.name} preview`} loading="lazy" />
                            )
                        ) : (
                            <div className="preview-fallback">
                              <span>Set CLOUDflare_R2_PROJECT_*_MEDIA_URL in .env to show preview.</span>
                            </div>
                        )}
                      </div>

                      {youtubeEmbed && (
                          <div className="embed-wrap">
                            <iframe
                                title={`${project.name} YouTube preview`}
                                src={youtubeEmbed}
                                loading="lazy"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                          </div>
                      )}

                      {project.facebookUrl && (
                          <a className="facebook-preview" href={project.facebookUrl} target="_blank" rel="noreferrer">
                            <span className="fb-label">Facebook</span>
                            <strong>{project.name} launch post</strong>
                            <small>Tap to open the full post ↗</small>
                          </a>
                      )}
                    </article>
                )
              })}
            </div>
          </section>

          {/* ── SKILLS ── */}
          <section id="skills">
            <div className="section-label-row">
              <span className="section-index">03</span>
              <h2>Skill Gain: Three.js Floaters</h2>
            </div>
            <p className="section-body">
              I recently leveled up in building floater systems with three.js, focusing on lightweight
              motion, depth, and smooth interaction timing for portfolio visuals.
            </p>
            <div className="floater-showcase" aria-label="Three.js floater skill showcase">
              <span>three.js scene setup</span>
              <span>floating meshes</span>
              <span>interaction tuning</span>
            </div>
          </section>

          {/* ── EDUCATION ── */}
          <section id="education">
            <div className="section-label-row">
              <span className="section-index">04</span>
              <h2>Education</h2>
            </div>
            <div className="education-card">
              <div className="edu-year">B.S. Information Technology</div>
              <h3>University-focused training in software engineering, UI/UX, and web systems architecture.</h3>
              <p>Core focus: frontend engineering, cloud deployment, and multimedia web delivery.</p>
            </div>
          </section>
        </main>

        {/* ── FOOTER / CONTACT ── */}
        <footer id="contact" className="footer">
          <div className="footer-inner">
            <div className="footer-left">
              <span className="section-index">05</span>
              <p className="footer-tagline">Let's collaborate on modern web experiences.</p>
            </div>
            <div className="social-links">
              <a href="https://github.com/geloquan" target="_blank" rel="noreferrer">GitHub ↗</a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn ↗</a>
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer">Facebook ↗</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 Marco Angelo Quanico</span>
            <span>Cebu City, PH</span>
          </div>
        </footer>
      </div>
  )
}

export default App
