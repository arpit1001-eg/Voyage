import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Destination, Enquiry, Post } from '../shared/types'
import type { GameProgress, GameSession } from './game'
import { seedDestinations, seedPosts } from './seed'

export const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve('data')

/** A tiny JSON-file collection: fine for a portfolio-sized site, no database to run. */
class Collection<T extends { id: string }> {
  private items: T[] = []
  private queue: Promise<void> = Promise.resolve()

  constructor(
    private file: string,
    private seed: () => T[],
  ) {}

  async init() {
    await fs.mkdir(path.dirname(this.file), { recursive: true })
    try {
      this.items = JSON.parse(await fs.readFile(this.file, 'utf8'))
    } catch (err) {
      // Only seed when the file is genuinely absent: never overwrite a file we failed to parse.
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
      this.items = this.seed()
      await this.flush()
    }
  }

  private flush() {
    const data = JSON.stringify(this.items, null, 2)
    this.queue = this.queue
      .catch(() => {})
      .then(async () => {
        const tmp = `${this.file}.tmp`
        await fs.writeFile(tmp, data)
        await fs.rename(tmp, this.file)
      })
    return this.queue
  }

  all(): T[] {
    return structuredClone(this.items)
  }

  find(predicate: (item: T) => boolean): T | undefined {
    const found = this.items.find(predicate)
    return found ? structuredClone(found) : undefined
  }

  async create(item: T) {
    this.items.push(item)
    await this.flush()
    return structuredClone(item)
  }

  async update(id: string, patch: Partial<T>) {
    const i = this.items.findIndex((x) => x.id === id)
    if (i < 0) return null
    this.items[i] = { ...this.items[i], ...patch, id }
    await this.flush()
    return structuredClone(this.items[i])
  }

  async remove(id: string) {
    const before = this.items.length
    this.items = this.items.filter((x) => x.id !== id)
    if (this.items.length === before) return false
    await this.flush()
    return true
  }
}

export const destinations = new Collection<Destination>(path.join(DATA_DIR, 'destinations.json'), seedDestinations)
export const posts = new Collection<Post>(path.join(DATA_DIR, 'posts.json'), seedPosts)
export const enquiries = new Collection<Enquiry>(path.join(DATA_DIR, 'enquiries.json'), () => [])
export const gameSessions = new Collection<GameSession>(path.join(DATA_DIR, 'game-sessions.json'), () => [])
export const gameProgress = new Collection<GameProgress>(path.join(DATA_DIR, 'game-progress.json'), () => [])

export const initStore = async () => {
  await Promise.all([destinations.init(), posts.init(), enquiries.init(), gameSessions.init(), gameProgress.init()])
  const marker = path.join(DATA_DIR, '.curated-destinations-v2')
  try {
    await fs.access(marker)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    const slugs = new Set(destinations.all().map((destination) => destination.slug))
    for (const destination of seedDestinations()) {
      if (!slugs.has(destination.slug)) await destinations.create(destination)
    }
    await fs.writeFile(marker, '2\n')
  }
}
