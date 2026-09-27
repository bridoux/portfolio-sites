import { useEffect } from 'react'
import { initSmoothScroll, ScrollTrigger } from './lib/motion'
import { usePath } from './lib/router'
import { OWNER, PROJECTS } from './data/projects'
import { cap, numberWord } from './lib/words'
import IndexConcept from './concepts/IndexConcept'
import CaseStudy from './concepts/CaseStudy'
import ExhibitionConcept from './concepts/ExhibitionConcept'
import LiveConcept from './concepts/LiveConcept'

/**
 * Routes
 *   /             Portfolio (A · Index)
 *   /work/:id     Case study
 *   /exhibition   Standalone "exhibition" presentation (B)
 *   /live         Standalone "live sites" presentation (C)
 */
function resolve(path: string) {
  const count = cap(numberWord(PROJECTS.length))
  const clean = path.replace(/\/+$/, '') || '/'
  if (clean === '/exhibition') return { key: 'exhibition', title: `${count} Sites — an exhibition in code`, page: <ExhibitionConcept /> }
  if (clean === '/live') return { key: 'live', title: `${count} Sites — running live`, page: <LiveConcept /> }
  const work = clean.match(/^\/work\/([\w-]+)$/)
  const project = work && PROJECTS.find((p) => p.id === work[1])
  if (project) return { key: `work-${project.id}`, title: `${project.name} — case study · ${OWNER.name}`, page: <CaseStudy project={project} /> }
  return { key: 'home', title: `${OWNER.name} — Selected work`, page: <IndexConcept /> }
}

export default function App() {
  const path = usePath()
  const route = resolve(path)

  useEffect(() => {
    document.title = route.title
    const stop = initSmoothScroll()
    // New page: start at the top, or at the #section the link pointed to
    const hash = window.location.hash
    window.scrollTo(0, 0)
    const id = window.setTimeout(() => {
      ScrollTrigger.refresh()
      if (hash) document.querySelector(hash)?.scrollIntoView()
    }, 120)
    return () => { window.clearTimeout(id); stop() }
  }, [route.key, route.title])

  return <div key={route.key}>{route.page}</div>
}
