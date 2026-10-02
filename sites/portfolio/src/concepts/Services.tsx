import { PROJECTS } from '../data/projects'
import { CARE_PLAN, PACKAGES, usd } from '../data/services'
import { Link } from '../lib/router'
import './services.css'

const STEPS = [
  { title: 'Intro call', body: '20 minutes on your goals, audience and deadline.' },
  { title: 'Free mock-up', body: 'A designed homepage for your brand within 48 hours, before you commit.' },
  { title: 'Build', body: 'Fixed price, 50% to start. You review a live link as it takes shape.' },
  { title: 'Launch', body: 'Domain, hosting and handover. Optional monthly care afterwards.' },
]

export default function Services({ onPick }: { onPick: (service: string) => void }) {
  return (
    <section className="ca-services" id="services" aria-labelledby="services-title">
      <p className="ca-label">(Services)</p>
      <h2 className="ca-services__title" id="services-title">
        A site that looks like it has a <em>whole team</em> behind it. Delivered in days, at a fixed price.
      </h2>

      <ol className="ca-packages">
        {PACKAGES.map((pkg, i) => {
          const example = PROJECTS.find((p) => p.id === pkg.example)
          return (
            <li key={pkg.id} className="ca-package">
              <span className="ca-package__no">{String(i + 1).padStart(2, '0')}</span>
              <div className="ca-package__head">
                <h3>{pkg.name}</h3>
                <p>{pkg.pitch}</p>
                {example && <Link to={`/work/${example.id}`} className="ca-package__eg">See it in {example.name} <span aria-hidden="true">→</span></Link>}
              </div>
              <ul className="ca-package__list">{pkg.includes.map((x) => <li key={x}>{x}</li>)}</ul>
              <div className="ca-package__price">
                <span className="ca-package__from">from</span>
                <b>{usd(pkg.from)}</b>
                <span className="ca-package__time">{pkg.delivery}</span>
                <a href="#contact" className="ca-package__cta" onClick={() => onPick(pkg.name)}>Start a {pkg.name.toLowerCase()} <span aria-hidden="true">↘</span></a>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="ca-care"><span>+</span> Care plan from <b>{usd(CARE_PLAN.from)}/month</b>: {CARE_PLAN.includes}.</p>

      <ol className="ca-steps" aria-label="How it works">
        {STEPS.map((s, i) => (
          <li key={s.title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{s.title}</h3><p>{s.body}</p></li>
        ))}
      </ol>
    </section>
  )
}
