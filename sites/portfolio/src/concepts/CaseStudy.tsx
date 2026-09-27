import { useEffect, useRef } from 'react'
import { OWNER, PROJECTS, projectNumber, type Project } from '../data/projects'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { Link } from '../lib/router'
import { SiteNav } from './IndexConcept'
import './index-concept.css'
import './case-study.css'

export default function CaseStudy({ project }: { project: Project }) {
  const root = useRef<HTMLDivElement>(null)
  const i = PROJECTS.findIndex((p) => p.id === project.id)
  const next = PROJECTS[(i + 1) % PROJECTS.length]

  useEffect(() => {
    const el = root.current
    if (!el || prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.from('.cs-title__line > span', { yPercent: 110, duration: 1.3, ease: 'expo.out', stagger: 0.08 })
      gsap.from('.cs-meta > *, .cs-head__top > *', { y: 20, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.05, delay: 0.3 })
      gsap.fromTo('.cs-hero img', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.cs-hero', start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('.cs-detail img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.cs-detail', start: 'top bottom', end: 'bottom top', scrub: true } })
    }, el)
    return () => ctx.revert()
  }, [project.id])

  const style = { ['--bg' as string]: project.palette.bg, ['--fg' as string]: project.palette.fg, ['--accent' as string]: project.palette.accent }

  return (
    <div ref={root} className="ca cs" style={style}>
      <div className="ca-grain" aria-hidden="true" />
      <SiteNav />

      <header className="cs-head">
        <div className="cs-head__top">
          <Link to="/#work" className="cs-back">← Index</Link>
          <span>{projectNumber(i)} / {projectNumber(PROJECTS.length - 1)}</span>
        </div>
        <h1 className="cs-title">
          <span className="cs-title__line"><span>{project.name}</span></span>
          <span className="cs-title__line cs-title__tag"><span><em>{project.tagline}</em></span></span>
        </h1>
        <dl className="cs-meta">
          <div><dt>Discipline</dt><dd>{project.kind}</dd></div>
          <div><dt>Year</dt><dd>{project.year}</dd></div>
          <div><dt>Scope</dt><dd>{project.scope.join(', ')}</dd></div>
          <div><dt>Built with</dt><dd>{project.medium.join(', ')}</dd></div>
          <a className="cs-live" href={project.url} target="_blank" rel="noopener noreferrer">Visit live site <span aria-hidden="true">↗</span></a>
        </dl>
      </header>

      <figure className="cs-hero"><img src={project.hero} alt={`${project.name} homepage`} /></figure>

      <section className="cs-block">
        <p className="ca-label">(The challenge)</p>
        <p className="cs-lead">{project.challenge}</p>
      </section>

      <section className="cs-block">
        <p className="ca-label">(The approach)</p>
        <ol className="cs-approach">
          {project.approach.map((a, n) => (
            <li key={a.title}>
              <span className="cs-approach__n">0{n + 1}</span>
              <h2>{a.title}</h2>
              <p>{a.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <figure className="cs-detail"><img src={project.detail} alt={`${project.name}: ${project.signature}`} loading="lazy" /></figure>

      <Link to={`/work/${next.id}`} className="cs-next" style={{ ['--next-bg' as string]: next.palette.bg, ['--next-fg' as string]: next.palette.fg }}>
        <span className="ca-label">(Next project)</span>
        <span className="cs-next__name">{next.name}<i aria-hidden="true">→</i></span>
        <img src={next.hero} alt="" loading="lazy" />
      </Link>

      <footer className="ca-foot cs-foot">
        <div className="ca-foot__row"><a href={`mailto:${OWNER.email}`}>{OWNER.email}</a><span>© 2026 {OWNER.name}</span></div>
      </footer>
    </div>
  )
}
