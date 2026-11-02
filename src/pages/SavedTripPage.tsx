import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useVoyage } from '../lib/voyage'
import { formatDemoAmount } from '../../shared/travelBudget'
import Seo from '../components/Seo'

export default function SavedTripPage() {
  const { tripId = '' } = useParams()
  const { data, update } = useVoyage()
  const trip = data.trips.find((item) => item.id === tripId)
  const [notice, setNotice] = useState('')

  const editDay = (index: number, key: 'title' | 'details', value: string) => {
    update((current) => ({
      ...current,
      trips: current.trips.map((item) => item.id !== tripId ? item : {
        ...item,
        itinerary: item.itinerary.map((day, dayIndex) => dayIndex === index ? { ...day, [key]: value } : day),
      }),
    }))
    setNotice('Saved on this device.')
  }

  if (!trip) {
    return (
      <div className="voyage-page">
        <Seo title="Trip not found" />
        <div className="saved-trip-missing"><p className="voyage-eyebrow">THIS ITINERARY ISN’T HERE</p><h1>One less thing to carry.</h1><p>Saved trip drafts are private to the browser where they were created.</p><Link className="voyage-button voyage-button-dark" to="/planner">Start a new trip idea ↗</Link></div>
      </div>
    )
  }

  return (
    <article className="voyage-page saved-trip-page">
      <Seo title={`${trip.destination} trip draft`} />
      <p className="voyage-eyebrow"><Link to="/my-adventures" className="text-link">MY ADVENTURES</Link> · PRIVATE ON THIS DEVICE</p>
      <header className="saved-trip-heading"><p className="voyage-eyebrow">{trip.country} · {trip.days} DAYS · {trip.travellers} {trip.travellers === 1 ? 'TRAVELLER' : 'TRAVELLERS'}</p><h1>{trip.destination}, <em>your way.</em></h1><p>{trip.origin ? `Starting from ${trip.origin} · ` : ''}{trip.dates ? `${trip.dates} · ` : ''}{trip.style} · {trip.interests.join(' · ') || 'A little of everything'}</p></header>
      <div className="saved-trip-summary"><span>Budget idea <strong>{formatDemoAmount(trip.budget, trip.currency ?? 'USD')}</strong><small>Directional on-the-ground estimate · flights excluded</small></span><Link to={`/destinations/${trip.destinationSlug}`} className="voyage-button voyage-button-light">Destination guide ↗</Link></div>
      <ol className="saved-trip-timeline">
        {trip.itinerary.map((day, index) => (
          <li key={`${trip.id}-${index}`}><span className="day-index">DAY {String(index + 1).padStart(2, '0')}</span><div><label>Day title<input value={day.title} onChange={(event) => editDay(index, 'title', event.target.value)} /></label><label>Field notes<textarea rows={3} value={day.details} onChange={(event) => editDay(index, 'details', event.target.value)} /></label></div></li>
        ))}
      </ol>
      <div className="saved-trip-actions"><span role="status">{notice || 'Edits are saved automatically on this device.'}</span><button type="button" className="voyage-button voyage-button-dark" onClick={() => window.print()}>Print this itinerary ↗</button></div>
      <p className="planner-method">A DEMO TRIP DRAFT <span>Editable and private on this device · Not a booking or confirmed reservation</span></p>
    </article>
  )
}
