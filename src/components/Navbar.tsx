import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { site } from '../config/site'
import { lockScroll } from '../lib/scroll'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setOpen(false), [pathname])

  // Condense and hide-on-scroll-down behaviour.
  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setHidden(y > last && y > 240)
      last = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Mobile menu: lock scroll, close on Escape.
  useEffect(() => {
    if (!open) return
    lockScroll(true)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      lockScroll(false)
    }
  }, [open])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors hover:text-foreground ${pathname === '/' && !scrolled ? 'text-white/80' : isActive ? 'text-foreground' : 'text-muted'}`
  const transparentHome = pathname === '/' && !scrolled && !open

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          hidden && !open ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled || open ? 'bg-background/80 backdrop-blur-md' : 'bg-transparent'}`}
      >
        <nav aria-label="Primary" className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-8 md:py-6">
          <Link to="/" className={`font-display text-3xl tracking-tight ${pathname === '/' && !scrolled ? 'text-white' : ''}`}>
            <span className="nav-brand-mark" aria-hidden="true">✳</span>{site.name}
          </Link>

          <ul className="hidden items-center gap-8 md:flex">
            {site.nav.map(({ label, to }) => (
              <li key={to}>
                <NavLink to={to} className={linkClass}>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              to="/planner"
              className="hidden rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-transform hover:scale-[1.03] sm:inline-block"
            >
              Start planning <span aria-hidden="true">↗</span>
            </Link>
            <button
              type="button"
              className={`relative grid h-11 w-11 place-items-center rounded-full border md:hidden ${transparentHome ? 'border-white/50' : 'border-line'}`}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span className={`absolute h-px w-5 transition-transform duration-300 ${transparentHome ? 'bg-white' : 'bg-foreground'} ${open ? 'rotate-45' : '-translate-y-1'}`} />
              <span className={`absolute h-px w-5 transition-transform duration-300 ${transparentHome ? 'bg-white' : 'bg-foreground'} ${open ? '-rotate-45' : 'translate-y-1'}`} />
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col justify-end bg-background px-6 pb-12 pt-28 transition-[clip-path] duration-700 ease-[cubic-bezier(.76,0,.24,1)] md:hidden ${
          open ? '[clip-path:inset(0_0_0_0)]' : '[clip-path:inset(0_0_100%_0)]'
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <ul className="flex flex-col gap-2">
          {site.nav.map(({ label, to }) => (
            <li key={to}>
              <Link to={to} className="font-display mobile-nav-link block py-1 tracking-tight">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <Link to="/planner" className="mt-10 rounded-full bg-foreground px-8 py-4 text-center text-base text-background">
          Start planning ↗
        </Link>
      </div>
    </>
  )
}
