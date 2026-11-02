import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import type { Destination } from '../../shared/types'
import { ROUTE_CHALLENGE_UNLOCK_XP, TRAVEL_TRIVIA_UNLOCK_XP } from '../../shared/game'
import { fallbackDestinationImage } from '../../shared/destinationImages'
import { ApiError, api, useFetch } from '../lib/api'
import Seo from '../components/Seo'

type MissionType = 'destination-detective' | 'travel-trivia'
type Choice = { slug: string; name: string; country: string; detail?: string }
type Question = { index: number; total: number; prompt: string; choices: Choice[]; image: string }
type Session = { id: string; challengeId: string; score: number; question: Question | null; lastAnswer?: AnswerResult | null }
type Progress = { experience: number; stamps: string[]; completedChallenges: string[] }
type AnswerResult = {
  correct: boolean
  answerSlug: string
  correctDestination: Choice
  explanation: string
  score: number
  question: Question | null
  complete: boolean
}
type Completion = { score: number; rewardXp: number; progress: Progress }
type DestinationStatus = 'New' | 'In progress' | 'Completed'

const todayChallenge = (type: MissionType) => `${type}-${new Date().toISOString().slice(0, 10)}`
const missionRoute = (type: MissionType) => `/adventure/${type === 'travel-trivia' ? 'trivia' : 'detective'}`
const missionFromPath = (pathname: string): MissionType | null => {
  if (pathname.endsWith('/trivia')) return 'travel-trivia'
  if (pathname.endsWith('/detective') || pathname === '/play') return 'destination-detective'
  return null
}

const fallbackCoordinates: Record<string, [number, number]> = {
  'kyoto-japan': [35.0116, 135.7681],
  'lofoten-norway': [68.2085, 13.6077],
  'rajasthan-india': [26.9124, 75.7873],
  'patagonia-chile-argentina': [-50.9423, -73.4068],
  'amalfi-coast-italy': [40.6281, 14.484],
}

function destinationPosition(destination: Destination) {
  const coordinates = destination.coordinates
  const [latitude, longitude] = coordinates
    ? [coordinates.latitude, coordinates.longitude]
    : fallbackCoordinates[destination.slug] ?? []
  if (latitude === undefined || longitude === undefined) return undefined
  return {
    left: `${((longitude + 180) / 360) * 100}%`,
    top: `${((90 - latitude) / 180) * 100}%`,
  }
}

function readRecentlyViewed() {
  try {
    return JSON.parse(window.localStorage.getItem('voyage-recent-destinations') ?? '[]') as string[]
  } catch {
    return []
  }
}

