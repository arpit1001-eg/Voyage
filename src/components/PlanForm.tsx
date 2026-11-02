import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Destination } from '../../shared/types'
import { site } from '../config/site'
import { api, ApiError, useFetch } from '../lib/api'

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().trim().max(30, 'That number is too long.').optional(),
  destination: z.string().min(1, 'Choose a destination, or “Not sure yet”.'),
  dates: z.string().trim().max(120).optional(),
  travellers: z.string().min(1, 'Choose how many are travelling.'),
  budget: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters).'),
  website: z.string().optional(), // honeypot
})
type FormValues = z.infer<typeof schema>

const NOT_SURE = 'Not sure yet'

const field =
  'w-full border-0 border-b border-line bg-transparent py-3 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-foreground aria-[invalid=true]:border-red-600'

export default function PlanForm() {
  const { data: destinations } = useFetch<Destination[]>('/api/destinations')
  const [params] = useSearchParams()
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { destination: '', travellers: '2' } })

  // Arriving from a destination page: preselect it.
  const wanted = params.get('destination')
  useEffect(() => {
    if (!wanted || !destinations || getValues('destination')) return
    const match = destinations.find((d) => d.slug === wanted)
    if (match) setValue('destination', `${match.name}, ${match.country}`)
  }, [wanted, destinations, getValues, setValue])

  const onSubmit = async (values: FormValues) => {
    try {
      await api('/api/enquiries', { method: 'POST', json: values })
      setSent(true)
      reset({ destination: '', travellers: '2' })
    } catch (err) {
      const reason =
        err instanceof ApiError && err.status === 429
          ? 'You’ve sent a few enquiries already. Wait a minute and try again.'
          : site.email
            ? `Your enquiry didn't send. Try again, or email ${site.email}.`
            : 'Your enquiry did not send. Please try again; alternate contact details are not configured for this demo.'
      setError('root', { message: reason })
    }
  }

  const err = (name: keyof FormValues) =>
    errors[name] && <p id={`${name}-err`} className="mt-2 text-sm text-red-600">{errors[name]?.message}</p>
  const aria = (name: keyof FormValues) => ({
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${name}-err` : undefined,
  })

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-40">
      <div className="grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
        <div>
          <h1 className="font-display text-5xl leading-none tracking-[-0.03em] md:text-7xl">
            Tell us where you’d like <span className="italic text-muted">to go.</span>
          </h1>
          <p className="mt-8 max-w-sm text-base leading-relaxed text-muted">
            A few lines is enough. We’ll reply within {site.replyTime} with questions or a first idea.
          </p>
          {site.email
            ? <a href={`mailto:${site.email}`} className="mt-6 inline-block text-base underline underline-offset-4 decoration-line transition-colors hover:decoration-foreground">{site.email}</a>
            : <p className="mt-6 text-sm text-muted">Contact details are not configured for this demo.</p>}
        </div>

        {sent ? (
          <div role="status" className="self-center">
            <p className="font-display text-4xl tracking-tight md:text-5xl">Enquiry sent.</p>
            <p className="mt-4 text-muted">Thank you. We’ll reply within {site.replyTime}.</p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-8 rounded-full border border-foreground px-6 py-2.5 text-sm transition-colors hover:bg-foreground hover:text-background"
            >
              Send another enquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
            {/* Honeypot: hidden from people, visible to bots. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <label htmlFor="website">Website</label>
              <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-sm text-muted">Name</label>
                <input id="name" autoComplete="name" className={field} {...aria('name')} {...register('name')} />
                {err('name')}
              </div>
              <div>
                <label htmlFor="email" className="text-sm text-muted">Email</label>
                <input id="email" type="email" autoComplete="email" className={field} {...aria('email')} {...register('email')} />
                {err('email')}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="destination" className="text-sm text-muted">Destination</label>
                <select id="destination" className={field} {...aria('destination')} {...register('destination')}>
                  <option value="" disabled>Select one</option>
                  {destinations?.map((d) => (
                    <option key={d.id} value={`${d.name}, ${d.country}`}>{d.name}, {d.country}</option>
                  ))}
                  <option value={NOT_SURE}>{NOT_SURE}</option>
                </select>
                {err('destination')}
              </div>
              <div>
                <label htmlFor="travellers" className="text-sm text-muted">Travellers</label>
                <select id="travellers" className={field} {...aria('travellers')} {...register('travellers')}>
                  {site.travellerOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {err('travellers')}
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <label htmlFor="dates" className="text-sm text-muted">Dates (optional)</label>
                <input id="dates" placeholder="e.g. March 2027, flexible" className={field} {...register('dates')} />
              </div>
              <div>
                <label htmlFor="budget" className="text-sm text-muted">Budget (optional)</label>
                <input id="budget" placeholder="Per person, if you have one in mind" className={field} {...register('budget')} />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="text-sm text-muted">Phone (optional)</label>
              <input id="phone" type="tel" autoComplete="tel" className={field} {...aria('phone')} {...register('phone')} />
              {err('phone')}
            </div>

            <div>
              <label htmlFor="message" className="text-sm text-muted">Tell us about the trip</label>
              <textarea id="message" rows={4} className={`${field} resize-none`} {...aria('message')} {...register('message')} />
              {err('message')}
            </div>

            {errors.root && <p role="alert" className="text-sm text-red-600">{errors.root.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-foreground px-12 py-4 text-base text-background transition-transform hover:scale-[1.03] disabled:scale-100 disabled:opacity-60"
            >
              {isSubmitting ? 'Sending…' : 'Send enquiry'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
