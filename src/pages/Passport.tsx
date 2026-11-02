import { useState } from 'react'
import { Link } from 'react-router'
import type { Destination } from '../../shared/types'
import { useVoyage } from '../lib/voyage'
import { useFetch } from '../lib/api'
import { formatDemoAmount } from '../../shared/travelBudget'
import Seo from '../components/Seo'

const levels = [
  { name: 'Curious newcomer', threshold: 0 },
  { name: 'Weekend wanderer', threshold: 50 },
  { name: 'Open-road regular', threshold: 150 },
  { name: 'World in progress', threshold: 350 },
]

export default function Passport() {
  const { data, update } = useVoyage()
  const { data: gameProgress } = useFetch<{ experience: number; stamps: string[]; completedChallenges: string[] }>('/api/game/progress')
  const { data: destinations } = useFetch<Destination[]>('/api/destinations')
  const experience = gameProgress?.experience ?? data.experience
  const stamps = gameProgress?.stamps ?? data.stamps
  const level = [...levels].reverse().find((item) => experience >= item.threshold) ?? levels[0]
  const nextLevel = levels.find((item) => item.threshold > level.threshold)
  const progress = nextLevel
    ? Math.min(100, ((experience - level.threshold) / (nextLevel.threshold - level.threshold)) * 100)
    : 100
  const [shareNotice, setShareNotice] = useState('')
  const completedChallengeCount = gameProgress?.completedChallenges.length ?? 0
  const achievements = [
    { title: 'First Footsteps', description: 'Collect your first destination stamp.', earned: stamps.length > 0 },
    { title: 'Map Master', description: 'Complete three daily field-note challenges.', earned: completedChallengeCount >= 3 },
    { title: 'Culture Collector', description: 'Find five different destinations.', earned: stamps.length >= 5 },
    { title: 'World Wanderer', description: 'Reach 350 explorer XP.', earned: experience >= 350 },
  ]

  const sharePassport = async () => {
    const text = `My VOYAGE passport: ${level.name}, ${experience} explorer XP, and ${stamps.length} destination stamps.`
    try {
      if (navigator.share) await navigator.share({ title: 'My VOYAGE passport', text })
      else {
        await navigator.clipboard.writeText(text)
        setShareNotice('A private, trip-free passport summary was copied.')
      }
    } catch (reason) {
      if (reason instanceof Error && reason.name === 'AbortError') return
      setShareNotice('Could not share right now. Please try again or copy the summary manually.')
    }
  }

  const removeTrip = (id: string) => update((current) => ({
    ...current,
    trips: current.trips.filter((trip) => trip.id !== id),
  }))

  return (
    <div className="voyage-page passport-page">
      <Seo title="My passport" />
      <header className="voyage-page-heading passport-heading">
        <p className="voyage-eyebrow">YOUR VERY OWN LITTLE CORNER OF THE WORLD</p>
        <h1>The places you’re <em>becoming.</em></h1>
        <p>A home for your daydreams, saved itineraries, and little signs of everywhere you’ve explored.</p>
      </header>

      <section className="passport-overview">
        <div className="passport-card">
          <div className="passport-card-top"><span>VOYAGE</span><span>TRAVEL PASSPORT</span></div>
          <div className="passport-globe" aria-hidden="true">✳</div>
          <div className="passport-card-bottom">
            <span>YOUR NEXT CHAPTER</span>
            <strong>{level.name}</strong>
          </div>
        </div>
        <div className="passport-stats voyage-card">
          <div className="passport-stats-header"><p className="voyage-eyebrow">THE JOURNEY SO FAR</p><button type="button" onClick={sharePassport}>Share passport ↗</button></div>
          <div className="stat-grid">
            <div><strong>{stamps.length.toString().padStart(2, '0')}</strong><span>passport stamps</span></div>
            <div><strong>{data.trips.length.toString().padStart(2, '0')}</strong><span>saved trip ideas</span></div>
            <div><strong>{experience.toString().padStart(2, '0')}</strong><span>explorer XP</span></div>
          </div>
          <div className="level-progress-copy"><span>{level.name}</span><span>{nextLevel ? `${experience} / ${nextLevel.threshold} XP` : 'Top level reached'}</span></div>
          <div className="level-progress"><span style={{ width: `${progress}%` }} /></div>
          <p className="voyage-help">{nextLevel ? `${nextLevel.threshold - experience} XP until ${nextLevel.name}.` : 'You’re a true world wanderer.'} Play a field notes challenge to earn more.</p>
          <Link className="text-link" to="/adventure">Find your next clue <span aria-hidden="true">↗</span></Link>
        </div>
      </section>
      {shareNotice && <p className="share-notice" role="status">{shareNotice}</p>}

      <section className="passport-section">
        <div className="section-title-row"><div><p className="voyage-eyebrow">EARNED BY EXPLORING</p><h2>Little achievements.</h2></div><span className="stamp-count">{achievements.filter((item) => item.earned).length} of {achievements.length} unlocked</span></div>
        <div className="achievement-grid">{achievements.map((achievement) => <article className={`achievement-card ${achievement.earned ? 'is-earned' : ''}`} key={achievement.title}><span aria-hidden="true">{achievement.earned ? '✳' : '○'}</span><strong>{achievement.title}</strong><p>{achievement.description}</p><small>{achievement.earned ? 'UNLOCKED' : 'KEEP EXPLORING'}</small></article>)}</div>
        {gameProgress?.completedChallenges.length ? <div className="challenge-history"><p className="voyage-eyebrow">FIELD NOTES COMPLETED</p>{gameProgress.completedChallenges.map((challenge) => <span key={challenge}>{challenge.replace('destination-detective-', 'Destination Detective · ')}</span>)}</div> : null}
      </section>

      <section className="passport-section">
        <div className="section-title-row"><div><p className="voyage-eyebrow">LITTLE MILESTONES</p><h2>Stamps from the world.</h2></div><span className="stamp-count">{stamps.length} collected</span></div>
        {stamps.length ? (
          <div className="stamps-grid">
            {stamps.map((slug) => (
              <Link to={`/destinations/${slug}`} className="stamp-item" key={slug}>
                <span className="stamp-mark" aria-hidden="true">✳</span>
                <span>{slug.replace(/-/g, ' ')}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="passport-empty">
            <span aria-hidden="true">✳</span><p>Your first stamp is out there.</p>
            <Link to="/adventure" className="text-link">Play the field notes challenge ↗</Link>
          </div>
        )}
      </section>

      <section className="passport-section">
        <div className="section-title-row"><div><p className="voyage-eyebrow">SAVED FOR ANOTHER DAY</p><h2>Places on your mind.</h2></div><Link to="/discover" className="text-link">Discover somewhere new ↗</Link></div>
        {data.savedDestinations.length ? (
          <div className="saved-destinations-grid">
            {data.savedDestinations.map((slug) => {
              const destination = destinations?.find((item) => item.slug === slug)
              return destination ? <Link to={`/destinations/${slug}`} key={slug}><span>{destination.region}</span><strong>{destination.name}</strong><small>{destination.country} · Open field notes ↗</small></Link> : null
            })}
          </div>
        ) : <div className="passport-empty"><span aria-hidden="true">✦</span><p>Keep a place close for later.</p><Link to="/discover" className="text-link">Find somewhere to save ↗</Link></div>}
      </section>

      <section className="passport-section saved-trips-section">
        <div className="section-title-row"><div><p className="voyage-eyebrow">THE DAYDREAMS YOU’VE KEPT</p><h2>Saved trip ideas.</h2></div><Link to="/planner" className="text-link">Make a new plan ↗</Link></div>
        {data.trips.length ? (
          <div className="saved-trips-grid">
            {data.trips.map((trip) => (
              <article className="saved-trip-card voyage-card" key={trip.id}>
                <div className="saved-trip-top"><span>{trip.country}</span><span>{trip.days} days · {trip.travellers} {trip.travellers === 1 ? 'traveller' : 'travellers'}</span></div>
                <h3>{trip.destination}</h3>
                <p>{trip.style} · {trip.interests.slice(0, 2).join(' + ') || 'A little of everything'}</p>
                <div className="saved-trip-bottom"><span>Budget idea <strong>{formatDemoAmount(trip.budget, trip.currency ?? 'USD')}</strong></span><Link to={`/planner/${trip.id}`}>Open draft ↗</Link></div>
                <details className="saved-trip-details">
                  <summary>View day-by-day draft</summary>
                  <ol>
                    {trip.itinerary.map((day, index) => (
                      <li key={`${trip.id}-${index}`}><strong>Day {index + 1} · {day.title}</strong><span>{day.details}</span></li>
                    ))}
                  </ol>
                </details>
                <button type="button" className="remove-trip" onClick={() => removeTrip(trip.id)} aria-label={`Remove ${trip.destination} from saved trips`}>Remove</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="passport-empty">
            <span aria-hidden="true">↗</span><p>Keep a trip idea close, even if it’s just a maybe.</p>
            <Link to="/planner" className="text-link">Build your first trip idea ↗</Link>
          </div>
        )}
      </section>
      <p className="planner-method">YOUR PASSPORT IS YOURS <span>Saved privately on this device · No account required</span></p>
    </div>
  )
}
