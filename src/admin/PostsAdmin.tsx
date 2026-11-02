import { useState } from 'react'
import type { Post } from '../../shared/types'
import { api } from '../lib/api'
import ImageField from './ImageField'
import { btn, btnGhost, errorMessage, Field, inputClass, useAdminList } from './ui'

type Draft = Omit<Post, 'id' | 'body'> & { id?: string; body: string }

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const today = () => new Date().toISOString().slice(0, 10)

const blank = (): Draft => ({ slug: '', title: '', excerpt: '', body: '', date: today(), cover: '', published: true })
const toDraft = (p: Post): Draft => ({ ...p, body: p.body.join('\n\n') })
const toPayload = (d: Draft) => ({
  slug: d.slug, title: d.title, excerpt: d.excerpt, date: d.date, cover: d.cover, published: d.published,
  body: d.body.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean),
})

export default function PostsAdmin() {
  const { items, error, reload } = useAdminList<Post>('/api/admin/posts')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d))

  const save = async () => {
    if (!draft) return
    setSaving(true)
    setFormError('')
    try {
      if (draft.id) await api(`/api/admin/posts/${draft.id}`, { method: 'PUT', json: toPayload(draft) })
      else await api('/api/admin/posts', { method: 'POST', json: toPayload(draft) })
      setDraft(null)
      await reload()
    } catch (e) {
      setFormError(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (p: Post) => {
    if (!window.confirm(`Delete “${p.title}”? This can’t be undone.`)) return
    try {
      await api(`/api/admin/posts/${p.id}`, { method: 'DELETE' })
      await reload()
    } catch (e) {
      window.alert(errorMessage(e))
    }
  }

  if (draft) {
    return (
      <div className="max-w-3xl">
        <button type="button" className="mb-6 text-sm text-muted hover:text-foreground" onClick={() => setDraft(null)}>← Back to journal</button>
        <h2 className="mb-6 text-2xl font-medium">{draft.id ? 'Edit post' : 'New post'}</h2>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void save() }}>
          <Field label="Title">
            <input className={inputClass} required value={draft.title} onChange={(e) => { set('title', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)) }} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="URL slug" hint={`/journal/${draft.slug || 'your-slug'}`}>
              <input className={inputClass} required value={draft.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value) }} />
            </Field>
            <Field label="Date">
              <input type="date" className={inputClass} required value={draft.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
          </div>
          <Field label="Excerpt" hint="One or two sentences. Used for link previews.">
            <input className={inputClass} value={draft.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
          </Field>
          <Field label="Post" hint="Leave a blank line between paragraphs.">
            <textarea className={`${inputClass} min-h-72`} value={draft.body} onChange={(e) => set('body', e.target.value)} />
          </Field>
          <ImageField label="Cover image (optional)" hint="Landscape 16:9." value={draft.cover} onChange={(v) => set('cover', v)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.published} onChange={(e) => set('published', e.target.checked)} />
            Published (visible on the site)
          </label>
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3">
            <button type="submit" className={btn} disabled={saving}>{saving ? 'Saving…' : 'Save post'}</button>
            <button type="button" className={btnGhost} onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-medium">Journal</h2>
        <button type="button" className={btn} onClick={() => { setDraft(blank()); setSlugTouched(false); setFormError('') }}>New post</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!items && !error && <p className="text-muted">Loading…</p>}
      {items && items.length === 0 && <p className="text-muted">No posts yet. Write your first one.</p>}
      <ul className="divide-y divide-line border-y border-line">
        {items?.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 py-4">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.title}</p>
              <p className="text-sm text-muted">{p.date} · /journal/{p.slug}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs ${p.published ? 'bg-wash' : 'border border-line text-muted'}`}>{p.published ? 'Published' : 'Draft'}</span>
            <button type="button" className={btnGhost} onClick={() => { setDraft(toDraft(p)); setSlugTouched(true); setFormError('') }}>Edit</button>
            <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => void remove(p)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
