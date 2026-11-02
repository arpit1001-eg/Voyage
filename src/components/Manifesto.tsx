import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/scroll'
import { site } from '../config/site'

/** The page's one big scroll moment: the statement darkens word by word as you read. */
export default function Manifesto() {
  const scope = useRef<HTMLElement>(null)
  const words = site.manifesto.split(' ')

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.fromTo(
        '.mf-word',
        { color: '#d6d6d6' },
        {
          color: '#000000',
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: scope.current, start: 'top 70%', end: 'bottom 55%', scrub: true },
        },
      )
    },
    { scope },
  )

  return (
    <section ref={scope} className="mx-auto max-w-6xl px-6 py-32 md:px-8 md:py-48">
      <h2 className="sr-only">About how we travel</h2>
      <p className="font-display text-4xl leading-[1.08] tracking-[-0.02em] sm:text-5xl md:text-7xl" aria-label={site.manifesto}>
        {words.map((w, i) => (
          <span key={i} aria-hidden="true">
            <span className="mf-word">{w}</span>{' '}
          </span>
        ))}
      </p>
    </section>
  )
}
