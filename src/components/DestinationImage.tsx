import { useState } from 'react'
import type { Destination } from '../../shared/types'
import { fallbackDestinationImage } from '../../shared/destinationImages'

type Props = {
  destination: Destination
  /** 'cover' | 'wide' | gallery position (1, 2, ...) */
  file: 'cover' | 'wide' | number
  className?: string
  eager?: boolean
}

const urlFor = (d: Destination, file: Props['file']) =>
  file === 'cover' ? d.cover : file === 'wide' ? d.wide || d.cover : d.gallery[file - 1]

/** Shows the uploaded photo, or a tinted placeholder when there is none (or it fails to load). */
export default function DestinationImage({ destination, file, className = '', eager }: Props) {
  const src = urlFor(destination, file) || (file === 'cover' || file === 'wide' ? fallbackDestinationImage(destination.slug) : '')
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={`${destination.name} placeholder`}
        className={`flex items-end p-6 ${className}`}
        style={{ background: `radial-gradient(120% 90% at 20% 10%, ${destination.tone.from}, ${destination.tone.to})` }}
      >
        <span className="font-display text-5xl italic leading-none tracking-tight text-foreground/70">{destination.name}</span>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className}`} style={{ background: destination.tone.from }}>
      <img
        src={src}
        alt={`${destination.name}, ${destination.country}`}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
