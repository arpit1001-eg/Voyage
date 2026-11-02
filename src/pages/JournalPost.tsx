import { Link, useParams } from 'react-router'
import type { Post } from '../../shared/types'
import { formatLongDate, readMinutes, useFetch } from '../lib/api'
import NotFound from './NotFound'
import CtaBand from '../components/CtaBand'
import Seo from '../components/Seo'

export default function JournalPost() {
  const { slug = '' } = useParams()
  const { data: post, error, loading } = useFetch<Post>(`/api/posts/${encodeURIComponent(slug)}`)

  if (error?.status === 404) return <NotFound />
  if (!post) {
    return (
      <div className="mx-auto min-h-svh max-w-3xl px-6 pt-48">
        <p role={error ? 'alert' : 'status'} className="text-muted">
          {loading ? 'Loading post…' : 'This post couldn’t be loaded. Refresh to try again.'}
        </p>
      </div>
    )
  }

  return (
    <article>
      <Seo title={post.title} />
      <header className="mx-auto max-w-3xl px-6 pb-12 pt-36 md:pt-48">
        <Link to="/journal" className="text-sm text-muted transition-colors hover:text-foreground">Back to journal</Link>
        <h1 className="font-display mt-6 text-5xl leading-[1] tracking-[-0.03em] md:text-7xl">{post.title}</h1>
        <p className="mt-6 text-sm text-muted">
          {formatLongDate(post.date)} · {readMinutes(post.body)} min read
        </p>
      </header>

      {post.cover && (
        <div className="mx-auto max-w-5xl px-6">
          <img src={post.cover} alt="" className="aspect-video w-full rounded-3xl object-cover" />
        </div>
      )}

      <div className="mx-auto max-w-2xl space-y-6 px-6 py-16 text-xl leading-[1.7] md:py-24">
        {post.body.map((para, i) => <p key={i}>{para}</p>)}
      </div>
      <CtaBand />
    </article>
  )
}
