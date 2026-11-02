/** Types shared by the API server and the React app. */

export type Tone = { from: string; to: string }

export type ItineraryDay = { title: string; text: string }

export type Destination = {
  id: string
  slug: string
  name: string
  country: string
  /** e.g. "East Asia" */
  region: string
  /** One-line pitch, also used for link previews. */
  summary: string
  /** e.g. "9 nights" */
  duration: string
  /** e.g. "Mar–May, Oct–Nov" */
  bestSeason: string
  /** Optional, free text, e.g. "From $3,200 per person". Leave empty to hide. */
  priceFrom: string
  highlights: string[]
  itinerary: ItineraryDay[]
  /** Overview paragraphs. */
  body: string[]
  /** Image URLs (uploads live under /uploads). Empty = tinted placeholder. */
  cover: string
  wide: string
  gallery: string[]
  /** Approximate destination-centre coordinates, used only for the discovery map. */
  coordinates?: { latitude: number; longitude: number }
  tone: Tone
  published: boolean
  order: number
}

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  /** Paragraphs. */
  body: string[]
  /** YYYY-MM-DD */
  date: string
  cover: string
  published: boolean
}

export type Enquiry = {
  id: string
  name: string
  email: string
  phone: string
  destination: string
  dates: string
  travellers: string
  budget: string
  message: string
  createdAt: string
  read: boolean
}
