import { useEffect, useState, type AnchorHTMLAttributes, type MouseEvent } from 'react'

/** Minimal History-API router: enough for a handful of pages, no dependency. */
const EVENT = 'app:navigate'

export function navigate(to: string) {
  const url = new URL(to, window.location.href)
  // Same page, different #section: just scroll there
  if (url.pathname === window.location.pathname) {
    if (url.hash) {
      window.history.pushState(null, '', to)
      document.querySelector(url.hash)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return
  }
  window.history.pushState(null, '', to)
  window.dispatchEvent(new Event(EVENT))
}

export function usePath(): string {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const update = () => setPath(window.location.pathname)
    window.addEventListener('popstate', update)
    window.addEventListener(EVENT, update)
    return () => { window.removeEventListener('popstate', update); window.removeEventListener(EVENT, update) }
  }, [])
  return path
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

/** In-app link: keeps normal browser behaviour for modified clicks (new tab etc.). */
export function Link({ to, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handle} {...rest} />
}
