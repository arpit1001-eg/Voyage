# VOYAGE

An editorial travel-discovery and planning portfolio app with a destination CMS, a guest Passport Quest game, editable sample itineraries, and a trip-enquiry inbox.

**Stack:** React 19, TypeScript, Vite, Tailwind v4, GSAP + ScrollTrigger, Lenis, React Three Fiber, React Router. Server: Node + Express (JSON-file storage, no database to run).

## The VOYAGE experience

- **Discover:** Search, filter, sort, save, and browse a curated destination catalogue at `/discover`; switch between story and approximate map views.
- **Plan:** Use the Trip Studio to create and edit a demo day-by-day draft based on destination, origin, dates, party size, interests, pace, and budget. Saved drafts can be reopened at `/planner/:tripId`.
- **Play:** Explore the Passport Quest destination map at `/adventure`, open a field guide, and check whether each place is new, in progress, or completed. Destination Detective is always available; Travel Trivia unlocks at 25 XP. The server validates answers, scores missions, and awards virtual XP/stamps. Route Challenge is a clearly marked, not-yet-playable preview that requires 150 XP to unlock.
- **Collect:** Review local saved trips/destinations and server-backed guest game progress at `/passport` or `/my-adventures`. Passport sharing contains progress only, never private trip details.
- **Enquire:** The original `/plan` form still sends trip enquiries to the admin inbox.

The Trip Studio is an explicitly labelled curated demo, not a live AI integration. Its estimates are regional heuristics with an illustrative category split, fixed sample currency conversions, and no live flights, hotel data, or booking availability. Confirm travel details independently. Trip drafts and saved destinations stay in browser storage; guest game progress is JSON-file-backed and associated with a signed, HttpOnly guest cookie. There is no account sign-in or cross-device trip sync. Unsplash sample photography and Google Fonts may be fetched from their hosts.

The starter catalogue includes 12 editorial demo destinations. On first startup after this update, a one-time migration adds missing curated seed entries without replacing existing destination content. The migration marker is kept in `DATA_DIR`.

## Run locally

