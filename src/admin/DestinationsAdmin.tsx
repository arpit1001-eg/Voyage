import { useState } from 'react'
import type { Destination, ItineraryDay } from '../../shared/types'
import { api } from '../lib/api'
import ImageField from './ImageField'
import { btn, btnGhost, errorMessage, Field, inputClass, uploadImage, useAdminList } from './ui'

type Draft = Omit<Destination, 'id' | 'highlights' | 'body' | 'coordinates'> & {
  id?: string
  highlights: string
  body: string
  latitude: string
  longitude: string
}

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)
const paragraphs = (s: string) => s.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean)

const blank = (order: number): Draft => ({
  slug: '', name: '', country: '', region: '', summary: '', duration: '', bestSeason: '', priceFrom: '',
  highlights: '', itinerary: [], body: '', cover: '', wide: '', gallery: [],
  latitude: '', longitude: '',
  tone: { from: '#ededeb', to: '#cfcfcb' }, published: true, order,
})

const toDraft = (d: Destination): Draft => ({
  ...d,
  latitude: d.coordinates ? String(d.coordinates.latitude) : '',
  longitude: d.coordinates ? String(d.coordinates.longitude) : '',
  highlights: d.highlights.join('\n'),
  body: d.body.join('\n\n'),
})

const toPayload = (d: Draft) => ({
  slug: d.slug, name: d.name, country: d.country, region: d.region, summary: d.summary,
  duration: d.duration, bestSeason: d.bestSeason, priceFrom: d.priceFrom,
  highlights: lines(d.highlights),
  coordinates: d.latitude.trim() && d.longitude.trim()
    ? { latitude: Number(d.latitude), longitude: Number(d.longitude) }
    : undefined,
  itinerary: d.itinerary.filter((day) => day.title.trim()).map((day) => ({ title: day.title.trim(), text: day.text.trim() })),
  body: paragraphs(d.body),
  cover: d.cover, wide: d.wide, gallery: d.gallery, tone: d.tone, published: d.published, order: d.order,
})

