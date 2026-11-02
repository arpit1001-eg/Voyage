import { destinations, posts } from './store'

const SITE_NAME = 'Voyage'
const DEFAULT_DESC =
  'Discover places, plan a trip that feels like you, play your way, and collect a passport full of possibility.'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

type Meta = { title: string; description: string; image?: string; noindex?: boolean }

const STATIC: Record<string, Meta> = {
  '/': { title: `${SITE_NAME} — The world is yours to discover`, description: DEFAULT_DESC },
  '/discover': { title: `Discover — ${SITE_NAME}`, description: 'Find curated destinations by region, travel style, duration, and indicative daily budget.' },
  '/destinations': { title: `Destinations — ${SITE_NAME}`, description: 'Journeys we plan, from Kyoto to Patagonia.' },
  '/planner': { title: `Trip studio — ${SITE_NAME}`, description: 'Build an editable demo itinerary around your destination, interests, and budget.' },
  '/play': { title: `Field notes — ${SITE_NAME}`, description: 'Explore destinations through a daily, server-checked game for the globally curious.' },
  '/adventure': { title: `Passport Quest — ${SITE_NAME}`, description: 'Play the daily destination challenge and collect virtual passport stamps.' },
  '/adventure/detective': { title: `Destination Detective — ${SITE_NAME}`, description: 'Identify destinations through a daily field-notes challenge.' },
  '/passport': { title: `Travel passport — ${SITE_NAME}`, description: 'Keep saved trips, passport stamps, and travel progress together.' },
  '/my-adventures': { title: `My Adventures — ${SITE_NAME}`, description: 'Review your saved trip drafts, destinations, and virtual passport progress.' },
  '/privacy': { title: `Privacy — ${SITE_NAME}`, description: 'How VOYAGE demo data is stored and used.' },
  '/terms': { title: `Terms — ${SITE_NAME}`, description: 'Important notes about VOYAGE travel-planning estimates and virtual game progress.' },
  '/about': { title: `About — ${SITE_NAME}`, description: 'How we plan journeys, and why we travel slowly.' },
  '/journal': { title: `Journal — ${SITE_NAME}`, description: 'Notes and advice for planning better trips.' },
  '/plan': { title: `Plan a trip — ${SITE_NAME}`, description: 'Send a trip enquiry to the Voyage team.' },
}

export const metaFor = (pathname: string): Meta => {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/admin' || path.startsWith('/admin/')) {
    return { title: `Admin — ${SITE_NAME}`, description: '', noindex: true }
  }
  const dest = path.match(/^\/destinations\/([^/]+)$/)
  if (dest) {
    const d = destinations.find((x) => x.slug === dest[1] && x.published)
    if (d) return { title: `${d.name}, ${d.country} — ${SITE_NAME}`, description: d.summary || DEFAULT_DESC, image: d.cover || d.wide || undefined }
  }
  const post = path.match(/^\/journal\/([^/]+)$/)
  if (post) {
    const p = posts.find((x) => x.slug === post[1] && x.published)
    if (p) return { title: `${p.title} — ${SITE_NAME}`, description: p.excerpt || DEFAULT_DESC, image: p.cover || undefined }
  }
  return STATIC[path] ?? { title: `Page not found — ${SITE_NAME}`, description: DEFAULT_DESC, noindex: true }
}

const absolute = (siteUrl: string, url: string) => (url.startsWith('http') ? url : `${siteUrl}${url}`)

/** Rewrites <title> and adds description / Open Graph tags so link previews and crawlers see per-page metadata. */
export const injectSeo = (html: string, pathname: string, siteUrl: string) => {
  const m = metaFor(pathname)
  const canonical = `${siteUrl}${pathname.replace(/\/+$/, '') || '/'}`
  const tags = [
    `<title>${esc(m.title)}</title>`,
    m.description && `<meta name="description" content="${esc(m.description)}" />`,
    m.noindex && `<meta name="robots" content="noindex" />`,
    `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    m.description && `<meta property="og:description" content="${esc(m.description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    m.image && `<meta property="og:image" content="${esc(absolute(siteUrl, m.image))}" />`,
    `<meta name="twitter:card" content="${m.image ? 'summary_large_image' : 'summary'}" />`,
  ]
    .filter(Boolean)
    .join('\n    ')
  return html
    .replace(/<meta\s+name="description"[^>]*>\s*/i, '')
    .replace(/<title>[\s\S]*?<\/title>/i, tags)
}
