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
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'light'
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

  const projects: Project[] = useMemo(
    () => [
      {
        name: 'Portfolio Experience',
        summary: 'A responsive, conversion-focused portfolio showcasing product, UI, and frontend engineering work.',
        avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=portfolio',
        mediaType: 'image',
        mediaUrl: import.meta.env.VITE_PROJECT_ONE_MEDIA_URL,
        youtubeUrl: import.meta.env.VITE_PROJECT_ONE_YOUTUBE_URL,
        facebookUrl: import.meta.env.VITE_PROJECT_ONE_FACEBOOK_URL,
      },
      {
        name: 'Creator Demo Reel',
        summary: 'A short-form highlight reel for social campaigns and interactive launch pages.',
        avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=creator',
        mediaType: 'video',
        mediaUrl: import.meta.env.VITE_PROJECT_TWO_MEDIA_URL,
        youtubeUrl: import.meta.env.VITE_PROJECT_TWO_YOUTUBE_URL,
      },
      {
        name: 'Cloud Media Hub',
        summary: 'Cloudflare-first media delivery with optimized image/video pipelines and lightweight UX.',
        avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=cloud',
        mediaType: 'image',
        mediaUrl: import.meta.env.VITE_PROJECT_THREE_MEDIA_URL,
        facebookUrl: import.meta.env.VITE_PROJECT_THREE_FACEBOOK_URL,
      },
      {
        name: 'Community Launch Kit',
        summary: 'Landing experience with social storytelling, creator assets, and audience-ready previews.',
        avatarUrl: 'https://api.dicebear.com/9.x/thumbs/svg?seed=community',
        mediaType: 'video',
        mediaUrl: import.meta.env.VITE_PROJECT_FOUR_MEDIA_URL,
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
      <header className={`top-nav ${isNavIsland ? 'island' : ''}`}>
        <a className="brand" href="#about">
          Marco Angelo Quanico
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((current) => !current)}
        >
          ☰
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
            onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </nav>
      </header>

      <main>
        <section className="hero" id="about">
          <img
            className="profile-photo"
            src="/profile-placeholder.svg"
            alt="Marco Angelo Quanico character portrait"
            loading="lazy"
          />
          <div>
            <p className="pill">Marco Angelo Quanico · Frontend Engineer · Product Builder</p>
            <h1>Building expressive, high-performance digital experiences.</h1>
            <p>
              I design and ship modern portfolio and product experiences that blend performance, storytelling, and
              visual interaction.
            </p>
          </div>
        </section>

        <section id="projects">
          <h2>Projects</h2>
          <div className="project-grid">
            {projects.map((project) => {
              const youtubeEmbed = toEmbedYoutubeUrl(project.youtubeUrl)

              return (
                <article key={project.name} className="project-card">
                  <div className="project-head">
                    <img src={project.avatarUrl} alt={`${project.name} avatar`} width={56} height={56} loading="lazy" />
                    <div>
                      <h3>{project.name}</h3>
                      <p>{project.summary}</p>
                    </div>
                  </div>

                  <div className="preview-box">
                    {project.mediaUrl ? (
                      project.mediaType === 'video' ? (
                        <video controls preload="metadata" src={project.mediaUrl} />
                      ) : (
                        <img src={project.mediaUrl} alt={`${project.name} preview`} loading="lazy" />
                      )
                    ) : (
                      <div className="preview-fallback">Set Cloudflare media URL in .env to show preview.</div>
                    )}
                  </div>

                  {youtubeEmbed ? (
                    <div className="embed-wrap">
                      <iframe
                        title={`${project.name} YouTube preview`}
                        src={youtubeEmbed}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : null}

                  {project.facebookUrl ? (
                    <a className="facebook-preview" href={project.facebookUrl} target="_blank" rel="noreferrer">
                      <span>Facebook preview</span>
                      <strong>{project.name} launch post</strong>
                      <small>Tap to open the full post</small>
                    </a>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>

        <section id="skills">
          <h2>Skill Gain: Three.js Floaters</h2>
          <p>
            I recently leveled up in building floater systems with three.js, focusing on lightweight motion, depth, and
            smooth interaction timing for portfolio visuals.
          </p>
          <div className="floater-showcase" aria-label="Three.js floater skill showcase">
            <span>three.js scene setup</span>
            <span>floating meshes</span>
            <span>interaction tuning</span>
          </div>
        </section>

        <section id="education">
          <h2>Education</h2>
          <div className="education-card">
            <h3>Bachelor of Science in Information Technology</h3>
            <p>University-focused training in software engineering, UI/UX, and web systems architecture.</p>
            <small>Core focus: frontend engineering, cloud deployment, and multimedia web delivery.</small>
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <p>Let&apos;s collaborate on modern web experiences.</p>
        <div className="social-links">
          <a href="https://github.com/geloquan" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
            Facebook
          </a>
        </div>
      </footer>
    </div>
  )
}

export default App
