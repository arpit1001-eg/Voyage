import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../lib/scroll'
import VideoBackground from './VideoBackground'

// Three.js is ~800 kB: load it only when the hero is actually shown.
const Globe3D = lazy(() => import('./Globe3D'))

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** 3D globe when WebGL + motion are available, otherwise the original looping video. */
export default function HeroVisual() {
  const [use3D] = useState(() => hasWebGL() && !prefersReducedMotion())
  const [visible, setVisible] = useState(true)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = box.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (!use3D) return <VideoBackground />

  return (
    <div ref={box} className="absolute inset-x-0 bottom-0 top-[490px] min-h-[320px] z-0" aria-hidden="true">
      {/* Pause rendering off-screen so the GPU is free for the rest of the page. */}
      <Suspense fallback={null}>
        <Globe3D active={visible} />
      </Suspense>
    </div>
  )
}
