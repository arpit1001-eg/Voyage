import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import type { Destination } from '../../shared/types'
import type { Post } from '../../shared/types'
import { dailySpendEstimate } from '../../shared/travelBudget'
import { useFetch } from '../lib/api'
import { useVoyage } from '../lib/voyage'
import Seo from '../components/Seo'
import DestinationImage from '../components/DestinationImage'

const imageUrl =
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=2400&q=90'

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [origin, setOrigin] = useState('')
  const [plannerDestination, setPlannerDestination] = useState('')
  const [plannerDays, setPlannerDays] = useState(5)
  const [plannerBudget, setPlannerBudget] = useState(1200)
  const { data: destinations } = useFetch<Destination[]>('/api/destinations')
  const { data: posts } = useFetch<Post[]>('/api/posts')
  const { data: passport } = useVoyage()

  const searchDestinations = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigate(`/discover${search.trim() ? `?q=${encodeURIComponent(search.trim())}` : ''}`)
  }

  const startPlanning = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const params = new URLSearchParams({ origin, days: String(plannerDays), budget: String(plannerBudget) })
    if (plannerDestination) params.set('destination', plannerDestination)
    navigate(`/planner?${params.toString()}`)
  }

  return (
    <div className="voyage-home">
      <Seo />
      <section className="home-hero">
        <img className="home-hero-image" src={imageUrl} alt="A quiet alpine lake, a small wooden boat and mountains in the morning light" fetchPriority="high" />
        <div className="home-hero-shade" />
        <div className="home-hero-copy">
          <p className="home-kicker"><span /> THE WORLD IS YOURS TO DISCOVER</p>
          <h1>Somewhere,<br /><em>you belong.</em></h1>
          <p className="home-hero-lede">Find the places that feel like they were made for you.</p>
          <form className="hero-destination-search" onSubmit={searchDestinations}>
            <label htmlFor="hero-destination-search">A place, a country, a feeling</label>
            <div><input id="hero-destination-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Where do you want to wander?" /><button type="submit" aria-label="Search destinations">↗</button></div>
          </form>
          <div className="home-hero-actions">
            <Link to="/discover" className="home-primary-link">Start exploring <span aria-hidden="true">↗</span></Link>
            <Link to="/adventure" className="home-text-link">Enter Passport Quest</Link>
          </div>
        </div>
        <div className="hero-side-note"><span>01 / 04</span><span>THE ART OF GETTING LOST</span></div>
        <a className="hero-scroll" href="#discover"><span /> SCROLL TO WANDER</a>
        <div className="hero-image-credit">Dolomites, Italy · 46°28′N 11°46′E</div>
      </section>

      <section className="home-intro" id="discover">
        <div className="home-intro-label"><span>01 — A WORLD OF POSSIBILITIES</span><span>DISCOVER · PLAN · PLAY · COLLECT</span></div>
        <div className="home-intro-content">
          <h2>Not just somewhere to go.<br /><em>Somewhere to feel.</em></h2>
          <p>We think the best trips leave a little room for surprise. Find places worth getting lost in, make a plan that fits your kind of curious, and keep the good ideas close.</p>
        </div>
      </section>

      <section className="home-destinations">
        <div className="home-section-heading">
          <div><p className="home-kicker dark-kicker">A FEW PLACES TO BEGIN</p><h2>The world, <em>open.</em></h2></div>
          <Link to="/discover" className="home-underlined">All destinations <span aria-hidden="true">↗</span></Link>
        </div>
        {destinations?.length ? (
          <div className="destination-mosaic">
            {destinations.slice(0, 3).map((destination, index) => (
              <Link to={`/destinations/${destination.slug}`} className={`mosaic-card mosaic-card-${index + 1}`} key={destination.id}>
                <DestinationImage destination={destination} file="cover" eager={index === 0} className="mosaic-image" />
                <div className="mosaic-shade" />
                <div className="mosaic-copy"><span>{destination.region} · {destination.duration}</span><h3>{destination.name}</h3><span>{destination.country} <b aria-hidden="true">↗</b></span></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="home-featured-placeholder">
            <p>Places that stay with you.</p>
            <Link to="/discover" className="home-underlined">Browse all destinations ↗</Link>
          </div>
        )}
      </section>

      {destinations?.[2] && (
        <section className="home-feature-story">
          <div className="feature-story-image"><DestinationImage destination={destinations[2]} file="wide" /></div>
          <div className="feature-story-copy">
            <p className="home-kicker dark-kicker">A PLACE TO BEGIN · {destinations[2].region.toUpperCase()}</p>
            <h2>{destinations[2].name},<br /><em>at your own pace.</em></h2>
            <p>{destinations[2].summary}</p>
            <ul>{destinations[2].highlights.slice(0, 3).map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            <div className="feature-story-facts"><span>MAKE TIME FOR<strong>{destinations[2].duration || 'A little while'}</strong></span><span>GOOD SEASON<strong>{destinations[2].bestSeason || 'Check locally'}</strong></span><span>DEMO SPEND GUIDE<strong>Approx. ${dailySpendEstimate(destinations[2].region)} / day</strong></span></div>
            <Link to={`/destinations/${destinations[2].slug}`} className="home-dark-link">Explore {destinations[2].name} <span aria-hidden="true">↗</span></Link>
          </div>
        </section>
      )}

      <section className="home-studio">
        <div className="studio-copy">
          <p className="home-kicker dark-kicker">02 — THE TRIP STUDIO</p>
          <h2>Your kind of trip.<br /><em>Your kind of pace.</em></h2>
          <p>Tell us what you love, how long you have, and what feels comfortable. We’ll shape a thoughtful, editable first draft around the way you actually want to travel.</p>
          <Link to="/planner" className="home-dark-link">Make a plan of your own <span aria-hidden="true">↗</span></Link>
          <span className="studio-footnote">A good starting point, never a one-size-fits-all itinerary.</span>
        </div>
        <div className="studio-preview" aria-label="Trip studio preview">
          <div className="preview-top"><span>YOUR TRIP, TAKING SHAPE</span><span>✳ {passport.trips.length + 1}</span></div>
          <div className="preview-route"><span>DAY 01</span><div><strong>Find your bearings</strong><small>Check in. Wander a little. See where the day goes.</small></div><b>↗</b></div>
          <div className="preview-route"><span>DAY 02</span><div><strong>A little local life</strong><small>Follow a local guide off the well-worn path.</small></div><b>↗</b></div>
          <div className="preview-route preview-route-muted"><span>DAY 03</span><div><strong>Leave room for wonder</strong><small>Your day, with nowhere you have to be.</small></div><b>↗</b></div>
          <div className="preview-bottom"><span>MADE AROUND YOU</span><span>✦ &nbsp; EASY DOES IT</span></div>
          <form className="studio-preview-form" onSubmit={startPlanning}>
            <label>From<input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Your starting city" /></label>
            <label>Somewhere<select value={plannerDestination} onChange={(event) => setPlannerDestination(event.target.value)}><option value="">Surprise me</option>{destinations?.map((destination) => <option key={destination.id} value={destination.slug}>{destination.name}</option>)}</select></label>
            <label>Days<select value={plannerDays} onChange={(event) => setPlannerDays(Number(event.target.value))}>{[3, 5, 7, 10].map((days) => <option key={days}>{days}</option>)}</select></label>
            <label>Budget · USD<input type="number" min="300" max="6000" step="100" value={plannerBudget} onChange={(event) => setPlannerBudget(Number(event.target.value))} /></label>
            <button type="submit">Create my trip <span aria-hidden="true">↗</span></button>
          </form>
          <span className="preview-orbit" aria-hidden="true">✳</span>
        </div>
      </section>

      {posts?.length ? (
        <section className="home-journal">
          <div className="home-section-heading"><div><p className="home-kicker dark-kicker">05 — NOTES FROM THE ROAD</p><h2>Stories to <em>take along.</em></h2></div><Link to="/journal" className="home-underlined">All field notes ↗</Link></div>
          <div className="home-journal-grid">{posts.slice(0, 3).map((post, index) => <Link className={`journal-teaser journal-teaser-${index + 1}`} to={`/journal/${post.slug}`} key={post.id}><span>FIELD NOTE {String(index + 1).padStart(2, '0')} · {new Date(`${post.date}T00:00:00`).toLocaleDateString('en', { month: 'long', year: 'numeric' })}</span><h3>{post.title}</h3><p>{post.excerpt}</p><b>Read the story ↗</b></Link>)}</div>
        </section>
      ) : null}

      <section className="home-play">
        <div className="play-art" aria-hidden="true">
          <div className="play-sun" />
          <div className="play-continent play-continent-one" />
          <div className="play-continent play-continent-two" />
          <span className="play-pin play-pin-one">✳</span><span className="play-pin play-pin-two">✳</span><span className="play-pin play-pin-three">✳</span>
          <span className="play-art-caption">A SMALL GAME FOR THE GLOBALLY CURIOUS</span>
        </div>
        <div className="play-copy">
          <p className="home-kicker">03 — THE FIELD NOTES</p>
          <h2>Know a place<br />by its <em>little things.</em></h2>
          <p>Follow the clues. Find the place. Pick up a passport stamp or two along the way.</p>
          <Link to="/adventure" className="home-light-link">Start your adventure <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <section className="home-collect">
        <div>
          <p className="home-kicker dark-kicker">04 — YOUR PASSPORT</p>
          <h2>A little record<br />of <em>everywhere.</em></h2>
        </div>
        <div className="collect-copy">
          <p>Save the plans you love. Collect places as you play. Your travel story, all in one place — and just for you.</p>
          <Link to="/passport" className="home-underlined">Open your passport <span aria-hidden="true">↗</span></Link>
          <div className="collect-stats"><span><strong>{String(passport.trips.length).padStart(2, '0')}</strong> trip ideas</span><span><strong>{String(passport.stamps.length).padStart(2, '0')}</strong> places collected</span><span><strong>{passport.experience}</strong> explorer XP</span></div>
        </div>
      </section>

      <section className="home-last-call">
        <p>THE WORLD DOESN’T NEED TO BE RUSHED.</p>
        <h2>Just <em>opened.</em></h2>
        <Link to="/planner" className="home-primary-link">Start anywhere <span aria-hidden="true">↗</span></Link>
      </section>
    </div>
  )
}
