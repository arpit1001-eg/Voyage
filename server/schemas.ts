import { z } from 'zod'

const slug = z
  .string()
  .trim()
  .min(1, 'Required')
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens.')

const image = z
  .string()
  .max(300)
  .refine((v) => v === '' || /^\/uploads\/[\w.-]+$/.test(v) || /^https:\/\/\S+$/.test(v), 'Use an uploaded image or an https URL.')

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a hex colour like #e8ecee.')
const paragraphs = z.array(z.string().trim().min(1).max(4000)).max(40)

export const destinationInput = z.object({
  slug,
  name: z.string().trim().min(1).max(120),
  country: z.string().trim().min(1).max(120),
  region: z.string().trim().max(80),
  summary: z.string().trim().max(400),
  duration: z.string().trim().max(60),
  bestSeason: z.string().trim().max(120),
  priceFrom: z.string().trim().max(80),
  highlights: z.array(z.string().trim().min(1).max(200)).max(12),
  itinerary: z.array(z.object({ title: z.string().trim().min(1).max(120), text: z.string().trim().max(1000) })).max(30),
  body: paragraphs,
  cover: image,
  wide: image,
  gallery: z.array(image).max(20).transform((a) => a.filter(Boolean)),
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }).optional(),
  tone: z.object({ from: color, to: color }),
  published: z.boolean(),
  order: z.number().int().min(0).max(9999),
})

export const postInput = z.object({
  slug,
  title: z.string().trim().min(1).max(160),
  excerpt: z.string().trim().max(300),
  body: paragraphs,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD.'),
  cover: image,
  published: z.boolean(),
})

export const enquiryInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).default(''),
  destination: z.string().trim().min(1).max(120),
  dates: z.string().trim().max(120).default(''),
  travellers: z.string().trim().min(1).max(20),
  budget: z.string().trim().max(80).default(''),
  message: z.string().trim().min(10).max(4000),
  /** Honeypot: real people never fill this in. */
  website: z.string().optional(),
})

export const loginInput = z.object({ password: z.string().min(1).max(200) })
export const messagePatch = z.object({ read: z.boolean() })
export const gameSessionInput = z.object({
  challengeId: z.string().regex(/^(?:destination-detective|travel-trivia)-\d{4}-\d{2}-\d{2}$/),
})
export const gameAnswerInput = z.object({
  answerSlug: slug,
  questionIndex: z.number().int().min(0).max(20),
})
