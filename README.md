# Archivrr

**Your Instagram saves, finally organized.** Made by chikit.

Archivrr turns your chaotic saved posts pile into a searchable, tagged, AI-powered personal archive. Built with Next.js 14, TypeScript, Zustand, Tailwind CSS, and Framer Motion.

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