```bash
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

- Site: http://localhost:5173
- Discover: http://localhost:5173/discover
- Planner: http://localhost:5173/planner
- Passport Quest: http://localhost:5173/adventure
- Admin CMS: http://localhost:5173/admin
- If you leave `ADMIN_PASSWORD` empty in `.env`, a temporary password is printed in the terminal when the server starts.

`npm run dev` starts the React app (Vite) and API (port 8787) together. Vite forwards `/api` and `/uploads` to the API.

## Game API and data

- `GET /api/game/progress` returns the current guest's virtual progress.
- `POST /api/game/sessions` starts a date-keyed `destination-detective-YYYY-MM-DD` or `travel-trivia-YYYY-MM-DD` mission. Travel Trivia requires 25 XP; the server enforces this unlock.
- `POST /api/game/sessions/:id/answer` accepts a destination slug from that question's choices; the server computes correctness and score.
- `POST /api/game/sessions/:id/complete` awards 10 XP per correct answer plus a 25 XP first-completion bonus once per mission/day, and records destination stamps. Client-supplied scores or XP are ignored.

Both playable missions have five questions, one point per correct answer, server-checked answers, and a results screen. Map marker progress uses locally viewed destinations for "in progress" and server-backed passport stamps for "completed"; viewed-place history is stored in this browser only. The map is illustrative, not a navigation service. Route Challenge has no scoring or rewards yet and is not playable.

Game sessions and progress are stored in `game-sessions.json` and `game-progress.json`. The guest cookie is signed with `SESSION_SECRET` and is HttpOnly/SameSite; guest progress is not authenticated account data.

Saved trips and destination favorites use the `voyage-passport-v1` browser local-storage key. They are private to that browser profile, not encrypted or synced, and should not contain sensitive personal data.

## Editing content (the CMS)

Open `/admin` and sign in.

- **Destinations:** name, country, region, summary, duration, best season, optional price, overview, highlights, a step-by-step sample itinerary (reorderable), cover / wide / gallery photos, order, published or draft. Leave "Price" empty to hide it.
- **Journal:** title, slug, date, excerpt, post body, optional cover image, published or draft.
- **Enquiries:** everything sent through the Plan a Trip form (destination, travellers, dates, budget, message). Mark as read or delete.

Photo sizes: cover 4:5 (about 1600x2000), wide 16:9 (about 2400x1350). JPG, PNG, WebP or AVIF, up to 8 MB. Compress photos before uploading (Squoosh, TinyPNG).

Static copy (nav, optional contact address, and legacy site copy) is in `src/config/site.ts`. Destination and journal content is editable in the admin CMS. Seed copy is illustrative demo content, not a substitute for checking current local guidance. Contact is intentionally unset until a real operator address is supplied.

The 3D globe pins and routes are decorative and are set in `src/components/Globe3D.tsx` (they do not read from the CMS).

## Where data lives

Everything is stored in `DATA_DIR` (default `./data`):

- `destinations.json`, `posts.json`, `enquiries.json`
- `uploads/` (uploaded images)

First run creates the files with placeholder content. **Back up this folder.** In production it must be on a persistent disk.

## Production

```bash
npm run build
npm start          # serves the built site + API on one port
```

Required environment variables in production (the server refuses to start without them):

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | Password for `/admin`. Long and unique. |
| `SESSION_SECRET` | Random string that signs admin sessions. |
| `SITE_URL` | Public URL, no trailing slash. Used for sitemap, canonical links, link previews. |

Optional: `PORT`, `DATA_DIR`, `ENQUIRY_WEBHOOK_URL` (Slack, Discord or Zapier webhook that receives each trip enquiry).

### Deploying

This needs a host that runs Node, not a static host (Netlify/Vercel static, GitHub Pages won't work as-is).

**Render / Railway / Fly.io:**
1. Push the project to GitHub.
2. Create a Web Service. Build command: `npm install && npm run build`. Start command: `npm start`.
3. Add the three required environment variables.
4. Attach a persistent disk and set `DATA_DIR` to its mount path (for example `/var/data`). Without a disk, content and uploads are lost on every deploy.
5. Put the site behind HTTPS (these hosts do this for you). Session cookies are marked Secure in production.

**A VPS:** run `npm start` under a process manager (pm2 or systemd) behind nginx or Caddy for HTTPS.

## Security notes

- Admin sessions use a signed, HttpOnly, SameSite cookie that expires after 12 hours. Login is rate-limited.
- Uploads are limited to real JPG/PNG/WebP/AVIF files (file signature is checked), 8 MB max. SVG is not accepted.
- The enquiry form is rate-limited and has a hidden spam trap field.
- Single admin password, no user accounts, no two-factor. Fine for one owner; add a proper auth provider if several people need access.
- Game guest cookies authenticate a random browser guest, not a person. There is no account recovery, account linking, or cross-device sync.
- Game data and CMS content use JSON files. Reward updates are not a database transaction; use a transactional database before running multiple production instances or offering valuable rewards.
- The game checks challenge ownership, answer choices, score, and one-time XP on the server. It is not a leaderboard or an anti-cheat system for real-world rewards.
- Trip Studio currently runs in curated demo mode. No AI provider is configured, and no travel/booking data provider is connected.
- `/discover` map mode is a labelled approximate, map-inspired location view; it is not a navigation map, routing service, or live map-provider integration.
- Privacy and terms pages describe demo behavior and must be replaced with operator-reviewed policies before a public commercial launch.
- No Content-Security-Policy header is set yet; add one for your host once the site is final.

## Known limits

- Storage is JSON files: good for hundreds of items, not for heavy traffic or multiple server instances. Move to a database if you outgrow it.
- Images are served as uploaded (not resized). Compress before uploading.
- Social previews and `<meta>` tags are injected by the server on each request. Pages are still rendered in the browser, not pre-rendered.
- Journal post text is plain paragraphs (no bold, links or images inside the body).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Site + API with hot reload |
| `npm run build` | Typecheck (site + server) and build |
| `npm test` | Game API ownership, answer-validation, and duplicate-reward tests |
| `npm start` | Production server |
| `npm run lint` | Lint |
