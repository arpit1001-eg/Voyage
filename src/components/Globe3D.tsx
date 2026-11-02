import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import { Vector3, type Group } from 'three'

const R = 1.5

/** Latitude/longitude to a point on the sphere. */
const toVec = (lat: number, lon: number, r = R) => {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return new Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

// Decorative pins (Kyoto, Lofoten, Rajasthan, Patagonia, Amalfi) and the routes between them.
const PINS = [toVec(35.0, 135.8), toVec(68.2, 13.6), toVec(26.9, 75.8), toVec(-50.3, -72.3), toVec(40.6, 14.6)]
const ROUTES: [number, number][] = [[4, 1], [1, 0], [2, 0], [4, 2], [4, 3]]

const arc = (a: Vector3, b: Vector3) =>
  Array.from({ length: 49 }, (_, i) => {
    const t = i / 48
    return a.clone().lerp(b, t).normalize().multiplyScalar(R * (1 + 0.2 * Math.sin(Math.PI * t)))
  })

function Globe() {
  const group = useRef<Group>(null)

  // Evenly spaced dots (Fibonacci lattice) read as a globe without needing a map texture.
  const dots = useMemo(() => {
    const n = 1300
    const out = new Float32Array(n * 3)
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = i * golden
      out.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3)
    }
    return out
  }, [])
  const routes = useMemo(() => ROUTES.map(([a, b]) => arc(PINS[a], PINS[b])), [])

  // Slow auto-rotation, nudged by the pointer.
  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    g.rotation.y += delta * (0.12 + state.pointer.x * 0.25)
    g.rotation.x += (0.35 - state.pointer.y * 0.25 - g.rotation.x) * Math.min(1, delta * 2)
  })

  return (
    <group ref={group} rotation={[0.35, 0, 0]}>
      {/* White core hides the dots and routes on the far side. */}
      <mesh>
        <sphereGeometry args={[R * 0.992, 48, 48]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dots, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#222222" size={0.03} sizeAttenuation transparent opacity={0.85} />
      </points>
      {routes.map((pts, i) => (
        <Line key={i} points={pts} color="#000000" lineWidth={1.1} transparent opacity={0.7} />
      ))}
      {PINS.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      ))}
    </group>
  )
}

export default function Globe3D({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <Globe />
    </Canvas>
  )
}
