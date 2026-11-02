import { Link } from 'react-router'
import type { Post } from '../../shared/types'
import { formatMonth, readMinutes, useFetch } from '../lib/api'

/** `preview` shows a heading + link to the full journal and only the latest posts. */
export default function Journal({ preview = true }: { preview?: boolean }) {
  const { data, error, loading } = useFetch<Post[]>('/api/posts')
  const posts = preview ? data?.slice(0, 3) : data

  if (preview && !posts?.length) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-8 md:py-32">
      {preview && (
        <div className="mb-14 flex items-end justify-between gap-6">
          <h2 className="font-display text-5xl leading-none tracking-[-0.03em] md:text-7xl">
            From the <span className="italic text-muted">journal</span>
          </h2>
          <Link to="/journal" className="shrink-0 text-sm underline underline-offset-4 decoration-line transition-colors hover:decoration-foreground">
            All posts
          </Link>
        </div>
      )}

      {loading && <p className="text-muted">Loading posts…</p>}
      {error && !posts && <p role="alert" className="text-muted">Posts couldn’t be loaded. Refresh to try again.</p>}
      {posts && posts.length === 0 && <p className="text-muted">No posts yet.</p>}

      {posts && posts.length > 0 && (
        <ul className="border-t border-line">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-line">
              <Link
                to={`/journal/${post.slug}`}
                className="group flex flex-col gap-3 py-8 md:flex-row md:items-baseline md:justify-between md:gap-12"
              >
                <span className="font-display max-w-2xl text-3xl leading-tight tracking-tight underline decoration-transparent decoration-1 underline-offset-8 transition-[text-decoration-color] duration-300 group-hover:decoration-foreground md:text-4xl">
                  {post.title}
                </span>
                <span className="shrink-0 text-sm text-muted">
                  {formatMonth(post.date)} · {readMinutes(post.body)} min read
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
