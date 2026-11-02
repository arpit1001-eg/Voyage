import { Link } from 'react-router'
import { site } from '../config/site'

export default function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-40">
      <h2 className="font-display max-w-4xl text-5xl leading-[0.98] tracking-[-0.03em] md:text-8xl">
        Where do you want to go <span className="italic text-muted">next?</span>
      </h2>
      <Link
        to="/plan"
        className="mt-12 inline-block rounded-full bg-foreground px-14 py-5 text-base text-background transition-transform hover:scale-[1.03]"
      >
        {site.hero.cta}
      </Link>
    </section>
  )
}
