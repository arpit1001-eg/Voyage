import crypto from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

const COOKIE = 'voyage_admin'
const GUEST_COOKIE = 'voyage_guest'
const SESSION_MS = 1000 * 60 * 60 * 12 // 12 hours
const isProd = process.env.NODE_ENV === 'production'

// Dev convenience: a random secret/password per start. Production requires both (checked in index.ts).
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex')
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url')
export const passwordWasGenerated = !process.env.ADMIN_PASSWORD

const hmac = (value: string) => crypto.createHmac('sha256', SECRET).update(value).digest('base64url')

const safeEqual = (a: string, b: string) => {
  const ha = crypto.createHash('sha256').update(a).digest()
  const hb = crypto.createHash('sha256').update(b).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export const checkPassword = (input: string) => safeEqual(input, ADMIN_PASSWORD)

const makeToken = () => {
  const payload = String(Date.now() + SESSION_MS)
  return `${payload}.${hmac(payload)}`
}

const signGuestId = (id: string) => `${id}.${hmac(`guest:${id}`)}`

const validGuestId = (token: string | undefined) => {
  if (!token) return undefined
  const [id, signature] = token.split('.')
  if (!id || !signature || !/^[0-9a-f-]{36}$/i.test(id)) return undefined
  return safeEqual(signature, hmac(`guest:${id}`)) ? id : undefined
}

export const guestIdFor = (req: Request, res: Response) => {
  const header = req.headers.cookie
  const token = header?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${GUEST_COOKIE}=`))?.slice(GUEST_COOKIE.length + 1)
  const existing = validGuestId(token ? decodeURIComponent(token) : undefined)
  if (existing) return existing
  const id = crypto.randomUUID()
  res.cookie(GUEST_COOKIE, signGuestId(id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 30,
    path: '/',
  })
  return id
}

const validToken = (token: string | undefined) => {
  if (!token) return false
  const [payload, sig] = token.split('.')
  if (!payload || !sig || !safeEqual(sig, hmac(payload))) return false
  return Number(payload) > Date.now()
}

const readCookie = (req: Request, name: string) => {
  const header = req.headers.cookie
  if (!header) return undefined
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return undefined
}

export const isAuthed = (req: Request) => validToken(readCookie(req, COOKIE))

export const startSession = (res: Response) => {
  res.cookie(COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: SESSION_MS,
    path: '/',
  })
}

export const endSession = (res: Response) => {
  res.clearCookie(COOKIE, { path: '/' })
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (isAuthed(req)) return next()
  res.status(401).json({ error: 'Sign in to continue.' })
}

/** Simple in-memory limiter keyed by IP. Fine for a single-process site. */
export const rateLimit = (max: number, windowMs: number) => {
  const hits = new Map<string, { count: number; reset: number }>()
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now()
    const key = req.ip ?? 'unknown'
    const entry = hits.get(key)
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs })
      return next()
    }
    entry.count += 1
    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.reset - now) / 1000)))
      return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' })
    }
    next()
  }
}