export default function DestinationsAdmin() {
  const { items, error, reload } = useAdminList<Destination>('/api/admin/destinations')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [slugTouched, setSlugTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [galleryBusy, setGalleryBusy] = useState(false)

  const open = (d: Draft, touched: boolean) => {
    setDraft(d)
    setSlugTouched(touched)
    setFormError('')
  }
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => (d ? { ...d, [key]: value } : d))

  const setDay = (i: number, patch: Partial<ItineraryDay>) =>
    setDraft((d) => (d ? { ...d, itinerary: d.itinerary.map((day, j) => (j === i ? { ...day, ...patch } : day)) } : d))
  const moveDay = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      if (!d) return d
      const j = i + dir
      if (j < 0 || j >= d.itinerary.length) return d
      const next = [...d.itinerary]
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...d, itinerary: next }
    })

  const save = async () => {
    if (!draft) return
    setSaving(true)
    setFormError('')
    try {
      if (draft.id) await api(`/api/admin/destinations/${draft.id}`, { method: 'PUT', json: toPayload(draft) })
      else await api('/api/admin/destinations', { method: 'POST', json: toPayload(draft) })
      setDraft(null)
      await reload()
    } catch (e) {
      setFormError(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (d: Destination) => {
    if (!window.confirm(`Delete “${d.name}”? This can’t be undone.`)) return
    try {
      await api(`/api/admin/destinations/${d.id}`, { method: 'DELETE' })
      await reload()
    } catch (e) {
      window.alert(errorMessage(e))
    }
  }

  const addGallery = async (files: FileList | null) => {
    if (!files?.length || !draft) return
    setGalleryBusy(true)
    setFormError('')
    try {
      const urls: string[] = []
      for (const f of Array.from(files)) urls.push(await uploadImage(f))
      setDraft((d) => (d ? { ...d, gallery: [...d.gallery, ...urls] } : d))
    } catch (e) {
      setFormError(errorMessage(e))
    } finally {
      setGalleryBusy(false)
    }
  }

  if (draft) {
    return (
      <div className="max-w-3xl">
        <button type="button" className="mb-6 text-sm text-muted hover:text-foreground" onClick={() => setDraft(null)}>
          ← Back to destinations
        </button>
        <h2 className="mb-6 text-2xl font-medium">{draft.id ? 'Edit destination' : 'New destination'}</h2>
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void save() }}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" hint="The place, e.g. Kyoto">
              <input className={inputClass} required value={draft.name} onChange={(e) => { set('name', e.target.value); if (!slugTouched) set('slug', slugify(e.target.value)) }} />
            </Field>
            <Field label="Country">
              <input className={inputClass} required value={draft.country} onChange={(e) => set('country', e.target.value)} />
            </Field>
            <Field label="URL slug" hint={`/destinations/${draft.slug || 'your-slug'}`}>
              <input className={inputClass} required value={draft.slug} onChange={(e) => { setSlugTouched(true); set('slug', e.target.value) }} />
            </Field>
            <Field label="Region" hint="e.g. East Asia">
              <input className={inputClass} value={draft.region} onChange={(e) => set('region', e.target.value)} />
            </Field>
            <Field label="Latitude (optional)" hint="Approximate map pin; between −90 and 90.">
              <input className={inputClass} type="number" step="any" min="-90" max="90" value={draft.latitude} onChange={(e) => set('latitude', e.target.value)} />
            </Field>
            <Field label="Longitude (optional)" hint="Between −180 and 180.">
              <input className={inputClass} type="number" step="any" min="-180" max="180" value={draft.longitude} onChange={(e) => set('longitude', e.target.value)} />
            </Field>
          </div>
          <Field label="Summary" hint="One sentence. Also used for link previews.">
            <input className={inputClass} value={draft.summary} onChange={(e) => set('summary', e.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Duration" hint="e.g. 9 nights">
              <input className={inputClass} value={draft.duration} onChange={(e) => set('duration', e.target.value)} />
            </Field>
            <Field label="Best season" hint="e.g. Mar–May, Oct–Nov">
              <input className={inputClass} value={draft.bestSeason} onChange={(e) => set('bestSeason', e.target.value)} />
            </Field>
            <Field label="Price (optional)" hint="Leave empty to hide. e.g. From $3,200 per person">
              <input className={inputClass} value={draft.priceFrom} onChange={(e) => set('priceFrom', e.target.value)} />
            </Field>
          </div>
          <Field label="Overview" hint="Leave a blank line between paragraphs.">
            <textarea className={`${inputClass} min-h-36`} value={draft.body} onChange={(e) => set('body', e.target.value)} />
          </Field>
          <Field label="Highlights" hint="One per line.">
            <textarea className={`${inputClass} min-h-28`} value={draft.highlights} onChange={(e) => set('highlights', e.target.value)} />
          </Field>

          <div>
            <span className="mb-1 block text-sm font-medium">Sample itinerary</span>
            <ol className="space-y-3">
              {draft.itinerary.map((day, i) => (
                <li key={i} className="rounded-xl border border-line p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs text-muted">Step {i + 1}</span>
                    <span className="flex-1" />
                    <button type="button" aria-label={`Move step ${i + 1} up`} disabled={i === 0} className="px-2 text-sm disabled:opacity-30" onClick={() => moveDay(i, -1)}>↑</button>
                    <button type="button" aria-label={`Move step ${i + 1} down`} disabled={i === draft.itinerary.length - 1} className="px-2 text-sm disabled:opacity-30" onClick={() => moveDay(i, 1)}>↓</button>
                    <button type="button" className="px-2 text-sm text-red-600" onClick={() => set('itinerary', draft.itinerary.filter((_, j) => j !== i))}>Remove</button>
                  </div>
                  <input className={`${inputClass} mb-2`} placeholder="Title, e.g. Temples and gardens" value={day.title} onChange={(e) => setDay(i, { title: e.target.value })} />
                  <textarea className={`${inputClass} min-h-20`} placeholder="What happens" value={day.text} onChange={(e) => setDay(i, { text: e.target.value })} />
                </li>
              ))}
            </ol>
            <button type="button" className={`${btnGhost} mt-3`} onClick={() => set('itinerary', [...draft.itinerary, { title: '', text: '' }])}>
              + Add step
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ImageField label="Cover photo" hint="Portrait 4:5, about 1600×2000." value={draft.cover} onChange={(v) => set('cover', v)} />
            <ImageField label="Wide photo" hint="Landscape 16:9, about 2400×1350." value={draft.wide} onChange={(v) => set('wide', v)} />
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium">Gallery</span>
            <div className="flex flex-wrap gap-3">
              {draft.gallery.map((url, i) => (
                <div key={url + i} className="relative h-24 w-20 overflow-hidden rounded-lg border border-line">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button type="button" aria-label={`Remove gallery photo ${i + 1}`} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-xs text-white" onClick={() => set('gallery', draft.gallery.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              <label className={`${btnGhost} grid h-24 w-20 cursor-pointer place-items-center text-center !rounded-lg !px-2 text-xs`}>
                {galleryBusy ? 'Uploading…' : '+ Add'}
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={galleryBusy} onChange={(e) => { void addGallery(e.target.files); e.target.value = '' }} />
              </label>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Placeholder colour A" hint="Shown when there is no photo.">
              <input type="color" className="h-10 w-full rounded-lg border border-line" value={draft.tone.from} onChange={(e) => set('tone', { ...draft.tone, from: e.target.value })} />
            </Field>
            <Field label="Placeholder colour B">
              <input type="color" className="h-10 w-full rounded-lg border border-line" value={draft.tone.to} onChange={(e) => set('tone', { ...draft.tone, to: e.target.value })} />
            </Field>
            <Field label="Order" hint="Lower numbers appear first.">
              <input type="number" min={0} className={inputClass} value={draft.order} onChange={(e) => set('order', Number(e.target.value) || 0)} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.published} onChange={(e) => set('published', e.target.checked)} />
            Published (visible on the site)
          </label>

          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          <div className="flex gap-3">
            <button type="submit" className={btn} disabled={saving}>{saving ? 'Saving…' : 'Save destination'}</button>
            <button type="button" className={btnGhost} onClick={() => setDraft(null)}>Cancel</button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-medium">Destinations</h2>
        <button type="button" className={btn} onClick={() => open(blank((items?.length ?? 0) + 1), false)}>New destination</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!items && !error && <p className="text-muted">Loading…</p>}
      {items && items.length === 0 && <p className="text-muted">No destinations yet. Add your first one.</p>}
      <ul className="divide-y divide-line border-y border-line">
        {items?.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center gap-4 py-4">
            <div className="h-14 w-11 shrink-0 overflow-hidden rounded-md bg-wash">
              {d.cover && <img src={d.cover} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{d.name}, {d.country}</p>
              <p className="text-sm text-muted">{d.duration || 'No duration'} · /destinations/{d.slug}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs ${d.published ? 'bg-wash' : 'border border-line text-muted'}`}>{d.published ? 'Published' : 'Draft'}</span>
            <button type="button" className={btnGhost} onClick={() => open(toDraft(d), true)}>Edit</button>
            <button type="button" className="text-sm text-red-600 hover:underline" onClick={() => void remove(d)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
