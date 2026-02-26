import Hero from '@/components/landing/Hero';

// 📚 LEARN: The root page.tsx in App Router maps to the "/" route.
// It's a server component by default, but Hero uses 'use client' since it needs Framer Motion.
export default function Home() {
  return <Hero />;
}
