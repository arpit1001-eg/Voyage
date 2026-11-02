import { useState } from 'react'
import { Link } from 'react-router'
import type { Destination } from '../../shared/types'
import { useFetch } from '../lib/api'
import DestinationImage from './DestinationImage'

/** Home-page list: hover or focus a row to change the preview photo. */
export default function FeaturedDestinations() {
  const { data } = useFetch<Destination[]>('/api/destinations')
  const items = data?.slice(0, 5) ?? []
  const [active, setActive] = useState(0)

  if (!items.length) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      <div className="mb-14 flex items-end justify-between gap-6">
        <h2 className="font-display text-5xl leading-none tracking-[-0.03em] md:text-7xl">
          Where we <span className="italic text-muted">go</span>
        </h2>
        <Link to="/destinations" className="shrink-0 text-sm underline underline-offset-4 decoration-line transition-colors hover:decoration-foreground">
          All destinations
        </Link>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
        <ul className="border-t border-line" onMouseLeave={() => setActive(0)}>
          {items.map((d, i) => (
            <li key={d.id} className="border-b border-line">
              <Link
                to={`/destinations/${d.slug}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="flex items-baseline justify-between gap-6 py-6"
              >
                <span
                  className={`font-display text-4xl tracking-tight transition-all duration-500 md:text-6xl ${
                    active === i ? 'translate-x-3 text-foreground' : 'text-muted'
                  }`}
                >
                  {d.name}
                </span>
                <span className="shrink-0 text-right text-sm text-muted">
                  {d.country}
                  {d.duration && <span className="block">{d.duration}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="relative hidden aspect-[4/5] self-start overflow-hidden rounded-3xl lg:sticky lg:top-28 lg:block" aria-hidden="true">
          {items.map((d, i) => (
            <div key={d.id} className={`absolute inset-0 transition-opacity duration-700 ${active === i ? 'opacity-100' : 'opacity-0'}`}>
              <DestinationImage destination={d} file="cover" className="h-full w-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
