import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/scroll'
import { site } from '../config/site'

type Props = { onReveal: () => void }

export default function Preloader({ onReveal }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const count = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const reduce = prefersReducedMotion()
      const counter = { value: 0 }

      gsap
        .timeline()
        .to(counter, {
          value: 100,
          duration: reduce ? 0.2 : 1.5,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (count.current) count.current.textContent = String(Math.round(counter.value)).padStart(3, '0')
          },
        })
        .to(root.current, { yPercent: -100, duration: reduce ? 0.01 : 1, ease: 'expo.inOut' }, '+=0.15')
        // Start the hero while the curtain is still lifting.
        .add(() => onReveal(), '<0.35')
        .set(root.current, { display: 'none' })
    },
    { scope: root },
  )

  return (
    <div
      ref={root}
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-foreground p-6 text-background md:p-8"
    >
      <span className="font-display text-3xl tracking-tight">
        {site.name}
        <sup className="align-super text-base">®</sup>
      </span>
      <span
        ref={count}
        className="font-display self-end text-[22vw] leading-none tracking-tight tabular-nums md:text-[14vw]"
      >
        000
      </span>
    </div>
  )
}
