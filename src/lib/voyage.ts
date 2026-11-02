import { useCallback, useEffect, useState } from 'react'

export type TripDay = { title: string; details: string }

export type SavedTrip = {
  id: string
  destinationSlug: string
  destination: string
  country: string
  days: number
  travellers: number
  budget: number
  currency?: 'USD' | 'INR' | 'EUR'
  origin?: string
  dates?: string
  accommodation?: string
  travelNotes?: string
  style: string
  interests: string[]
  itinerary: TripDay[]
  savedAt: string
}

export type VoyageData = {
  trips: SavedTrip[]
  stamps: string[]
  completedChallenges: string[]
  experience: number
  savedDestinations: string[]
}

const STORAGE_KEY = 'voyage-passport-v1'
const UPDATED_EVENT = 'voyage-passport-updated'

const emptyPassport = (): VoyageData => ({
  trips: [],
  stamps: [],
  completedChallenges: [],
  experience: 0,
  savedDestinations: [],
})

function readPassport(): VoyageData {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return saved ? { ...emptyPassport(), ...(JSON.parse(saved) as Partial<VoyageData>) } : emptyPassport()
}

export function useVoyage() {
  const [data, setData] = useState<VoyageData>(readPassport)

  useEffect(() => {
    const sync = () => setData(readPassport())
    window.addEventListener(UPDATED_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(UPDATED_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const update = useCallback((change: (current: VoyageData) => VoyageData) => {
    const next = change(readPassport())
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setData(next)
    window.dispatchEvent(new Event(UPDATED_EVENT))
  }, [])

  return { data, update }
}
