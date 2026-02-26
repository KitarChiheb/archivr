# Archivr

**Your Instagram saves, finally organized.**

Archivr turns your chaotic saved posts pile into a searchable, tagged, AI-powered personal archive. Built with Next.js 14, TypeScript, Zustand, Tailwind CSS, and Framer Motion.

## Features

- **Smart Collections** — Organize saves into custom folders
- **AI Auto-Tagging** — Let AI categorize your posts automatically (via OpenRouter)
- **Live Search** — Filter posts by caption, tag, or URL in real-time
- **Multiple Import Methods** — Instagram JSON export, URL paste, or demo data
- **Offline-First** — All data stored locally in IndexedDB
- **Beautiful UI** — Dark theme with glassmorphism and smooth animations

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd archivr

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your OpenRouter API key

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | For AI features | Get a free key at [openrouter.ai/keys](https://openrouter.ai/keys) |
| `NEXT_PUBLIC_APP_URL` | Optional | Your deployed app URL |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **State:** Zustand + IndexedDB (via idb)
- **AI:** OpenRouter API (free Llama models)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Drag & Drop:** @dnd-kit/core

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import in Vercel
3. Add `OPENROUTER_API_KEY` environment variable
4. Deploy — zero config needed
