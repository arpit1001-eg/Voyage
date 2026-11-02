import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ApiError, api } from '../lib/api'
import Seo from '../components/Seo'

type Choice = { slug: string; name: string; country: string }
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

const todayChallenge = () => `destination-detective-${new Date().toISOString().slice(0, 10)}`

export default function Play() {
  const [session, setSession] = useState<Session | null>(null)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [answer, setAnswer] = useState<AnswerResult | null>(null)
  const [completion, setCompletion] = useState<Completion | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api<Progress>('/api/game/progress').then(async (nextProgress) => {
      const activeSession = await api<Session | null>('/api/game/sessions/current')
      if (!active) return
      setProgress(nextProgress)
      setSession(activeSession)
      setAnswer(activeSession?.question ? null : activeSession?.lastAnswer ?? null)
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof ApiError ? reason.message : 'The field notes could not be loaded.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  const start = async () => {
    setBusy(true)
    setError('')
    try {
      const next = await api<Session>('/api/game/sessions', {
        method: 'POST',
        json: { challengeId: todayChallenge() },
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

  const challengeCompleteToday = progress?.completedChallenges.includes(todayChallenge()) ?? false

  return (
    <div className="voyage-page play-page">
      <Seo title="The field notes challenge" />
      <header className="voyage-page-heading">
        <p className="voyage-eyebrow">THE VOYAGE FIELD NOTES · A LITTLE GAME FOR THE GLOBALLY CURIOUS</p>
        <h1>How well do you <em>know</em> the world?</h1>
        <p>Five places. Five clues. Pick the destination that feels right and collect a new passport stamp.</p>
      </header>

      <section className="challenge-card voyage-card">
        {loading && <p className="voyage-help" role="status">Getting the field notes ready…</p>}
        {!loading && error && <p className="voyage-error" role="alert">{error}</p>}

        {!loading && !session && !completion && (
          <div className="challenge-ready">
            <div className="challenge-ready-art"><span aria-hidden="true">✳</span><small>TODAY’S FIELD NOTES</small></div>
            <div className="challenge-ready-copy">
              <p className="voyage-eyebrow">A FRESH CHALLENGE EACH DAY</p>
              <h2>Five clues. A passport full of possibility.</h2>
              <p>Match each editorial clue to a destination. Correct answers earn a stamp, 10 XP, and a 25 XP first-completion bonus.</p>
              <div className="challenge-ready-meta"><span>✦ {progress?.experience ?? 0} explorer XP</span><span>{progress?.stamps.length ?? 0} stamps collected</span></div>
              <button type="button" className="voyage-button voyage-button-dark" onClick={start} disabled={busy}>
                {busy ? 'Preparing your clues…' : challengeCompleteToday ? 'Play today’s challenge again' : 'Start today’s challenge'} <span aria-hidden="true">↗</span>
              </button>
              {challengeCompleteToday && <small className="challenge-repeat-note">You’ve already claimed today’s XP. Another round won’t award duplicate rewards.</small>}
            </div>
          </div>
        )}

        {session?.question && !completion && (
          <>
            <div className="challenge-meta">
              <span className="voyage-eyebrow">FIELD NOTE {String(session.question.index + 1).padStart(2, '0')} / {String(session.question.total).padStart(2, '0')}</span>
              <span className="challenge-score">✦ {session.score} {session.score === 1 ? 'place' : 'places'} found</span>
            </div>
            <div className="challenge-progress" role="progressbar" aria-label="Challenge progress" aria-valuenow={session.question.index + 1} aria-valuemin={0} aria-valuemax={session.question.total}>
              <span style={{ width: `${((session.question.index + 1) / session.question.total) * 100}%` }} />
            </div>
            <div className="challenge-question-layout">
              {session.question.image && <img className="challenge-photo" src={session.question.image} alt="A photograph clue from one of today’s destinations" />}
              <div className="challenge-question-content">
                <p className="challenge-kicker">CAN YOU FIND THE PLACE?</p>
                <blockquote>“{session.question.prompt}”</blockquote>
                <p className="challenge-prompt">Which destination belongs in this field note?</p>
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
                        <span>{place.name}</span><span>{place.country}</span>
                      </button>
                    )
                  })}
                </div>
                {answer && (
                  <div className="challenge-feedback" role="status">
                    <span>{answer.correct ? '✦ Nicely spotted.' : answer.explanation}</span>
                    <button type="button" className="voyage-button voyage-button-dark" onClick={advance} disabled={busy}>
                      {busy ? 'Saving your answer…' : answer.complete ? 'Collect your field notes' : 'Next field note'} <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {session && !session.question && answer && !completion && (
          <div className="challenge-complete">
            <span className="completion-star" aria-hidden="true">✳</span>
            <p className="voyage-eyebrow">ALL FIVE CLUES FOUND</p>
            <h2>{session.score} out of {answer.question?.total ?? 5} places.</h2>
            <p>Your answers are ready. Collect the verified score and any destination stamps in your passport.</p>
            {error && <p className="voyage-error" role="alert">{error}</p>}
            <button type="button" className="voyage-button voyage-button-dark" onClick={advance} disabled={busy}>{busy ? 'Saving your passport…' : 'Collect your field notes ↗'}</button>
          </div>
        )}

        {completion && (
          <div className="challenge-complete">
            <span className="completion-star" aria-hidden="true">✳</span>
            <p className="voyage-eyebrow">FIELD NOTES COMPLETE</p>
            <h2>{completion.score} out of 5 places found.</h2>
            <p>{completion.rewardXp > 0
              ? `You earned ${completion.rewardXp} XP. Your correct answers are now reflected in your destination stamps.`
              : 'You’ve already claimed today’s reward. Your score is saved, but the daily bonus can only be earned once.'}</p>
            <div className="completion-actions">
              <button type="button" className="voyage-button voyage-button-dark" onClick={start} disabled={busy}>Play again</button>
              <Link className="voyage-button voyage-button-light" to="/passport">Open my passport ↗</Link>
            </div>
          </div>
        )}
      </section>
      <p className="planner-method">PLAY AT YOUR OWN PACE <span>10 XP per correct answer · 25 XP first-play bonus · One challenge per UTC day</span></p>
    </div>
  )
}
