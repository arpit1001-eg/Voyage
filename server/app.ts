import express, { type NextFunction, type Request, type Response } from 'express'
import multer from 'multer'
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { ZodError } from 'zod'
import type { Destination, Enquiry, Post } from '../shared/types'
import {
  checkPassword,
  endSession,
  isAuthed,
  rateLimit,
  requireAuth,
  startSession,
} from './auth'
import { destinationInput, enquiryInput, loginInput, messagePatch, postInput } from './schemas'
import { DATA_DIR, destinations, enquiries, initStore, posts } from './store'
import { injectSeo } from './seo'
import {
  emptyProgress,
  createGameQuestions,
  createTriviaQuestions,
  dailyChallengeId,
  publicQuestion,
  TRAVEL_TRIVIA_UNLOCK_XP,
} from './game'
import { gameAnswerInput, gameSessionInput } from './schemas'
import { gameProgress, gameSessions } from './store'
import { guestIdFor } from './auth'


const isProd = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT) || 8787
const SITE_URL = (process.env.SITE_URL || `http://localhost:${isProd ? PORT : 5173}`).replace(/\/+$/, '')
export const UPLOAD_DIR = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(DATA_DIR, 'uploads')
const DIST = path.resolve('dist')

const EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
}

/** Check the real file signature, not just the MIME type the browser claimed. */
const looksLikeImage = (file: string) => {
  const fd = fs.openSync(file, 'r')
  const buf = Buffer.alloc(16)
  fs.readSync(fd, buf, 0, 16, 0)
  fs.closeSync(fd)
  const hex = buf.toString('hex')
  return (
    hex.startsWith('ffd8ff') || // jpeg
    hex.startsWith('89504e470d0a1a0a') || // png
    (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') ||
    buf.toString('ascii', 4, 12) === 'ftypavif'
  )
}

const bySlugTaken = <T extends { id: string; slug: string }>(items: T[], slug: string, selfId?: string) =>
  items.some((x) => x.slug === slug && x.id !== selfId)

export async function createApp() {
  await initStore()
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })

  const app = express()
  app.disable('x-powered-by')
  if (isProd) app.set('trust proxy', 1)

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
  })
  app.use(express.json({ limit: '200kb' }))

  // ---------- Uploaded images ----------
  app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true, index: false, dotfiles: 'deny' }))

  const upload = multer({
    storage: multer.diskStorage({
      destination: UPLOAD_DIR,
      filename: (_req, file, cb) => cb(null, `${randomUUID()}${EXT[file.mimetype]}`),
    }),
    limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) =>
      EXT[file.mimetype] ? cb(null, true) : cb(new Error('Upload a JPG, PNG, WebP or AVIF image.')),
  })

  // ---------- Public API ----------
  const api = express.Router()

  api.get('/destinations', (_req, res) => {
    res.json(destinations.all().filter((d) => d.published).sort((a, b) => a.order - b.order))
  })
  api.get('/destinations/:slug', (req, res) => {
    const d = destinations.find((x) => x.slug === req.params.slug && x.published)
    if (!d) return res.status(404).json({ error: 'Destination not found.' })
    res.json(d)
  })
  api.get('/posts', (_req, res) => {
    res.json(posts.all().filter((p) => p.published).sort((a, b) => b.date.localeCompare(a.date)))
  })
  api.get('/posts/:slug', (req, res) => {
    const p = posts.find((x) => x.slug === req.params.slug && x.published)
    if (!p) return res.status(404).json({ error: 'Post not found.' })
    res.json(p)
  })

  api.get('/game/progress', (req, res) => {
    const playerId = guestIdFor(req, res)
    res.setHeader('Cache-Control', 'no-store')
    res.json(gameProgress.find((progress) => progress.id === playerId) ?? emptyProgress(playerId))
  })

  api.get('/game/sessions/current', (req, res) => {
    const playerId = guestIdFor(req, res)
    const session = gameSessions.all()
      .filter((item) => item.playerId === playerId && !item.completedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    res.setHeader('Cache-Control', 'no-store')
    if (!session) return res.json(null)
    const lastQuestion = session.questions[session.currentIndex - 1]
    const lastAnswer = session.answers[session.currentIndex - 1]
    res.json({
      id: session.id,
      challengeId: session.challengeId,
      score: session.score,
      question: publicQuestion(session),
      lastAnswer: lastQuestion && lastAnswer ? {
        correct: lastAnswer.correct,
        answerSlug: lastAnswer.answerSlug,
        correctDestination: lastQuestion.choices.find((choice) => choice.slug === lastQuestion.correctSlug),
        explanation: lastQuestion.explanation,
        score: session.score,
        question: null,
        complete: session.currentIndex >= session.questions.length,
      } : null,
    })
  })

  api.post('/game/sessions', rateLimit(8, 60 * 60_000), async (req, res) => {
    const input = gameSessionInput.parse(req.body)
    const missionType = input.challengeId.startsWith('travel-trivia-') ? 'travel-trivia' : 'destination-detective'
    if (input.challengeId !== dailyChallengeId(missionType)) return res.status(400).json({ error: 'That challenge has expired. Start today’s challenge instead.' })
    const playerId = guestIdFor(req, res)
    const progress = gameProgress.find((item) => item.id === playerId) ?? emptyProgress(playerId)
    if (missionType === 'travel-trivia' && progress.experience < TRAVEL_TRIVIA_UNLOCK_XP) {
      return res.status(403).json({ error: `Travel Trivia unlocks at ${TRAVEL_TRIVIA_UNLOCK_XP} XP. Earn XP in Destination Detective first.` })
    }
    const available = destinations.all().filter((destination) => destination.published)
    if (missionType === 'destination-detective' && available.length < 5) {
      return res.status(503).json({ error: 'Destination Detective needs at least five published destinations.' })
    }
    const questions = missionType === 'travel-trivia'
      ? createTriviaQuestions(available, 5, input.challengeId)
      : createGameQuestions(available, 5, input.challengeId)
    if (questions.length < 5) return res.status(503).json({ error: 'Travel Trivia needs five published destinations in different countries.' })
    const session = {
      id: randomUUID(),
      playerId,
      challengeId: input.challengeId,
      createdAt: new Date().toISOString(),
      completedAt: '',
      currentIndex: 0,
      score: 0,
      answers: [],
      questions,
      rewarded: false,
      rewardXp: 0,
    }
    await gameSessions.create(session)
    res.status(201).json({ id: session.id, challengeId: session.challengeId, score: session.score, question: publicQuestion(session) })
  })

  api.post('/game/sessions/:id/answer', rateLimit(60, 60_000), async (req, res) => {
    const { answerSlug, questionIndex } = gameAnswerInput.parse(req.body)
    const playerId = guestIdFor(req, res)
    const session = gameSessions.find((item) => item.id === req.params.id && item.playerId === playerId)
    if (!session) return res.status(404).json({ error: 'Game session not found.' })
    if (session.completedAt) return res.status(409).json({ error: 'This game session is already complete.' })
    if (questionIndex !== session.currentIndex) return res.status(409).json({ error: 'That question has already been answered or is no longer active.' })
    const question = session.questions[session.currentIndex]
    if (!question) return res.status(409).json({ error: 'There are no unanswered questions.' })
    if (!question.choices.some((choice) => choice.slug === answerSlug)) {
      return res.status(400).json({ error: 'Choose one of the destinations shown for this question.' })
    }
    const correct = answerSlug === question.correctSlug
    const updated = await gameSessions.update(session.id, {
      currentIndex: session.currentIndex + 1,
      score: session.score + (correct ? 1 : 0),
      answers: [...session.answers, { slug: question.correctSlug, answerSlug, correct }],
    })
    if (!updated) return res.status(500).json({ error: 'The answer could not be saved.' })
    res.json({
      correct,
      answerSlug,
      correctDestination: question.choices.find((choice) => choice.slug === question.correctSlug),
      explanation: question.explanation,
      score: updated.score,
      question: publicQuestion(updated),
      complete: updated.currentIndex >= updated.questions.length,
    })
  })

  api.post('/game/sessions/:id/complete', async (req, res) => {
    const playerId = guestIdFor(req, res)
    const session = gameSessions.find((item) => item.id === req.params.id && item.playerId === playerId)
    if (!session) return res.status(404).json({ error: 'Game session not found.' })
    if (session.currentIndex < session.questions.length) return res.status(409).json({ error: 'Answer every question before finishing the challenge.' })
    if (session.rewarded) {
      const progress = gameProgress.find((item) => item.id === playerId) ?? emptyProgress(playerId)
      return res.json({ score: session.score, rewardXp: session.rewardXp, progress })
    }

    const previous = gameProgress.find((item) => item.id === playerId) ?? emptyProgress(playerId)
    const firstCompletion = !previous.completedChallenges.includes(session.challengeId)
    const rewardXp = firstCompletion ? session.score * 10 + 25 : 0
    const earnedStamps = session.answers.filter((answer) => answer.correct).map((answer) => answer.slug)
    const progress = {
      ...previous,
      experience: previous.experience + rewardXp,
      stamps: [...new Set([...previous.stamps, ...earnedStamps])],
      completedChallenges: firstCompletion
        ? [...previous.completedChallenges, session.challengeId]
        : previous.completedChallenges,
    }
    const completedAt = new Date().toISOString()
    const claimed = await gameSessions.update(session.id, { rewarded: true, rewardXp, completedAt })
    if (!claimed) return res.status(500).json({ error: 'The game result could not be saved.' })
    const savedProgress = previous.id === progress.id
      ? gameProgress.find((item) => item.id === playerId)
        ? await gameProgress.update(playerId, progress)
        : await gameProgress.create(progress)
      : null
    if (!savedProgress) return res.status(500).json({ error: 'Your passport progress could not be saved.' })
    res.json({ score: session.score, rewardXp, progress: savedProgress })
  })

  api.post('/enquiries', rateLimit(5, 60_000), async (req, res) => {
    const input = enquiryInput.parse(req.body)
    // Honeypot tripped: pretend it worked so bots don't adapt.
    if (input.website) return res.status(204).end()
    const { website: _website, ...fields } = input
    const enquiry: Enquiry = { id: randomUUID(), ...fields, createdAt: new Date().toISOString(), read: false }
    await enquiries.create(enquiry)

    // Optional: forward to Slack/Discord/Zapier/etc.
    const hook = process.env.ENQUIRY_WEBHOOK_URL
    if (hook) {
      const summary =
        `New trip enquiry from ${enquiry.name} <${enquiry.email}>\n` +
        `Destination: ${enquiry.destination} | Dates: ${enquiry.dates || 'not given'} | Travellers: ${enquiry.travellers}\n` +
        enquiry.message
      fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summary, content: summary, ...enquiry }),
      }).catch((e) => console.error('Enquiry webhook failed:', e.message))
    }
    res.status(204).end()
  })

  // ---------- Auth ----------
  api.post('/auth/login', rateLimit(8, 15 * 60_000), (req, res) => {
    const { password } = loginInput.parse(req.body)
    if (!checkPassword(password)) return res.status(401).json({ error: 'Wrong password.' })
    startSession(res)
    res.status(204).end()
  })
  api.post('/auth/logout', (_req, res) => {
    endSession(res)
    res.status(204).end()
  })
  api.get('/auth/me', (req, res) => res.json({ authed: isAuthed(req) }))

  // ---------- Admin API ----------
  const admin = express.Router()
  admin.use(requireAuth)

  admin.get('/destinations', (_req, res) => res.json(destinations.all().sort((a, b) => a.order - b.order)))
  admin.post('/destinations', async (req, res) => {
    const input = destinationInput.parse(req.body)
    if (bySlugTaken(destinations.all(), input.slug)) return res.status(409).json({ error: 'That slug is already used.' })
    const destination: Destination = { id: randomUUID(), ...input }
    res.status(201).json(await destinations.create(destination))
  })
  admin.put('/destinations/:id', async (req, res) => {
    const input = destinationInput.parse(req.body)
    if (bySlugTaken(destinations.all(), input.slug, req.params.id)) return res.status(409).json({ error: 'That slug is already used.' })
    const updated = await destinations.update(req.params.id, input)
    if (!updated) return res.status(404).json({ error: 'Destination not found.' })
    res.json(updated)
  })
  admin.delete('/destinations/:id', async (req, res) => {
    if (!(await destinations.remove(req.params.id))) return res.status(404).json({ error: 'Destination not found.' })
    res.status(204).end()
  })

  admin.get('/posts', (_req, res) => res.json(posts.all().sort((a, b) => b.date.localeCompare(a.date))))
  admin.post('/posts', async (req, res) => {
    const input = postInput.parse(req.body)
    if (bySlugTaken(posts.all(), input.slug)) return res.status(409).json({ error: 'That slug is already used.' })
    const post: Post = { id: randomUUID(), ...input }
    res.status(201).json(await posts.create(post))
  })
  admin.put('/posts/:id', async (req, res) => {
    const input = postInput.parse(req.body)
    if (bySlugTaken(posts.all(), input.slug, req.params.id)) return res.status(409).json({ error: 'That slug is already used.' })
    const updated = await posts.update(req.params.id, input)
    if (!updated) return res.status(404).json({ error: 'Post not found.' })
    res.json(updated)
  })
  admin.delete('/posts/:id', async (req, res) => {
    if (!(await posts.remove(req.params.id))) return res.status(404).json({ error: 'Post not found.' })
    res.status(204).end()
  })

  admin.get('/enquiries', (_req, res) =>
    res.json(enquiries.all().sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  )
  admin.patch('/enquiries/:id', async (req, res) => {
    const patch = messagePatch.parse(req.body)
    const updated = await enquiries.update(req.params.id, patch)
    if (!updated) return res.status(404).json({ error: 'Enquiry not found.' })
    res.json(updated)
  })
  admin.delete('/enquiries/:id', async (req, res) => {
    if (!(await enquiries.remove(req.params.id))) return res.status(404).json({ error: 'Enquiry not found.' })
    res.status(204).end()
  })

  admin.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Choose an image to upload.' })
    if (!looksLikeImage(req.file.path)) {
      fs.rmSync(req.file.path, { force: true })
      return res.status(400).json({ error: 'That file is not a valid image.' })
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` })
  })

  api.use('/admin', admin)
  app.use('/api', api)
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }))

  // ---------- robots + sitemap ----------
  app.get('/robots.txt', (_req, res) => {
    res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${SITE_URL}/sitemap.xml\n`)
  })
  app.get('/sitemap.xml', (_req, res) => {
    const urls = [
      ...['/', '/discover', '/destinations', '/about', '/journal', '/plan', '/planner', '/adventure', '/passport', '/my-adventures', '/privacy', '/terms'].map((p) => ({ loc: p })),
      ...destinations.all().filter((d) => d.published).map((d) => ({ loc: `/destinations/${d.slug}` })),
      ...posts.all().filter((p) => p.published).map((p) => ({ loc: `/journal/${p.slug}`, lastmod: p.date })),
    ]
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map((u) => `  <url><loc>${SITE_URL}${u.loc}</loc>${'lastmod' in u ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`)
        .join('\n') +
      `\n</urlset>\n`
    res.type('application/xml').send(xml)
  })

  // ---------- Built React app (production) ----------
  const indexFile = path.join(DIST, 'index.html')
  if (fs.existsSync(indexFile)) {
    const template = fs.readFileSync(indexFile, 'utf8')
    app.use('/assets', express.static(path.join(DIST, 'assets'), { immutable: true, maxAge: '1y', index: false }))
    app.use(express.static(DIST, { index: false, maxAge: '1h' }))
    app.use((req, res, next) => {
      if (req.method !== 'GET' || !req.accepts('html')) return next()
      res.setHeader('Cache-Control', 'no-cache')
      const known = ['/', '/discover', '/destinations', '/about', '/journal', '/plan', '/planner', '/play', '/adventure', '/adventure/detective', '/passport', '/my-adventures', '/privacy', '/terms']
      const path0 = req.path.replace(/\/+$/, '') || '/'
      const isApp = known.includes(path0) || /^\/(destinations|journal|planner)\/[^/]+$/.test(path0) || path0.startsWith('/admin')
      res.status(isApp ? 200 : 404).type('html').send(injectSeo(template, req.path, SITE_URL))
    })
  }

  // ---------- Errors ----------
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues.map((i) => `${i.path.join('.') || 'value'}: ${i.message}`).join('; ') })
    }
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Image is larger than 8 MB.' : err.message })
    }
    if (err instanceof Error && err.message.startsWith('Upload a JPG')) {
      return res.status(400).json({ error: err.message })
    }
    if (err instanceof SyntaxError) return res.status(400).json({ error: 'Invalid JSON.' })
    console.error(err)
    res.status(500).json({ error: 'Something went wrong.' })
  })

  return app
}
