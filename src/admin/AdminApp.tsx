import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { api } from '../lib/api'
import type { Enquiry } from '../../shared/types'
import DestinationsAdmin from './DestinationsAdmin'
import EnquiriesAdmin from './EnquiriesAdmin'
import PostsAdmin from './PostsAdmin'
import { btn, errorMessage, Field, inputClass } from './ui'

type Tab = 'destinations' | 'journal' | 'enquiries'

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api('/api/auth/login', { method: 'POST', json: { password } })
      onDone()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-svh place-items-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5">
        <h1 className="font-display text-5xl tracking-tight">Voyage admin</h1>
        <Field label="Password">
          <input type="password" autoFocus autoComplete="current-password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Field>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" className={`${btn} w-full`} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="block text-center text-sm text-muted hover:text-foreground">Back to site</Link>
      </form>
    </div>
  )
}

export default function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [tab, setTab] = useState<Tab>('destinations')
  const [unread, setUnread] = useState(0)

  const refreshUnread = useCallback(async () => {
    try {
      const msgs = await api<Enquiry[]>('/api/admin/enquiries')
      setUnread(msgs.filter((m) => !m.read).length)
    } catch {
      /* ignore: the tab itself shows errors */
    }
  }, [])

  useEffect(() => {
    api<{ authed: boolean }>('/api/auth/me')
      .then((r) => setAuthed(r.authed))
      .catch(() => setAuthed(false))
  }, [])

  useEffect(() => {
    if (authed) void refreshUnread()
  }, [authed, refreshUnread])

  if (authed === null) return <p className="p-8 text-muted">Loading…</p>
  if (!authed) return <Login onDone={() => setAuthed(true)} />

  const logout = async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setAuthed(false)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'destinations', label: 'Destinations' },
    { id: 'journal', label: 'Journal' },
    { id: 'enquiries', label: unread ? `Enquiries (${unread})` : 'Enquiries' },
  ]

  return (
    <div className="mx-auto min-h-svh max-w-5xl px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <p className="font-display text-3xl tracking-tight">Voyage admin</p>
        <div className="flex items-center gap-5 text-sm">
          <Link to="/" target="_blank" className="text-muted hover:text-foreground">View site</Link>
          <button type="button" onClick={() => void logout()} className="text-muted hover:text-foreground">Sign out</button>
        </div>
      </header>

      <nav aria-label="Admin sections" className="my-8 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2 text-sm transition-colors ${tab === t.id ? 'bg-foreground text-background' : 'border border-line hover:border-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'destinations' && <DestinationsAdmin />}
      {tab === 'journal' && <PostsAdmin />}
      {tab === 'enquiries' && <EnquiriesAdmin onChange={() => void refreshUnread()} />}
    </div>
  )
}
