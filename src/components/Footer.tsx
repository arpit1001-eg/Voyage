import { Link } from 'react-router'
import { site } from '../config/site'

export default function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-6 pb-8 pt-12 md:px-8">
      <div className="flex flex-col gap-8 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <ul className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          {site.nav.map(({ label, to }) => (
            <li key={to}>
              <Link to={to} className="transition-colors hover:text-foreground">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        {site.email
          ? <a href={`mailto:${site.email}`} className="text-sm text-muted transition-colors hover:text-foreground">{site.email}</a>
          : <span className="text-sm text-muted">Contact details are not configured for this demo.</span>}
      </div>

      <div className="footer-legal-links">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/discover">Explore destinations</Link>
        <Link to="/adventure">Passport Quest</Link>
        <Link to="/my-adventures">My Adventures</Link>
      </div>

      <p className="mt-8 max-w-xl text-xs leading-relaxed text-muted">
        VOYAGE is a travel discovery and planning demo. It does not book travel, quote live prices, or issue real-world rewards.
      </p>

      <p aria-hidden="true" className="font-display mt-10 select-none text-[27vw] leading-[0.8] tracking-[-0.04em] md:text-[22vw]">
        {site.name}
        <sup className="align-super text-[0.25em]">®</sup>
      </p>

      <p className="mt-6 text-xs text-muted">© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
    </footer>
  )
}
