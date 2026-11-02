import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import type { Destination } from '../../shared/types'
import { budgetBreakdown, convertDemoAmount, dailySpendEstimate, formatDemoAmount } from '../../shared/travelBudget'
import type { BudgetCurrency } from '../../shared/travelBudget'
import { useFetch } from '../lib/api'
import { useVoyage, type SavedTrip, type TripDay } from '../lib/voyage'
import Seo from '../components/Seo'

const interestsList = ['Local food', 'Nature', 'Culture', 'Slow mornings', 'Adventure']
const dayPlans = [
  ['Find your bearings', 'Arrive, check in, and take an unhurried first walk through the neighbourhood.'],
  ['A little local life', 'Start with a neighbourhood café, then follow a local guide to the places you would not find alone.'],
  ['Out beyond the usual', 'Make a day trip into the landscape, with time to stop whenever somewhere catches your eye.'],
  ['The good things twice', 'Return to a favourite corner, browse the market, and leave the afternoon open.'],
  ['One last morning', 'Take a slow breakfast and one final wander before heading home.'],
]

function makeDays(destination: Destination, days: number, style: string, interests: string[], budget: number, travellers: number, currency: BudgetCurrency): TripDay[] {
  const preferences: Record<string, string> = {
    'Local food': 'Make time for a market or a family-run place to eat.',
    Nature: 'Leave a little space for a walk or a quiet view along the way.',
    Culture: 'Look for a local story, craft, or community-led experience.',
    'Slow mornings': 'Keep the morning open and let the day find its own pace.',
    Adventure: 'Add an active detour if the weather and energy are on your side.',
  }
  const estimatedTotal = convertDemoAmount(dailySpendEstimate(destination.region) * days * travellers, currency)
  return Array.from({ length: days }, (_, index) => {
    const sample = destination.itinerary[index % Math.max(destination.itinerary.length, 1)]
    const fallback = dayPlans[index % dayPlans.length]
    const focus = interests.length ? interests[index % interests.length] : 'a little of everything'
    const pace = style === 'Go slow' ? 'Keep just one anchor in the day, then leave the rest open.' : ''
    const budgetNote = estimatedTotal > budget
      ? 'To bring the estimate closer to your budget, look at local transit and family-run stays.'
      : ''
    return {
      title: sample?.title || fallback[0],
      details: [
        sample?.text || fallback[1],
        preferences[focus] || 'Leave a little room for an unexpected favourite.',
        pace,
        budgetNote,
      ].filter(Boolean).join(' '),
    }
  })
}