export default function Play() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const initialPathname = useRef(pathname)
  const { data: destinations, error: destinationsError, loading: destinationsLoading } = useFetch<Destination[]>('/api/destinations')
  const [session, setSession] = useState<Session | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [answer, setAnswer] = useState<AnswerResult | null>(null)
  const [completion, setCompletion] = useState<Completion | null>(null)
  const [currentMission, setCurrentMission] = useState<MissionType | null>(() => missionFromPath(pathname))
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null)
  const [recentlyViewed] = useState(readRecentlyViewed)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setCurrentMission(missionFromPath(pathname))
  }, [pathname])

  useEffect(() => {
    let active = true
    api<Progress>('/api/game/progress').then(async (nextProgress) => {
      const activeSession = await api<Session | null>('/api/game/sessions/current')
      if (!active) return
      setProgress(nextProgress)
      setSession(activeSession)
      setAnswer(activeSession?.question ? null : activeSession?.lastAnswer ?? null)
      if (activeSession) {
        const type = activeSession.challengeId.startsWith('travel-trivia-') ? 'travel-trivia' : 'destination-detective'
        setCurrentMission(type)
        if (missionFromPath(initialPathname.current) !== type) navigate(missionRoute(type), { replace: true })
      }
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof ApiError ? reason.message : 'The field notes could not be loaded.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [navigate])

  const selected = useMemo(
    () => destinations?.find((destination) => destination.slug === selectedDestination) ?? null,
    [destinations, selectedDestination],
  )
  const triviaUnlocked = (progress?.experience ?? 0) >= TRAVEL_TRIVIA_UNLOCK_XP
  const selectedLocked = currentMission === 'travel-trivia' && !triviaUnlocked
  const todayMissionId = currentMission ? todayChallenge(currentMission) : ''
  const challengeCompleteToday = progress?.completedChallenges.includes(todayMissionId) ?? false
  const sessionIsSelected = !!session && session.challengeId.startsWith(`${currentMission ?? ''}-`)

  const start = async (type: MissionType) => {
    if (type === 'travel-trivia' && !triviaUnlocked) return
    setCurrentMission(type)
    navigate(missionRoute(type))
    setBusy(true)
    setError('')
    try {
      const next = await api<Session>('/api/game/sessions', {
        method: 'POST',
        json: { challengeId: todayChallenge(type) },
      })
      setSession(next)
      setAnswer(null)
      setCompletion(null)
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'The challenge could not be started. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const submitAnswer = async (slug: string) => {
    if (!session?.question || busy) return
    setBusy(true)
    setError('')
    try {
      const result = await api<AnswerResult>(`/api/game/sessions/${session.id}/answer`, {
        method: 'POST',
        json: { answerSlug: slug, questionIndex: session.question.index },
      })
      setAnswer(result)
      setSession({ ...session, score: result.score, question: result.question })
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Your answer could not be checked. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const advance = async () => {
    if (!session || !answer || busy) return
    if (!answer.complete) {
      setAnswer(null)
      return
    }
    setBusy(true)
    setError('')
    try {
      const result = await api<Completion>(`/api/game/sessions/${session.id}/complete`, { method: 'POST', json: {} })
      setCompletion(result)
      setProgress(result.progress)
      setSession(null)
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'The challenge result could not be saved.')
    } finally {
      setBusy(false)
    }
  }

  const destinationStatus = (destination: Destination): DestinationStatus => {
    if (progress?.stamps.includes(destination.slug)) return 'Completed'
    if (recentlyViewed.includes(destination.slug)) return 'In progress'
    return 'New'
  }
  const missionStatus = (type: MissionType) => {
    const challengeId = todayChallenge(type)
    if (session?.challengeId === challengeId) return 'In progress'
    if (progress?.completedChallenges.includes(challengeId)) return 'Completed today'
    return 'Available'
  }

  return (
    <div className="voyage-page play-page">
      <Seo title="Passport Quest" />
      <header className="voyage-page-heading">
        <p className="voyage-eyebrow">THE VOYAGE FIELD NOTES · A LITTLE GAME FOR THE GLOBALLY CURIOUS</p>
        <h1>How well do you <em>know</em> the world?</h1>
        <p>Explore the map, take on a mission, and collect a passport full of possibility.</p>
      </header>

      <section className="quest-progress-strip" aria-label="Your Passport Quest progress">
        <div><strong>{progress?.experience ?? 0}</strong><span>explorer XP</span></div>
        <div><strong>{progress?.stamps.length ?? 0}</strong><span>destination stamps</span></div>
        <div><strong>{progress?.completedChallenges.length ?? 0}</strong><span>missions completed</span></div>
        <Link to="/passport">Open your passport ↗</Link>
      </section>

      <section className="quest-section">
        <div className="quest-section-heading">
          <div><p className="voyage-eyebrow">01 — EXPLORE</p><h2>The world is your gameboard.</h2></div>
          <span className="voyage-help">Choose a marker to open its field guide.</span>
        </div>
        {destinationsLoading && <p className="voyage-help" role="status">Unfolding the world map…</p>}
        {destinationsError && !destinations && <p className="voyage-error" role="alert">The destination map could not be loaded.</p>}
        {destinations && (
          <div className="quest-map-layout">
            <div className="quest-map" role="region" aria-label="Approximate map of VOYAGE mission destinations">
              <div className="map-grid" />
              {destinations.map((destination) => {
                const position = destinationPosition(destination)
                if (!position) return null
                const status = destinationStatus(destination)
                return (
                  <button
                    type="button"
                    key={destination.id}
                    className={`quest-map-marker status-${status.toLowerCase().replace(' ', '-')} ${selectedDestination === destination.slug ? 'is-selected' : ''}`}
                    style={position}
                    onClick={() => setSelectedDestination(destination.slug)}
                    aria-label={`${destination.name}, ${destination.country}. ${status}. Open field guide.`}
                    aria-pressed={selectedDestination === destination.slug}
                  >
                    <span className="quest-marker-dot" aria-hidden="true" />
                    <span className="quest-marker-name">{destination.name}</span>
                  </button>
                )
              })}
              <span className="map-caption">APPROXIMATE LOCATION · NOT FOR NAVIGATION</span>
            </div>
            <aside className="quest-guide voyage-card" aria-live="polite">
              {selected ? (
                <>
                  <div className="quest-guide-image">
                    <img src={selected.cover || fallbackDestinationImage(selected.slug)} alt={`${selected.name}, ${selected.country}`} />
                  </div>
                  <div className="quest-guide-copy">
                    <div className="quest-guide-meta"><span>{selected.region}</span><span className={`quest-status status-${destinationStatus(selected).toLowerCase().replace(' ', '-')}`}>{destinationStatus(selected)}</span></div>
                    <h3>{selected.name}</h3>
                    <p className="quest-guide-country">{selected.country} · {selected.duration}</p>
                    <p>{selected.summary}</p>
                    <div className="quest-guide-mission"><span>MISSION</span><strong>Destination Detective</strong><small>Always open · Find it among today’s five clues</small></div>
                    <Link to={`/destinations/${selected.slug}`} className="text-link">Read the field guide ↗</Link>
                    <Link to="/adventure/detective" className="voyage-button voyage-button-dark">Explore today’s clues ↗</Link>
                  </div>
                </>
              ) : (
                <div className="quest-guide-empty"><span aria-hidden="true">✳</span><p>Pick a place to open its field guide.</p><small>Every marker links a destination to a mission.</small></div>
              )}
            </aside>
          </div>
        )}
        {destinations && (
          <div className="quest-map-legend" aria-label="Map status legend">
            <span><i className="status-new" /> New</span><span><i className="status-in-progress" /> In progress</span><span><i className="status-completed" /> Completed</span>
          </div>
        )}
      </section>

      <section className="quest-section quest-missions-section">
        <div className="quest-section-heading">
          <div><p className="voyage-eyebrow">02 — TAKE ON A CHALLENGE</p><h2>Choose your next mission.</h2></div>
          <span className="voyage-help">Rules, scoring, and unlocks are always shown up front.</span>
        </div>
        <div className="quest-mission-grid">
          <article className={`quest-mission-card ${currentMission === 'destination-detective' ? 'is-selected' : ''}`}>
            <div className="quest-mission-top"><span className="quest-mission-number">01</span><span className="quest-status">{missionStatus('destination-detective')}</span></div>
            <p className="voyage-eyebrow">DESTINATION DETECTIVE</p>
            <h3>Follow the field notes.</h3>
            <p>Match five editorial clues to places on the map. Every answer is checked on the server.</p>
            <div className="quest-mission-rules"><span>5 questions · 1 point per correct answer</span><span>10 XP per correct · +25 XP first completion</span><span>Unlock: available to everyone</span></div>
            <Link to={missionRoute('destination-detective')} className="text-link">Open mission ↗</Link>
          </article>
          <article className={`quest-mission-card ${!triviaUnlocked ? 'is-locked' : ''} ${currentMission === 'travel-trivia' ? 'is-selected' : ''}`}>
            <div className="quest-mission-top"><span className="quest-mission-number">02</span><span className="quest-status">{triviaUnlocked ? missionStatus('travel-trivia') : `Unlock at ${TRAVEL_TRIVIA_UNLOCK_XP} XP`}</span></div>
            <p className="voyage-eyebrow">TRAVEL TRIVIA</p>
            <h3>Take the long way round.</h3>
            <p>Five quick geography questions turn your destination curiosity into a little world knowledge.</p>
            <div className="quest-mission-rules"><span>5 questions · 1 point per correct answer</span><span>10 XP per correct · +25 XP first completion</span><span>Unlock: earn {TRAVEL_TRIVIA_UNLOCK_XP} XP in Destination Detective</span></div>
            {triviaUnlocked
              ? <Link to={missionRoute('travel-trivia')} className="text-link">Open mission ↗</Link>
              : <span className="quest-locked-note">{Math.max(0, TRAVEL_TRIVIA_UNLOCK_XP - (progress?.experience ?? 0))} XP to unlock · clear, achievable goal</span>}
          </article>
          <article className="quest-mission-card is-locked">
            <div className="quest-mission-top"><span className="quest-mission-number">03</span><span className="quest-status">Coming later</span></div>
            <p className="voyage-eyebrow">ROUTE CHALLENGE</p>
            <h3>Connect the dots.</h3>
            <p>Plan a route between destinations and see how much of the world you can link together.</p>
            <div className="quest-mission-rules"><span>Route-building challenge</span><span>Scoring and rewards will be published before launch</span><span>Unlock preview at {ROUTE_CHALLENGE_UNLOCK_XP} XP</span></div>
            <span className="quest-locked-note">{Math.max(0, ROUTE_CHALLENGE_UNLOCK_XP - (progress?.experience ?? 0))} XP to preview · mission not playable yet</span>
          </article>
        </div>
      </section>

      {currentMission && (
        <section className="quest-section quest-play-section" id="mission">
          <div className="quest-section-heading">
            <div><p className="voyage-eyebrow">03 — PLAY</p><h2>{currentMission === 'travel-trivia' ? 'Travel Trivia.' : 'Destination Detective.'}</h2></div>
            <Link to="/adventure" className="text-link">Back to the world map ↑</Link>
          </div>
          <section className="challenge-card voyage-card">
            {selectedLocked && <div className="quest-blocked"><p className="voyage-eyebrow">MISSION LOCKED</p><h3>One first step unlocks the next.</h3><p>Earn {TRAVEL_TRIVIA_UNLOCK_XP} XP in Destination Detective to open Travel Trivia. You have {progress?.experience ?? 0} XP so far.</p><Link to={missionRoute('destination-detective')} className="voyage-button voyage-button-dark">Start Destination Detective ↗</Link></div>}
            {!loading && error && <p className="voyage-error" role="alert">{error}</p>}

            {!loading && !sessionIsSelected && !completion && !selectedLocked && (
              <div className="challenge-ready">
                <div className="challenge-ready-art"><span aria-hidden="true">{currentMission === 'travel-trivia' ? '⌖' : '✳'}</span><small>{currentMission === 'travel-trivia' ? 'TRAVEL TRIVIA' : 'TODAY’S FIELD NOTES'}</small></div>
                <div className="challenge-ready-copy">
                  <p className="voyage-eyebrow">{currentMission === 'travel-trivia' ? 'A WORLD OF LITTLE FACTS' : 'A FRESH CHALLENGE EACH DAY'}</p>
                  <h2>{currentMission === 'travel-trivia' ? 'Five questions. A wider world.' : 'Five clues. A passport full of possibility.'}</h2>
                  <p>{currentMission === 'travel-trivia'
                    ? 'Name the country behind five destinations. One point for each correct answer; your score is checked and saved by the server.'
                    : 'Match five editorial clues to a destination. One point for each correct answer; every choice is checked by the server.'}</p>
                  <div className="challenge-ready-meta"><span>✦ {progress?.experience ?? 0} explorer XP</span><span>{progress?.stamps.length ?? 0} stamps collected</span></div>
                  <button type="button" className="voyage-button voyage-button-dark" onClick={() => start(currentMission)} disabled={busy || loading}>
                    {busy ? 'Preparing your mission…' : challengeCompleteToday ? 'Play today’s mission again' : 'Start today’s mission'} <span aria-hidden="true">↗</span>
                  </button>
                  {challengeCompleteToday && <small className="challenge-repeat-note">Today’s reward has already been claimed. Another round won’t award duplicate XP.</small>}
                </div>
              </div>
            )}

            {sessionIsSelected && session?.question && !completion && (
              <>
                <div className="challenge-meta">
                  <span className="voyage-eyebrow">{currentMission === 'travel-trivia' ? 'TRIVIA' : 'FIELD NOTE'} {String(session.question.index + 1).padStart(2, '0')} / {String(session.question.total).padStart(2, '0')}</span>
                  <span className="challenge-score">✦ {session.score} {session.score === 1 ? 'answer' : 'answers'} correct</span>
                </div>
                <div className="challenge-progress" role="progressbar" aria-label="Challenge progress" aria-valuenow={session.question.index + 1} aria-valuemin={0} aria-valuemax={session.question.total}>
                  <span style={{ width: `${((session.question.index + 1) / session.question.total) * 100}%` }} />
                </div>
                <div className="challenge-question-layout">
                  {session.question.image && <img className="challenge-photo" src={session.question.image} alt="A photograph from a destination in this mission" />}
                  <div className="challenge-question-content">
                    <p className="challenge-kicker">{currentMission === 'travel-trivia' ? 'NAME THE COUNTRY' : 'CAN YOU FIND THE PLACE?'}</p>
                    <blockquote>“{session.question.prompt}”</blockquote>
                    <p className="challenge-prompt">{currentMission === 'travel-trivia' ? 'Choose the country that belongs in this field note.' : 'Which destination belongs in this field note?'}</p>
                    <div className="challenge-options">
                      {session.question.choices.map((place) => {
                        const isCorrect = answer?.correctDestination.slug === place.slug
                        const isPicked = answer && !answer.correct && answer.answerSlug === place.slug
                        const resultClass = answer && isCorrect ? 'is-correct' : answer && isPicked ? 'is-wrong' : ''
                        return (
                          <button
                            type="button"
                            key={place.slug}
                            className={`challenge-option ${resultClass}`}
                            onClick={() => submitAnswer(place.slug)}
                            disabled={!!answer || busy}
                          >
                            <span>{place.name}</span><span>{currentMission === 'travel-trivia' ? place.detail : place.country}</span>
                          </button>
                        )
                      })}
                    </div>
                    {answer && (
                      <div className="challenge-feedback" role="status">
                        <span>{answer.correct ? `✦ Nicely spotted. ${answer.explanation}` : answer.explanation}</span>
                        <button type="button" className="voyage-button voyage-button-dark" onClick={advance} disabled={busy}>
                          {busy ? 'Saving your answer…' : answer.complete ? 'Collect your field notes' : 'Next question'} <span aria-hidden="true">↗</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {session && sessionIsSelected && !session.question && answer && !completion && (
              <div className="challenge-complete">
                <span className="completion-star" aria-hidden="true">✳</span>
                <p className="voyage-eyebrow">ALL FIVE QUESTIONS ANSWERED</p>
                <h2>{session.score} out of {answer.question?.total ?? 5} correct.</h2>
                <p>Your answers are ready. Collect the verified score and any destination stamps in your passport.</p>
                {error && <p className="voyage-error" role="alert">{error}</p>}
                <button type="button" className="voyage-button voyage-button-dark" onClick={advance} disabled={busy}>{busy ? 'Saving your passport…' : 'Collect your field notes ↗'}</button>
              </div>
            )}

            {completion && (
              <div className="challenge-complete">
                <span className="completion-star" aria-hidden="true">✳</span>
                <p className="voyage-eyebrow">MISSION COMPLETE</p>
                <h2>{completion.score} out of 5 answers correct.</h2>
                <p>{completion.rewardXp > 0
                  ? `You earned ${completion.rewardXp} XP. Correct destinations have been added to your passport stamps.`
                  : 'Today’s reward was already claimed. Your score is saved, but daily XP can only be earned once per mission.'}</p>
                <div className="completion-actions">
                  <button type="button" className="voyage-button voyage-button-dark" onClick={() => currentMission && start(currentMission)} disabled={busy}>Play again</button>
                  <Link className="voyage-button voyage-button-light" to="/passport">Open my passport ↗</Link>
                  <Link className="voyage-button voyage-button-light" to="/adventure">Explore the map ↗</Link>
                </div>
              </div>
            )}
          </section>
          <p className="planner-method">PLAY AT YOUR OWN PACE <span>One point per correct answer · 10 XP per correct · 25 XP first-completion bonus</span></p>
        </section>
      )}
    </div>
  )
}
