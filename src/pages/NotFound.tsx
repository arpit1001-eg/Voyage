import Seo from '../components/Seo'
import { Link } from 'react-router'

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-svh max-w-7xl flex-col justify-center px-6 md:px-8">
      <Seo title="Page not found" />
      <h1 className="font-display text-7xl tracking-tight md:text-9xl">Page not found</h1>
      <p className="mt-6 max-w-md text-lg text-muted">That page doesn’t exist or has moved.</p>
      <Link to="/" className="mt-10 w-fit rounded-full bg-foreground px-10 py-4 text-background">Back to home</Link>
    </section>
  )
}
