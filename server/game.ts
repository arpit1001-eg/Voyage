import type { Destination } from '../shared/types'
import { ROUTE_CHALLENGE_UNLOCK_XP, TRAVEL_TRIVIA_UNLOCK_XP } from '../shared/game'
import { fallbackDestinationImage } from '../shared/destinationImages'

export { ROUTE_CHALLENGE_UNLOCK_XP, TRAVEL_TRIVIA_UNLOCK_XP }

export type GameChoice = { slug: string; name: string; country: string; detail?: string }
export type GameQuestion = {
  prompt: string
  correctSlug: string
  image: string
  choices: GameChoice[]
  explanation: string
}
export type GameAnswer = { slug: string; answerSlug: string; correct: boolean }
export type GameSession = {
  id: string
  playerId: string
  challengeId: string
  createdAt: string
  completedAt: string
  currentIndex: number
  score: number
  answers: GameAnswer[]
  questions: GameQuestion[]
  rewarded: boolean
  rewardXp: number
}
export type GameProgress = {
  id: string
  experience: number
  stamps: string[]
  completedChallenges: string[]
}

export type PublicQuestion = {
  index: number
  total: number
  prompt: string
  choices: GameChoice[]
  image: string
}

export type GameMissionType = 'destination-detective' | 'travel-trivia'

const shuffle = <T>(items: T[], seed: string) => {
  const shuffled = [...items]
  let state = 2166136261
  for (const character of seed) state = Math.imul(state ^ character.charCodeAt(0), 16777619)
  const next = () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(next() * (index + 1))
    ;[shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]]
  }
  return shuffled
}

export const dailyChallengeId = (type: GameMissionType = 'destination-detective', date = new Date()) =>
  `${type}-${date.toISOString().slice(0, 10)}`

export const createGameQuestions = (items: Destination[], count = 5, seed = 'voyage-daily-challenge'): GameQuestion[] => {
  const destinations = shuffle(items, `${seed}:destinations`).slice(0, count)
  return destinations.map((destination) => {
    const distractors = shuffle(items.filter((item) => item.id !== destination.id), `${seed}:${destination.slug}:choices`).slice(0, 3)
    const choices = shuffle([destination, ...distractors], `${seed}:${destination.slug}:order`).map(({ slug, name, country }) => ({ slug, name, country }))
    return {
      prompt: destination.summary,
      correctSlug: destination.slug,
      image: destination.cover || fallbackDestinationImage(destination.slug),
      choices,
      explanation: `${destination.name} is in ${destination.country}.`,
    }
  })
}

export const createTriviaQuestions = (items: Destination[], count = 5, seed = 'voyage-travel-trivia'): GameQuestion[] => {
  const usedCountries = new Set<string>()
  const destinations = shuffle(items, `${seed}:destinations`).filter((destination) => {
    if (usedCountries.has(destination.country)) return false
    usedCountries.add(destination.country)
    return true
  }).slice(0, count)
  const countryChoices = destinations.length >= count ? destinations : []

  return countryChoices.map((destination) => {
    const distractors = shuffle(
      countryChoices.filter((item) => item.id !== destination.id),
      `${seed}:${destination.slug}:choices`,
    ).slice(0, 3)
    const choices = shuffle([destination, ...distractors], `${seed}:${destination.slug}:order`).map((item) => ({
      slug: item.slug,
      name: item.country,
      country: item.country,
      detail: item.region,
    }))
    return {
      prompt: `Which country is home to ${destination.name}?`,
      correctSlug: destination.slug,
      image: destination.cover || fallbackDestinationImage(destination.slug),
      choices,
      explanation: `${destination.name} is in ${destination.country}.`,
    }
  })
}

export const publicQuestion = (session: GameSession): PublicQuestion | null => {
  const question = session.questions[session.currentIndex]
  if (!question) return null
  return {
    index: session.currentIndex,
    total: session.questions.length,
    prompt: question.prompt,
    choices: question.choices,
    image: question.image,
  }
}

export const emptyProgress = (id: string): GameProgress => ({
  id,
  experience: 0,
  stamps: [],
  completedChallenges: [],
})
