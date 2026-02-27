# Archivr

**Your Instagram saves, finally organized.** Made by chikit.

Archivr turns your chaotic saved posts pile into a searchable, tagged, AI-powered personal archive. Built with Next.js 14, TypeScript, Zustand, Tailwind CSS, and Framer Motion.

## Features

- **Smart Collections** — Organize saves into custom folders
- **AI Auto-Tagging** — Let AI categorize your posts automatically (via OpenRouter)
- **Cascading AI Fallback** — 5 free models + 2 paid fallbacks for reliable tagging
- **Live Search** — Filter posts by caption, tag, or URL in real-time
- **Multiple Import Methods** — Instagram JSON export, URL paste, or demo data
- **Offline-First** — All data stored locally in IndexedDB
- **Beautiful UI** — Dark/light theme with glassmorphism and smooth animations
- **No Server Required** — API key managed in-browser via Settings page

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd archivr

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Setting up AI features

1. Go to **Settings** in the app
2. Get a free API key at [openrouter.ai/keys](https://openrouter.ai/keys)
3. Paste your key and click **Save**
4. (Recommended) Add $1–5 in [OpenRouter credits](https://openrouter.ai/credits) for faster, more reliable AI

No `.env.local` file is needed for the API key — it's stored securely in your browser's localStorage.

## Environment Variables (optional)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Optional | Your deployed app URL (used for OpenRouter referrer header) |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State:** Zustand + IndexedDB (via idb)
- **AI:** OpenRouter API (5 free models + 2 paid fallbacks)
- **Icons:** Lucide React
- **Animations:** Framer Motion

## Deploy to Vercel

### Step-by-step

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/archivr.git
   git push -u origin main
   ```

2. **Import in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click **Import** next to your `archivr` repository
   - Vercel auto-detects Next.js — no configuration needed

3. **Set environment variable** (optional)
   - In Vercel project settings → Environment Variables
   - Add `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
   - This is only for the OpenRouter referrer header — not required

4. **Deploy**
   - Click **Deploy** — Vercel builds and deploys automatically
   - Your app is live at `https://archivr-xxx.vercel.app`

5. **Users set their own API key**
   - Each user adds their own OpenRouter API key in the Settings page
   - No server-side API key is needed — the app is fully BYOK (Bring Your Own Key)

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
