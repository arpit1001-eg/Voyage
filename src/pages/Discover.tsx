import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import type { Destination } from '../../shared/types'
import { dailySpendEstimate } from '../../shared/travelBudget'
import { useFetch } from '../lib/api'
import { useVoyage } from '../lib/voyage'
import DestinationImage from '../components/DestinationImage'
import Seo from '../components/Seo'

type SortMode = 'relevance' | 'budget' | 'name'
type DestinationType = 'All kinds' | 'Culture' | 'Nature' | 'Adventure' | 'Slow escape'

const coordinates: Record<string, [number, number]> = {
  'kyoto-japan': [35.0116, 135.7681],
  'lofoten-norway': [68.2085, 13.6077],
  'rajasthan-india': [26.9124, 75.7873],
  'patagonia-chile-argentina': [-50.9423, -73.4068],
  'amalfi-coast-italy': [40.6281, 14.484],
}

function costPerDay(destination: Destination) {
  return dailySpendEstimate(destination.region)
}

function hasType(destination: Destination, type: DestinationType) {
  if (type === 'All kinds') return true
  const text = `${destination.summary} ${destination.highlights.join(' ')} ${destination.body.join(' ')}`.toLowerCase()
  const terms: Record<Exclude<DestinationType, 'All kinds'>, string[]> = {
    Culture: ['temple', 'culture', 'craft', 'market', 'palace', 'tea', 'history', 'shrine'],
    Nature: ['mountain', 'landscape', 'glacier', 'wildlife', 'coast', 'garden', 'sea', 'beach'],
    Adventure: ['hike', 'trek', 'kayak', 'trail', 'boat', 'drive', 'desert'],
    'Slow escape': ['slow', 'relaxed', 'quiet', 'unhurried', 'long lunch', 'wander'],
  }
  return terms[type].some((term) => text.includes(term))
}

