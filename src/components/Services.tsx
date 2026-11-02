import { useState } from 'react'
import { site } from '../config/site'

export default function Services() {
  const [open, setOpen] = useState(0)

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-24">
        <h2 className="font-display text-5xl leading-none tracking-[-0.03em] md:text-7xl">
          Ways to <span className="italic text-muted">travel</span>
        </h2>

        <ul className="border-t border-line">
          {site.ways.map((s, i) => {
            const isOpen = open === i
            return (
              <li key={s.title} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`service-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                  >
                    <span className="font-display text-3xl tracking-tight transition-transform duration-500 group-hover:translate-x-2 md:text-5xl">
                      {s.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line"
                    >
                      <span className="absolute h-px w-4 bg-foreground" />
                      <span
                        className={`absolute h-4 w-px bg-foreground transition-transform duration-300 ${
                          isOpen ? 'scale-y-0' : 'scale-y-100'
                        }`}
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={`service-${i}`}
                  role="region"
                  aria-label={s.title}
                  className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-6 pb-8 sm:grid-cols-2">
                      <p className="max-w-sm text-base leading-relaxed text-muted">{s.body}</p>
                      <ul className="space-y-1.5 text-sm">
                        {s.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
