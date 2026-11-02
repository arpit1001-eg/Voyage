import type { Enquiry } from '../../shared/types'
import { api } from '../lib/api'
import { btnGhost, errorMessage, useAdminList } from './ui'

export default function EnquiriesAdmin({ onChange }: { onChange: () => void }) {
  const { items, error, reload } = useAdminList<Enquiry>('/api/admin/enquiries')

  const toggle = async (m: Enquiry) => {
    try {
      await api(`/api/admin/enquiries/${m.id}`, { method: 'PATCH', json: { read: !m.read } })
      await reload()
      onChange()
    } catch (e) {
      window.alert(errorMessage(e))
    }
  }

  const remove = async (m: Enquiry) => {
    if (!window.confirm(`Delete the enquiry from ${m.name}?`)) return
    try {
      await api(`/api/admin/enquiries/${m.id}`, { method: 'DELETE' })
      await reload()
      onChange()
    } catch (e) {
      window.alert(errorMessage(e))
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-medium">Trip enquiries</h2>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!items && !error && <p className="text-muted">Loading…</p>}
      {items && items.length === 0 && <p className="text-muted">No enquiries yet. Submissions from the Plan a Trip form appear here.</p>}
      <ul className="space-y-4">
        {items?.map((m) => (
          <li key={m.id} className={`rounded-2xl border p-5 ${m.read ? 'border-line' : 'border-foreground'}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium">
                {m.name} <a href={`mailto:${m.email}`} className="font-normal text-muted underline underline-offset-2">{m.email}</a>
                {m.phone && <span className="ml-2 font-normal text-muted">{m.phone}</span>}
              </p>
              <p className="text-xs text-muted">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <div className="flex gap-2"><dt className="text-muted">Destination</dt><dd>{m.destination}</dd></div>
              <div className="flex gap-2"><dt className="text-muted">Travellers</dt><dd>{m.travellers}</dd></div>
              {m.dates && <div className="flex gap-2"><dt className="text-muted">Dates</dt><dd>{m.dates}</dd></div>}
              {m.budget && <div className="flex gap-2"><dt className="text-muted">Budget</dt><dd>{m.budget}</dd></div>}
            </dl>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{m.message}</p>
            <div className="mt-4 flex gap-3">
              <button type="button" className={btnGhost} onClick={() => void toggle(m)}>{m.read ? 'Mark as unread' : 'Mark as read'}</button>
              <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => void remove(m)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