export default function Discover() {
  const [params, setParams] = useSearchParams()
  const { data: destinations, error, loading } = useFetch<Destination[]>('/api/destinations')
  const { data: passport, update } = useVoyage()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [region, setRegion] = useState('All regions')
  const [maxBudget, setMaxBudget] = useState(250)
  const [minDays, setMinDays] = useState(1)
  const [type, setType] = useState<DestinationType>('All kinds')
  const [sort, setSort] = useState<SortMode>('relevance')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [collection, setCollection] = useState('All places')

  const regions = useMemo(() => [...new Set(destinations?.map((destination) => destination.region).filter(Boolean) ?? [])].sort(), [destinations])
  const collections = useMemo(() => ['All places', ...regions], [regions])

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = (destinations ?? []).filter((destination) => {
      const matchesSearch = !term || `${destination.name} ${destination.country} ${destination.region} ${destination.summary} ${destination.highlights.join(' ')}`.toLowerCase().includes(term)
      const matchesRegion = (region === 'All regions' || destination.region === region) && (collection === 'All places' || destination.region === collection)
      const matchesBudget = costPerDay(destination) <= maxBudget
      const matchesDuration = (Number(destination.duration.match(/\d+/)?.[0] ?? 1) >= minDays)
      return matchesSearch && matchesRegion && matchesBudget && matchesDuration && hasType(destination, type)
    })
    if (sort === 'budget') filtered.sort((a, b) => costPerDay(a) - costPerDay(b))
    if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name))
    return filtered
  }, [destinations, query, region, maxBudget, minDays, type, sort, collection])

  const recentlyViewed = useMemo(() => {
    try {
      const viewed = JSON.parse(window.localStorage.getItem('voyage-recent-destinations') ?? '[]') as string[]
      return (destinations ?? []).filter((destination) => viewed.includes(destination.slug)).slice(0, 3)
    } catch {
      return []
    }
  }, [destinations])

  const save = (slug: string) => update((current) => ({
    ...current,
    savedDestinations: current.savedDestinations.includes(slug)
      ? current.savedDestinations.filter((item) => item !== slug)
      : [...current.savedDestinations, slug],
  }))

  const mapPosition = (destination: Destination) => {
    const latitude = destination.coordinates?.latitude ?? coordinates[destination.slug]?.[0]
    const longitude = destination.coordinates?.longitude ?? coordinates[destination.slug]?.[1]
    return latitude === undefined || longitude === undefined
      ? null
      : { left: `${((longitude + 180) / 360) * 100}%`, top: `${((90 - latitude) / 180) * 100}%` }
  }

  return (
    <div className="voyage-page discover-page">
      <Seo title="Discover destinations" />
      <header className="voyage-page-heading discover-heading">
        <p className="voyage-eyebrow">01 — FIND YOUR SOMEWHERE</p>
        <h1>The world, <em>open.</em></h1>
        <p>Thoughtful places to start. Browse by feeling, follow a curiosity, and leave room for the unexpected.</p>
      </header>

      <section className="discovery-controls" aria-label="Destination search and filters">
        <label className="discover-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setParams(event.target.value ? { q: event.target.value } : {}, { replace: true }) }} placeholder="Search a place, country, or feeling" aria-label="Search destinations" /></label>
        <div className="discover-filter-row">
          <label>Region<select value={region} onChange={(event) => setRegion(event.target.value)}><option>All regions</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Travel style<select value={type} onChange={(event) => setType(event.target.value as DestinationType)}>{['All kinds', 'Culture', 'Nature', 'Adventure', 'Slow escape'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Minimum trip<select value={minDays} onChange={(event) => setMinDays(Number(event.target.value))}>{[1, 3, 5, 7, 10].map((days) => <option key={days} value={days}>{days === 1 ? 'Any duration' : `${days}+ days`}</option>)}</select></label>
          <label>Daily spend<select value={maxBudget} onChange={(event) => setMaxBudget(Number(event.target.value))}><option value={80}>Up to $80 / day</option><option value={130}>Up to $130 / day</option><option value={180}>Up to $180 / day</option><option value={250}>Any budget</option></select></label>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="relevance">Curated</option><option value="budget">Lowest estimate</option><option value="name">Name</option></select></label>
        </div>
        <div className="discover-bottom-row">
          <div className="collection-tabs" aria-label="Curated collections">{collections.map((item) => <button key={item} type="button" className={collection === item ? 'is-active' : ''} onClick={() => setCollection(item)}>{item === 'All places' ? 'All places' : `A little ${item.toLowerCase()}`}</button>)}</div>
          <div className="view-switch" role="group" aria-label="Destination presentation">
            <button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>Stories</button>
            <button type="button" aria-pressed={view === 'map'} onClick={() => setView('map')}>Map</button>
          </div>
        </div>
      </section>

      {recentlyViewed.length > 0 && !query && (
        <section className="recently-viewed"><p className="voyage-eyebrow">PICK UP WHERE YOU LEFT OFF</p>{recentlyViewed.map((destination) => <Link key={destination.id} to={`/destinations/${destination.slug}`}>{destination.name} ↗</Link>)}</section>
      )}

      {loading && <p className="voyage-help" role="status">Finding places to go…</p>}
      {error && !destinations && <p className="voyage-error" role="alert">Destinations could not be loaded. Please try again.</p>}
      {!loading && destinations && results.length === 0 && <div className="discover-empty"><span aria-hidden="true">✳</span><h2>No places on this trail yet.</h2><p>Try a wider budget, a different region, or clear a filter.</p><button className="text-link" type="button" onClick={() => { setQuery(''); setParams({}, { replace: true }); setRegion('All regions'); setMaxBudget(250); setMinDays(1); setType('All kinds'); setCollection('All places') }}>Clear all filters ↗</button></div>}

      {view === 'map' && results.length > 0 ? (
        <section className="discovery-map-layout">
          <div className="discovery-map" role="img" aria-label="Approximate map of curated destination locations">
            <div className="map-grid" />
            {results.map((destination) => {
              const position = mapPosition(destination)
              return position ? <Link key={destination.id} className="map-pin" style={position} to={`/destinations/${destination.slug}`} title={`${destination.name}, ${destination.country}`}><span />{destination.name}</Link> : null
            })}
            <span className="map-caption">APPROXIMATE LOCATION · NOT FOR NAVIGATION</span>
          </div>
          <div className="map-results">{results.map((destination) => <Link key={destination.id} to={`/destinations/${destination.slug}`}><span>{destination.region}</span><strong>{destination.name}</strong><small>{destination.country} · approx. ${costPerDay(destination)}/day</small></Link>)}</div>
        </section>
      ) : view === 'list' && results.length > 0 ? (
        <section className="discover-results" aria-label="Destination results">
          {results.map((destination, index) => {
            const isSaved = passport.savedDestinations.includes(destination.slug)
            return (
              <article className={`discover-card discover-card-${index % 3 + 1}`} key={destination.id}>
                <Link to={`/destinations/${destination.slug}`} className="discover-card-image"><DestinationImage destination={destination} file="cover" eager={index < 2} className="discover-card-photo" /></Link>
                <div className="discover-card-copy">
                  <p className="voyage-eyebrow">{destination.region} · {destination.duration || 'A few days'}</p>
                  <h2><Link to={`/destinations/${destination.slug}`}>{destination.name}<span>, {destination.country}</span></Link></h2>
                  <p>{destination.summary}</p>
                  <div className="discover-card-meta"><span>Approx. <strong>${costPerDay(destination)} / day</strong><small> · indicative, excl. flights</small></span><Link to={`/destinations/${destination.slug}`}>Read the field notes ↗</Link></div>
                  <button type="button" className={`save-destination ${isSaved ? 'is-saved' : ''}`} onClick={() => save(destination.slug)} aria-pressed={isSaved}>{isSaved ? 'Saved to passport ✓' : 'Save this place +'}</button>
                </div>
              </article>
            )
          })}
        </section>
      ) : null}
      <p className="planner-method">CURATED PLACES, NOT LIVE INVENTORY <span>Budget indicators are regional demo estimates · Flights and booking prices excluded</span></p>
    </div>
  )
}
