import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, test } from 'node:test'

const dataDir = await mkdtemp(path.join(tmpdir(), 'voyage-game-test-'))
process.env.DATA_DIR = dataDir
process.env.SESSION_SECRET = 'test-secret-that-is-never-used-outside-tests'
process.env.ADMIN_PASSWORD = 'test-admin-password'

const { createApp } = await import('../server/app')
const app = await createApp()
const server = app.listen(0)
await new Promise<void>((resolve) => server.once('listening', resolve))
const address = server.address()
if (!address || typeof address === 'string') throw new Error('Test server did not start.')
const baseUrl = `http://127.0.0.1:${address.port}`

after(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  await rm(dataDir, { recursive: true, force: true })
})

test('game answers are server checked and daily rewards cannot be claimed twice', async () => {
  const progressResponse = await fetch(`${baseUrl}/api/game/progress`)
  assert.equal(progressResponse.status, 200)
  const cookie = progressResponse.headers.get('set-cookie')?.split(';')[0]
  assert.ok(cookie)

  const challengeId = `destination-detective-${new Date().toISOString().slice(0, 10)}`
  const start = await fetch(`${baseUrl}/api/game/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ challengeId }),
  })
  assert.equal(start.status, 201)
  const session = await start.json() as { id: string; question: { choices: { slug: string }[]; prompt: string } }
  assert.equal(session.question.choices.length, 4)
  assert.equal('correctSlug' in session.question, false)

  const otherGuest = await fetch(`${baseUrl}/api/game/sessions/${session.id}/answer`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ answerSlug: session.question.choices[0].slug, questionIndex: 0 }),
  })
  assert.equal(otherGuest.status, 404)

  const earlyClaim = await fetch(`${baseUrl}/api/game/sessions/${session.id}/complete`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({}),
  })
  assert.equal(earlyClaim.status, 409)

  const invalidAnswer = await fetch(`${baseUrl}/api/game/sessions/${session.id}/answer`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ answerSlug: 'not-an-option', questionIndex: 0 }),
  })
  assert.equal(invalidAnswer.status, 400)

  let question = session.question
  let score = 0
  for (let index = 0; index < 5; index += 1) {
    const response = await fetch(`${baseUrl}/api/game/sessions/${session.id}/answer`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ answerSlug: question.choices[0].slug, questionIndex: index, score: 9999, experience: 999999 }),
    })
    assert.equal(response.status, 200)
    const result = await response.json() as { correct: boolean; score: number; question: typeof question | null; complete: boolean }
    score = result.score
    assert.equal(score >= 0 && score <= index + 1, true)
    if (index === 0) {
      const repeatedAnswer = await fetch(`${baseUrl}/api/game/sessions/${session.id}/answer`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie },
        body: JSON.stringify({ answerSlug: session.question.choices[0].slug, questionIndex: 0 }),
      })
      assert.equal(repeatedAnswer.status, 409)
    }
    question = result.question as typeof question
    if (index < 4) assert.ok(question)
    else assert.equal(result.complete, true)
  }

  const complete = () => fetch(`${baseUrl}/api/game/sessions/${session.id}/complete`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ experience: 100000 }),
  })
  const firstClaim = await complete()
  assert.equal(firstClaim.status, 200)
  const reward = await firstClaim.json() as { score: number; rewardXp: number; progress: { experience: number } }
  assert.equal(reward.rewardXp, reward.score * 10 + 25)
  assert.equal(reward.progress.experience, reward.rewardXp)

  const secondClaim = await complete()
  assert.equal(secondClaim.status, 200)
  const repeated = await secondClaim.json() as typeof reward
  assert.equal(repeated.progress.experience, reward.progress.experience)
  assert.equal(repeated.rewardXp, reward.rewardXp)
})
