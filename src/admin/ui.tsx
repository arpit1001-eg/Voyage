import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { api, ApiError } from '../lib/api'

export const inputClass =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-foreground'

export const btn =
  'rounded-full bg-foreground px-5 py-2 text-sm text-background transition-opacity hover:opacity-85 disabled:opacity-50'
export const btnGhost =
  'rounded-full border border-line px-5 py-2 text-sm transition-colors hover:border-foreground disabled:opacity-50'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export const errorMessage = (e: unknown) => (e instanceof ApiError || e instanceof Error ? e.message : 'Something went wrong.')

/** Loads an admin list and lets the editor refresh it after saving. */
export function useAdminList<T>(path: string) {
  const [items, setItems] = useState<T[] | null>(null)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    try {
      setItems(await api<T[]>(path))
      setError('')
    } catch (e) {
      setError(errorMessage(e))
    }
  }, [path])

  useEffect(() => {
    void reload()
  }, [reload])

  return { items, error, reload }
}

export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'same-origin' })
  const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null
  if (!res.ok || !data?.url) throw new Error(data?.error ?? 'Upload failed.')
  return data.url
}
