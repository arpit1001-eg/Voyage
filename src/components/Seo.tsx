import { site } from '../config/site'

/**
 * Sets the browser tab title on navigation. Descriptions and social-preview tags are
 * injected by the server on first load (see server/seo.ts), which is what crawlers read.
 */
export default function Seo({ title }: { title?: string }) {
  return <title>{title ? `${title} — ${site.name}` : `${site.name} — The world is yours to discover`}</title>
}
