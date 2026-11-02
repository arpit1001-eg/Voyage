import { site } from '../config/site'

export default function Process() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      <h2 className="font-display mb-16 max-w-3xl text-5xl leading-none tracking-[-0.03em] md:text-7xl">
        How a journey <span className="italic text-muted">comes together</span>
      </h2>

      <ol className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {site.process.map((step, i) => (
          <li key={step.title} className="border-t border-foreground pt-5">
            <span className="text-sm text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="font-display mt-6 text-4xl tracking-tight">{step.title}</h3>
            <p className="mt-3 max-w-xs text-base leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
