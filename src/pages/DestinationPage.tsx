import { Link, useParams } from 'react-router'
import { useEffect } from 'react'
import type { Destination } from '../../shared/types'
import { useFetch } from '../lib/api'
import DestinationImage from '../components/DestinationImage'
import NotFound from './NotFound'
import Seo from '../components/Seo'
import { useVoyage } from '../lib/voyage'
import { dailySpendEstimate } from '../../shared/travelBudget'

export default function DestinationPage() {
  const { slug = '' } = useParams()
  const { data: passport, update } = useVoyage()
  const { data: d, error, loading } = useFetch<Destination>(`/api/destinations/${encodeURIComponent(slug)}`)
  const { data: all } = useFetch<Destination[]>('/api/destinations')

  useEffect(() => {
    if (!d) return
    try {
      const recent = JSON.parse(window.localStorage.getItem('voyage-recent-destinations') ?? '[]') as string[]
      window.localStorage.setItem('voyage-recent-destinations', JSON.stringify([d.slug, ...recent.filter((item) => item !== d.slug)].slice(0, 5)))
    } catch (reason) {
      console.error('Could not update recently viewed destinations:', reason)
    }
  }, [d])

  if (error?.status === 404) return <NotFound />
  if (!d) {
    return (
      <div className="mx-auto min-h-svh max-w-7xl px-6 pt-48 md:px-8">
        <p role={error ? 'alert' : 'status'} className="text-muted">
          {loading ? 'Loading destination…' : 'This destination couldn’t be loaded. Refresh to try again.'}
        </p>
      </div>
    )
  }

  const list = all ?? []
  const idx = list.findIndex((x) => x.slug === d.slug)
  const next = list.length > 1 && idx >= 0 ? list[(idx + 1) % list.length] : null
  const facts = [
    { label: 'Country', value: d.country },
    { label: 'Duration', value: d.duration },
    { label: 'Best season', value: d.bestSeason },
    { label: 'Demo daily budget', value: `Approx. $${dailySpendEstimate(d.region)} / person` },
    { label: 'Price', value: d.priceFrom },
  ].filter((f) => f.value)
  const isSaved = passport.savedDestinations.includes(d.slug)

  return (
    <article>
      <Seo title={`${d.name}, ${d.country}`} />
      <header className="mx-auto max-w-7xl px-6 pb-12 pt-36 md:px-8 md:pt-48">
        <Link to="/destinations" className="text-sm text-muted transition-colors hover:text-foreground">Back to destinations</Link>
        {d.region && <p className="mt-6 text-sm text-muted">{d.region}</p>}
        <h1 className="font-display mt-2 text-6xl leading-[0.95] tracking-[-0.03em] md:text-9xl">{d.name}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{d.summary}</p>

        <dl className="mt-12 grid gap-8 border-t border-line pt-6 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.label}><dt className="text-muted">{f.label}</dt><dd className="mt-1">{f.value}</dd></div>
          ))}
        </dl>
      </header>

      <p className="destination-estimate-note">Regional demo estimate only · per traveller, per day · excludes flights · not a live quote</p>

      {d.coordinates && (
        <p className="destination-coordinate-note">
          APPROXIMATE DESTINATION CENTRE · {d.coordinates.latitude.toFixed(2)}°, {d.coordinates.longitude.toFixed(2)}°
        </p>
      )}

      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <DestinationImage destination={d} file="wide" eager className="aspect-video w-full rounded-3xl" />
      </div>

      {d.body.length > 0 && (
        <div className="mx-auto max-w-3xl space-y-6 px-6 py-20 text-xl leading-relaxed md:py-28">
          {d.body.map((para, i) => <p key={i}>{para}</p>)}
        </div>
      )}

      {d.highlights.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-20 md:px-8">
          <h2 className="font-display mb-8 text-4xl tracking-tight md:text-5xl">Highlights</h2>
          <ul className="grid gap-x-10 border-t border-line sm:grid-cols-2">
            {d.highlights.map((h) => (
              <li key={h} className="border-b border-line py-4 text-lg">{h}</li>
            ))}
          </ul>
        </section>
      )}

      {d.itinerary.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8">
          <h2 className="font-display mb-8 text-4xl tracking-tight md:text-5xl">A sample itinerary</h2>
          <ol className="border-t border-line">
            {d.itinerary.map((day, i) => (
              <li key={i} className="grid gap-2 border-b border-line py-6 md:grid-cols-[8rem_1fr_2fr] md:gap-8">
                <span className="text-sm text-muted tabular-nums">Step {String(i + 1).padStart(2, '0')}</span>
                <h3 className="font-display text-3xl tracking-tight">{day.title}</h3>
                <p className="leading-relaxed text-muted">{day.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {d.gallery.length > 0 && (
        <div className="mx-auto grid max-w-7xl gap-8 px-6 pb-24 md:grid-cols-2 md:px-8">
          {d.gallery.map((_, i) => (
            <DestinationImage key={i} destination={d} file={i + 1} className="aspect-[4/5] w-full rounded-3xl" />
          ))}
        </div>
      )}

      <section className="mx-auto max-w-7xl border-t border-line px-6 py-24 md:px-8">
        <h2 className="font-display max-w-3xl text-5xl leading-[0.98] tracking-[-0.03em] md:text-7xl">
          Interested in <span className="italic text-muted">{d.name}?</span>
        </h2>
        <div className="destination-actions">
          <Link to={`/planner?destination=${encodeURIComponent(d.slug)}`} className="voyage-button voyage-button-dark">Add to my itinerary ↗</Link>
          <button type="button" className="voyage-button voyage-button-light" aria-pressed={isSaved} onClick={() => update((current) => ({ ...current, savedDestinations: isSaved ? current.savedDestinations.filter((item) => item !== d.slug) : [...current.savedDestinations, d.slug] }))}>{isSaved ? 'Saved to passport ✓' : 'Save this place +'}</button>
          <Link to="/adventure" className="voyage-button voyage-button-light">Try a destination challenge ↗</Link>
          <Link to={`/plan?destination=${encodeURIComponent(d.slug)}`} className="text-link">Talk to a trip planner</Link>
        </div>
      </section>

      {next && (
        <Link to={`/destinations/${next.slug}`} className="group mx-auto block max-w-7xl border-t border-line px-6 py-16 md:px-8">
          <span className="text-sm text-muted">Next destination</span>
          <span className="font-display mt-2 block text-5xl tracking-tight transition-transform duration-500 group-hover:translate-x-3 md:text-8xl">
            {next.name}
          </span>
        </Link>
      )}
    </article>
  )
}
