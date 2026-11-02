import { Link } from 'react-router'
import type { Destination } from '../../shared/types'
import { useFetch } from '../lib/api'
import PageHeader from '../components/PageHeader'
import DestinationImage from '../components/DestinationImage'
import CtaBand from '../components/CtaBand'
import Seo from '../components/Seo'

export default function Destinations() {
  const { data, error, loading } = useFetch<Destination[]>('/api/destinations')

  return (
    <>
      <Seo title="Destinations" />
      <PageHeader
        title={<>Where we <span className="italic text-muted">go.</span></>}
        lead="A few of the places we plan journeys to. Every trip is adjusted to your dates, pace and interests."
      />
      {loading && <p className="mx-auto max-w-7xl px-6 pb-24 text-muted md:px-8">Loading destinations…</p>}
      {error && !data && (
        <p role="alert" className="mx-auto max-w-7xl px-6 pb-24 text-muted md:px-8">Destinations couldn’t be loaded. Refresh to try again.</p>
      )}
      {data && data.length === 0 && <p className="mx-auto max-w-7xl px-6 pb-24 text-muted md:px-8">No destinations yet.</p>}
      <section className="mx-auto grid max-w-7xl gap-x-8 gap-y-16 px-6 pb-24 md:grid-cols-2 md:px-8">
        {data?.map((d, i) => (
          <Link key={d.id} to={`/destinations/${d.slug}`} className={`group block ${i % 2 === 1 ? 'md:mt-24' : ''}`}>
            <DestinationImage
              destination={d}
              file="cover"
              eager={i < 2}
              className="aspect-[4/5] w-full rounded-3xl transition-transform duration-700 group-hover:scale-[1.015]"
            />
            <div className="mt-5 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-4xl tracking-tight">{d.name}</h2>
              <span className="text-sm text-muted">{d.country}{d.duration ? ` · ${d.duration}` : ''}</span>
            </div>
            {d.summary && <p className="mt-2 max-w-md text-muted">{d.summary}</p>}
          </Link>
        ))}
      </section>
      <CtaBand />
    </>
  )
}
