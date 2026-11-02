import { useEffect, useState } from 'react'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

type Options = Omit<RequestInit, 'body'> & { json?: unknown; body?: BodyInit | null }

export async function api<T = unknown>(path: string, { json, headers, body, ...rest }: Options = {}): Promise<T> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : body,
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(res.status, data?.error ?? (res.statusText || 'Request failed'))
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// Remember public responses so moving between pages doesn't flash empty content.
const cache = new Map<string, unknown>()

/** Fetch public JSON; shows cached data instantly, then refreshes it. */
export function useFetch<T>(path: string | null) {
  const [state, setState] = useState<{ data?: T; error?: ApiError; loading: boolean }>(() => ({
    data: path ? (cache.get(path) as T | undefined) : undefined,
    loading: !!path && !cache.has(path),
  }))

  useEffect(() => {
    if (!path) return
    let alive = true
    const cached = cache.get(path) as T | undefined
    setState({ data: cached, loading: cached === undefined })
    api<T>(path)
      .then((data) => {
        cache.set(path, data)
        if (alive) setState({ data, loading: false })
      })
      .catch((error: ApiError) => {
        if (alive) setState({ data: cached, error, loading: false })
      })
    return () => {
      alive = false
    }
  }, [path])

  return state
}

export const readMinutes = (paragraphs: string[]) =>
  Math.max(1, Math.round(paragraphs.join(' ').split(/\s+/).filter(Boolean).length / 200))

export const formatMonth = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en', { month: 'short', year: 'numeric' })

export const formatLongDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })
