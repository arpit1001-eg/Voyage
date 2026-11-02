import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../lib/scroll'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4'

const FADE_DURATION = 0.5 // seconds

/** Looping video that fades in/out at the seam so the loop never visibly jumps. */
export default function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Respect reduced motion: show a still frame instead of looping video.
    if (prefersReducedMotion()) {
      video.pause()
      video.style.opacity = '1'
      return
    }

    let raf = 0
    const tick = () => {
      const { currentTime, duration } = video
      if (duration && !Number.isNaN(duration)) {
        let opacity = 1
        if (currentTime < FADE_DURATION) opacity = currentTime / FADE_DURATION
        else if (currentTime > duration - FADE_DURATION) opacity = (duration - currentTime) / FADE_DURATION
        video.style.opacity = String(Math.min(1, Math.max(0, opacity)))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onEnded = () => {
      video.style.opacity = '0'
      window.setTimeout(() => {
        video.currentTime = 0
        video.play().catch(() => {
          /* autoplay may be blocked until user interaction */
        })
      }, 100)
    }
    video.addEventListener('ended', onEnded)

    // Don't burn battery when the hero is off-screen.
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) video.play().catch(() => {})
      else video.pause()
    })
    io.observe(video)

    return () => {
      cancelAnimationFrame(raf)
      video.removeEventListener('ended', onEnded)
      io.disconnect()
    }
  }, [])

  return (
    <div className="absolute inset-x-0 bottom-0 top-[300px] z-0" aria-hidden="true">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
        style={{ opacity: 0, transition: 'opacity 0.1s linear' }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-background" />
    </div>
  )
}
