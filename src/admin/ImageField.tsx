import { useState, type ChangeEvent } from 'react'
import { btnGhost, errorMessage, uploadImage } from './ui'

type Props = { label: string; value: string; onChange: (url: string) => void; hint?: string }

export default function ImageField({ label, value, onChange, hint }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await uploadImage(file))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-wash text-xs text-muted">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : 'No image'}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className={`${btnGhost} cursor-pointer`}>
            {busy ? 'Uploading…' : value ? 'Replace' : 'Upload'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={onFile} disabled={busy} />
          </label>
          {value && (
            <button type="button" className={btnGhost} onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
