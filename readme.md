# Aces Marine — Website

Official website for Aces Marine. A static site built from reusable sections and deployed on Vercel.

---

## The One Rule You Must Remember

> **Page content is edited in `src/`. Images, CSS and JS are edited at the project root.**
>
> `index.html` (root) and everything inside `dist/` are **generated** — the build overwrites them every time. Never edit those directly.

How the build works:

```
 src/*.html   (page sections)     ─┐
 images/  css/  js/  assets/       │──▶  npm run build  ──▶  index.html (root)
 hero-section-video.mp4            │                        dist/ (what goes live)
                                   ┘                        Vercel publishes dist/
```

---

## Folder Map

```
◄── EDIT HERE ───────────────────────────────────────────────────────►

 src/                       Page sections (the text/content of the site)
 ├── _hero.html               Top banner
 ├── _about.html              About section
 ├── _expertise.html          Services section
 ├── _projects.html           Projects gallery
 ├── _reviews.html            Reviews
 ├── _footer.html             Footer + contact info
 └── (full list below)

 images/                    ALL website images (projects, about, hero, etc.)
 css/style.css              Styles
 js/                        Scripts
 assets/                    Logo and favicon files
 hero-section-video.mp4     Hero background video


◄── DO NOT TOUCH ───────────────────────────────────────────────────►

 index.html                 Compiled page (build output)
 dist/                      Production build (deployed to Vercel)

 build.js                   The build script
 sync-back.js               Utility: pulls edits back from index.html into src/
 vercel.json                Deploy settings
 wrangler.toml              Cloudflare config (alternative hosting option)
 package.json               Project commands
```

### Page sections in `src/`

| File | What it contains |
| --- | --- |
| `_head.html` | Page title, meta tags |
| `_nav.html` | Top navigation bar |
| `_hero.html` | Main banner + video |
| `_about.html` | About section |
| `_expertise.html` | Services offered |
| `_reviews.html` | Customer reviews |
| `_projects.html` | Projects gallery with photos |
| `_serving.html` | Areas served |
| `_map.html` | Embedded map |
| `_footer.html` | Footer + contact/links |
| `_scripts.html` | Script includes |

---

## How to Update Images (most common task)

1. Drop the new file into the **root `images/` folder** (e.g. a project photo goes in `images/`).
2. **Keep the exact same file name** as the one you are replacing (e.g. replace `project-dock.webp` with your new `project-dock.webp`).
   - Same name = no code changes needed. The site just shows your new picture.
   - Adding a brand-new image? Use a simple name: lowercase, no spaces (`project-dock.webp`, not `Project Dock!.png`).
3. Rebuild and deploy (next section).

> **Supported formats:** `.webp` (best), `.png`, `.jpg`. Keep images a few hundred kB or less so the site stays fast.

---

## How to Edit Text / Prices / Phone Numbers

1. Open the matching section file in `src/` (see the table above).
2. Change the text, save the file.
3. Rebuild and deploy.

---

## Run Locally (Developer)

Requirements: [Node.js](https://nodejs.org) (LTS) installed.

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Build the site (compiles src/ into index.html + dist/)
npm run build

# 3. Start a local server
npm run dev
```

Then open **http://localhost:3001**. The local server also serves the `/api/submit` endpoint used by the estimate form (no separate `npx serve` needed).

| Command | What it does |
| --- | --- |
| `npm install` | Installs dependencies (run once after cloning) |
| `npm run build` | Compiles `src/` into `index.html` and `dist/` |
| `npm run dev` / `npm start` | Serves the site + `/api/submit` locally on port 3001 |
| `npm run db:setup` | Creates the `leads` table in Turso (idempotent, safe to re-run) |
| `node sync-back.js` | Utility: if someone edited `index.html` directly, pull those edits back into `src/` |

---

## Estimate Form & Database

The "Free Estimate" form submits to the `/api/submit` serverless function, which writes leads to a [Turso](https://turso.tech) SQLite database.

### Required environment variables

Create a `.env` file (for local dev) and configure the same values in the Vercel project's environment settings:

| Variable | Description |
| --- | --- |
| `TURSO_URL` | Turso database URL (e.g. `libsql://your-db.turso.io`) |
| `TURSO_AUTH_TOKEN` | Turso database authentication token |

### Create the table

Run the migration once against the database you point `TURSO_URL` at (locally and in production):

```bash
npm run db:setup
```

The script is idempotent (`CREATE TABLE IF NOT EXISTS leads`) and never drops data, so it is safe to run on every deploy. The `/api/submit` handler also ensures the table exists on write as a safety net.

---

## Deploy (Publish the Site)

The site is hosted on **Vercel**, connected to the GitHub repository.

1. Edit files (content in `src/`, images in `images/`).
2. `npm run build` and commit + push to `main`.
3. Vercel builds automatically and publishes the `dist/` folder.

```
 Edit files  →  npm run build  →  Commit + push to main  →  Vercel deploys  →  Live site
```

> Note: a `wrangler.toml` (Cloudflare Pages) config also exists in the repo if the site ever moves to Cloudflare. The live deployment today is Vercel.