export default function Planner() {
  const [params] = useSearchParams()
  const { data: destinations, error, loading } = useFetch<Destination[]>('/api/destinations')
  const { data: passport, update } = useVoyage()
  const [destinationSlug, setDestinationSlug] = useState(params.get('destination') ?? '')
  const [days, setDays] = useState([3, 5, 7, 10, 14].includes(Number(params.get('days'))) ? Number(params.get('days')) : 5)
  const [travellers, setTravellers] = useState(1)
  const [budget, setBudget] = useState(Math.max(300, Math.min(6000, Number(params.get('budget')) || 1200)))
  const [currency, setCurrency] = useState<BudgetCurrency>(params.get('currency') === 'INR' || params.get('currency') === 'EUR' ? params.get('currency') as BudgetCurrency : 'USD')
  const [origin, setOrigin] = useState(params.get('origin') ?? '')
  const [dates, setDates] = useState(params.get('dates') ?? '')
  const [accommodation, setAccommodation] = useState('A thoughtfully chosen stay')
  const [travelNotes, setTravelNotes] = useState('')
  const [style, setStyle] = useState(params.get('style') ?? 'A little of everything')
  const [interests, setInterests] = useState<string[]>(params.get('interests')?.split(',').filter(Boolean) ?? ['Local food', 'Culture'])
  const [itinerary, setItinerary] = useState<TripDay[] | null>(null)
  const [saved, setSaved] = useState(false)
  const [savedTripId, setSavedTripId] = useState<string | null>(null)

  const selected = useMemo(
    () => destinations?.find((destination) => destination.slug === destinationSlug),
    [destinations, destinationSlug],
  )
  const estimate = selected ? convertDemoAmount(dailySpendEstimate(selected.region) * days * travellers, currency) : 0

  const generate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selected) return
    setItinerary(makeDays(selected, days, style, interests, budget, travellers, currency))
    setSaved(false)
  }

  const saveTrip = () => {
    if (!selected || !itinerary) return
    const trip: SavedTrip = {
      id: savedTripId ?? `${selected.slug}-${Date.now()}`,
      destinationSlug: selected.slug,
      destination: selected.name,
      country: selected.country,
      days,
      travellers,
      budget,
      currency,
      origin,
      dates,
      accommodation,
      travelNotes,
      style,
      interests,
      itinerary,
      savedAt: new Date().toISOString(),
    }
    update((current) => ({
      ...current,
      trips: savedTripId
        ? current.trips.map((savedTrip) => savedTrip.id === savedTripId ? trip : savedTrip)
        : [trip, ...current.trips],
    }))
    setSavedTripId(trip.id)
    setSaved(true)
  }

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest) ? current.filter((item) => item !== interest) : [...current, interest],
    )
  }

  return (
    <div className="voyage-page">
      <Seo title="Trip studio" />
      <header className="voyage-page-heading">
        <p className="voyage-eyebrow">YOUR NEXT CHAPTER · {String(passport.trips.length).padStart(2, '0')} SAVED TRIPS</p>
        <h1>Make a little <em>room</em> for somewhere new.</h1>
        <p>Tell us what a good trip feels like. We’ll shape a thoughtful first draft around your pace and budget.</p>
      </header>

      <div className="planner-layout">
        <form className="planner-form voyage-card" onSubmit={generate}>
          <div className="voyage-card-heading">
            <span className="voyage-step">01</span>
            <div><h2>Start with a feeling</h2><p>A few details make all the difference.</p></div>
          </div>

          <label className="voyage-label" htmlFor="planner-destination">Where are you dreaming of?</label>
          {loading && <p className="voyage-help">Finding places to go…</p>}
          {error && !destinations && <p className="voyage-error" role="alert">Destinations could not be loaded. Please refresh and try again.</p>}
          <select
            id="planner-destination"
            className="voyage-input"
            value={destinationSlug}
            onChange={(event) => { setDestinationSlug(event.target.value); setItinerary(null); setSavedTripId(null); setSaved(false) }}
            required
          >
            <option value="" disabled>Choose your destination</option>
            {destinations?.map((destination) => (
              <option key={destination.id} value={destination.slug}>{destination.name}, {destination.country}</option>
            ))}
          </select>

          <div className="planner-fields">
            <label className="voyage-label">Starting city
              <input className="voyage-input" value={origin} onChange={(event) => { setOrigin(event.target.value); setSaved(false) }} placeholder="e.g. Delhi" maxLength={100} />
            </label>
            <label className="voyage-label">When are you going?
              <input className="voyage-input" value={dates} onChange={(event) => { setDates(event.target.value); setSaved(false) }} placeholder="Flexible, October…" maxLength={100} />
            </label>
          </div>

          <div className="planner-fields">
            <label className="voyage-label">How long?
              <select className="voyage-input" value={days} onChange={(event) => { setDays(Number(event.target.value)); setItinerary(null); setSaved(false) }}>
                {[3, 5, 7, 10, 14].map((value) => <option key={value} value={value}>{value} days</option>)}
              </select>
            </label>
            <label className="voyage-label">Who’s coming?
              <select className="voyage-input" value={travellers} onChange={(event) => { setTravellers(Number(event.target.value)); setSaved(false) }}>
                {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value} {value === 1 ? 'traveller' : 'travellers'}</option>)}
              </select>
            </label>
          </div>

          <label className="voyage-label" htmlFor="trip-style">Your kind of trip</label>
          <select id="trip-style" className="voyage-input" value={style} onChange={(event) => { setStyle(event.target.value); setSaved(false) }}>
            {['A little of everything', 'Go slow', 'Outdoors first', 'Culture curious', 'Keep it affordable'].map((option) => <option key={option}>{option}</option>)}
          </select>

          <label className="voyage-label" htmlFor="trip-stay">Where would you like to stay?</label>
          <select id="trip-stay" className="voyage-input" value={accommodation} onChange={(event) => { setAccommodation(event.target.value); setSaved(false) }}>
            {['A thoughtfully chosen stay', 'Simple guesthouse', 'Hostel or budget stay', 'Boutique hotel', 'Nature stay'].map((option) => <option key={option}>{option}</option>)}
          </select>

          <fieldset className="interest-fieldset">
            <legend className="voyage-label">What would you love more of?</legend>
            <div className="interest-options">
              {interestsList.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  aria-pressed={interests.includes(interest)}
                  className={`interest-chip ${interests.includes(interest) ? 'is-selected' : ''}`}
                  onClick={() => { toggleInterest(interest); setSaved(false) }}
                >{interest}</button>
              ))}
            </div>
          </fieldset>

          <label className="voyage-label" htmlFor="trip-budget">
            Your on-the-ground budget <span className="voyage-help"> · flights not included</span>
          </label>
          <div className="budget-control">
            <input id="trip-budget" type="range" min="300" max="6000" step="100" value={budget} onChange={(event) => { setBudget(Number(event.target.value)); setSaved(false) }} />
            <output htmlFor="trip-budget">{formatDemoAmount(budget, currency)}</output>
          </div>
          <label className="voyage-label" htmlFor="trip-currency">Budget currency</label>
          <select id="trip-currency" className="voyage-input" value={currency} onChange={(event) => { setCurrency(event.target.value as BudgetCurrency); setSaved(false) }}>
            <option value="USD">USD · US dollars</option><option value="INR">INR · Indian rupees</option><option value="EUR">EUR · euros</option>
          </select>
          <p className="voyage-help">Planning conversion only: sample rates of $1 = ₹84 / €0.92. No live exchange data.</p>
          <label className="voyage-label" htmlFor="trip-notes">Anything we should keep in mind? <span className="voyage-help"> · optional</span></label>
          <textarea id="trip-notes" className="voyage-input planner-notes" rows={3} value={travelNotes} maxLength={500} onChange={(event) => { setTravelNotes(event.target.value); setSaved(false) }} placeholder="Food preferences, accessibility needs, or anything else you choose to share" />
          <button type="submit" className="voyage-button voyage-button-dark">Build my first draft <span aria-hidden="true">↗</span></button>
        </form>

        <section className={`planner-result ${itinerary ? 'has-itinerary' : ''}`} aria-live="polite">
          {!itinerary || !selected ? (
            <div className="planner-empty">
              <span className="planner-orbit" aria-hidden="true">✳</span>
              <p className="voyage-eyebrow">A GOOD TRIP STARTS SOMEWHERE</p>
              <h2>Your next favourite place is one good idea away.</h2>
              <p>Choose a destination and we’ll put together a day-by-day sketch you can make your own.</p>
              <div className="planner-note"><span>✦</span> Thoughtful pace&nbsp; · &nbsp;Budget-aware&nbsp; · &nbsp;Always editable</div>
            </div>
          ) : (
            <div className="itinerary-panel">
              <div className="itinerary-topline">
                <div><p className="voyage-eyebrow">A FIRST DRAFT · {days} DAYS</p><h2>{selected.name}, {selected.country}</h2></div>
                <Link to={`/destinations/${selected.slug}`} aria-label={`Read about ${selected.name}`} className="round-link">↗</Link>
              </div>
              <p className="itinerary-intro">{selected.summary}</p>
              <div className="estimate-card">
                <span>Estimated on-the-ground spend</span>
                <strong>{formatDemoAmount(estimate, currency)}</strong>
                <small>for {travellers} {travellers === 1 ? 'traveller' : 'travellers'} · approximate, flights excluded</small>
                <div className="estimate-breakdown">
                  {budgetBreakdown(estimate).map((item) => <span key={item.category}>{item.category}<strong>{formatDemoAmount(item.amount, currency)}</strong></span>)}
                </div>
                {estimate > budget && <small className="budget-warning">This sketch is above your budget. Try fewer days or a different destination.</small>}
              </div>
              <ol className="itinerary-days">
                {itinerary.map((day, index) => (
                  <li key={`${selected.slug}-${index}`}>
                    <span className="day-index">DAY {String(index + 1).padStart(2, '0')}</span>
                    <div><input aria-label={`Day ${index + 1} title`} value={day.title} onChange={(event) => { setItinerary((current) => current ? current.map((item, i) => i === index ? { ...item, title: event.target.value } : item) : null); setSaved(false) }} /><textarea aria-label={`Day ${index + 1} plan`} value={day.details} rows={2} onChange={(event) => { setItinerary((current) => current ? current.map((item, i) => i === index ? { ...item, details: event.target.value } : item) : null); setSaved(false) }} /></div>
                  </li>
                ))}
              </ol>
              <div className="itinerary-actions">
                <button type="button" className="voyage-button voyage-button-dark" onClick={saveTrip}>
                  {saved ? 'Saved to your passport ✓' : savedTripId ? 'Save changes ↗' : 'Save this trip ↗'}
                </button>
                {saved && <Link className="text-link" to="/passport">See your passport</Link>}
              </div>
              <p className="planner-disclaimer">A curated demo draft, not live AI or a booking. Regional budget estimates exclude flights and use fixed sample currency conversions; confirm all prices independently.</p>
              <p className="planner-disclaimer">Want a human to help with the details? <Link to={`/plan?destination=${selected.slug}`} className="text-link">Talk to a trip planner ↗</Link></p>
            </div>
          )}
        </section>
      </div>
      <p className="planner-method">VOYAGE TRIP STUDIO <span>Preference-led planning · No account needed · Your plans stay on this device</span></p>
    </div>
  )
}
