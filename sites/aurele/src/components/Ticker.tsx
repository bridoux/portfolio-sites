/** Slow specs ticker used as a breather between Collection and Atelier. */
const TICKER: [string, string][] = [
  ['', 'Grade 5 titanium'], ['28,800', ' vibrations an hour'], ['', 'Côtes de Genève'],
  ['347', ' parts, one watchmaker'], ['', 'Vallée de Joux since 1891'], ['', 'Serviced for life'],
]

export function Ticker() {
  const row = [...TICKER, ...TICKER]
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {row.map(([em, text], i) => <span key={i}>{em && <em>{em}</em>}{text}</span>)}
      </div>
    </div>
  )
}
