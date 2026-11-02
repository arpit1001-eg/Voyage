import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { ScrollTrigger } from '../lib/gsap'
import { useSmoothScroll } from '../lib/useSmoothScroll'
import { scrollToTop } from '../lib/scroll'
import Navbar from './Navbar'
import Footer from './Footer'

export type LayoutContext = { ready: boolean }

export default function Layout() {
  const ready = true
  const { pathname } = useLocation()
  useSmoothScroll()

  // New page: start at the top and let ScrollTrigger re-measure.
  useEffect(() => {
    scrollToTop()
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname])

  return (
    <div className="relative w-full bg-background">
      <Navbar />
      <main id="main">
        <Outlet context={{ ready } satisfies LayoutContext} />
      </main>
      <Footer />
    </div>
  )
}
