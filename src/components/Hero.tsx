import { useEffect, useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { Link } from 'react-router'
import { prefersReducedMotion } from '../lib/scroll'
import { site } from '../config/site'
import HeroVisual from './HeroVisual'

export default function Hero({ ready }: { ready: boolean }) {
  const scope = useRef<HTMLElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  // Build the entrance paused; it plays once the preloader lifts.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.set('.hero-word', { yPercent: 115 })
      gsap.set('.hero-fade', { opacity: 0, y: 16 })
      tl.current = gsap
        .timeline({ paused: true })
        .to('.hero-word', { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 })
        .to('.hero-fade', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 }, '-=0.7')
    },
    { scope },
  )

  useEffect(() => {
    if (ready) tl.current?.play()
  }, [ready])

  return (
    <section
      ref={scope}
      className="relative flex min-h-svh flex-col items-center overflow-hidden px-6 pb-40 pt-36 text-center md:pt-40"
    >
      <HeroVisual />

      <h1 className="font-display relative z-10 max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-0.03em] sm:text-7xl md:text-8xl">
        {site.hero.headline.map(({ w, ...rest }, idx) => (
          <span key={idx}>
            <span className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]">
              <span
                className={`hero-word inline-block will-change-transform ${
                  'i' in rest ? 'italic text-muted' : ''
                }`}
              >
                {w}
              </span>
            </span>{' '}
          </span>
        ))}
      </h1>

      <p className="hero-fade relative z-10 mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
        {site.hero.body}
      </p>

      <Link
        to="/plan"
        className="hero-fade relative z-10 mt-12 rounded-full bg-foreground px-14 py-5 text-base text-background transition-transform hover:scale-[1.03]"
      >
        {site.hero.cta}
      </Link>
    </section>
  )
}
