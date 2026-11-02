import 'dotenv/config'
import { createApp } from './app'
import { ADMIN_PASSWORD, passwordWasGenerated } from './auth'

const isProd = process.env.NODE_ENV === 'production'
const PORT = Number(process.env.PORT) || 8787

if (isProd) {
  const missing = ['ADMIN_PASSWORD', 'SESSION_SECRET', 'SITE_URL'].filter((k) => !process.env[k])
  if (missing.length) {
    console.error(`Missing required environment variables for production: ${missing.join(', ')}`)
    process.exit(1)
  }
}

const app = await createApp()
app.listen(PORT, () => {
  console.log(`Voyage API listening on http://localhost:${PORT}`)
  if (passwordWasGenerated) {
    console.log(`\n  No ADMIN_PASSWORD set. Temporary admin password for this run: ${ADMIN_PASSWORD}\n  Set ADMIN_PASSWORD in .env to keep one.\n`)
  }
})
