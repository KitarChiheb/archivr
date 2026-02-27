'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Bookmark, Tag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import TopNav from '@/components/layout/TopNav';

// 📚 LEARN: The landing page hero is the first thing users see.
// An animated gradient mesh background creates visual interest without stock photos.
// Staggered text animations guide the eye from headline to CTA.

const features = [
  {
    icon: <Bookmark size={20} />,
    title: 'Smart Collections',
    description: 'Organize saves into custom folders with drag & drop.',
  },
  {
    icon: <Tag size={20} />,
    title: 'Instant Tagging',
    description: 'Tag posts manually or let AI auto-categorize everything.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'AI-Powered',
    description: 'Auto-tag, smart search, and collection suggestions.',
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Global navigation */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <TopNav />
      </div>

      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px] animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #833AB4, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-[100px] animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #FD1D1D, transparent 70%)', animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 blur-[80px] animate-pulse-slow"
          style={{ background: 'radial-gradient(circle, #F77737, transparent 70%)', animationDelay: '2s' }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto"
      >
        {/* Logo badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card mb-8"
        >
          <span className="gradient-text font-bold text-sm">Archivrr</span>
          <span className="text-text-secondary text-xs">v1.0</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-h1 text-text-primary mb-6 leading-tight"
        >
          Your Instagram saves,{' '}
          <span className="gradient-text">finally organized.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-lg text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Archivrr turns your chaotic saved posts pile into a searchable, tagged, AI-powered personal archive.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Link
            href="/import"
            className="inline-flex items-center gap-2 px-8 py-4 gradient-accent text-white font-semibold text-base rounded-2xl shadow-lg shadow-accent-purple/25 hover:shadow-accent-purple/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Organizing — It&apos;s Free
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </motion.div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-3xl mx-auto w-full"
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="glass-card p-5 flex flex-col items-center text-center gap-3 hover:bg-bg-surface-hover/50 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center text-white">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-text-primary text-sm">{feature.title}</h3>
            <p className="text-text-secondary text-xs leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Demo mockup below fold — shows real images to prove the app works */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="mt-24 max-w-4xl w-full mx-auto"
      >
        <div className="glass-card p-1 rounded-2xl overflow-hidden animate-float">
          <div className="bg-bg-surface rounded-xl p-4 sm:p-6">
            <div className="flex gap-4">
              {/* Sidebar mockup */}
              <div className="w-44 shrink-0 hidden sm:block space-y-3">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="gradient-text font-bold text-sm">Archivrr</span>
                </div>
                <div className="space-y-1">
                  {[
                    { emoji: '📌', label: 'All Posts', count: '30', active: true },
                    { emoji: '🍕', label: 'Food Inspo', count: '8', active: false },
                    { emoji: '✈️', label: 'Travel Goals', count: '6', active: false },
                    { emoji: '🎨', label: 'Design Ref', count: '5', active: false },
                    { emoji: '💪', label: 'Workout Plans', count: '4', active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${
                        item.active
                          ? 'bg-accent-purple/10 text-text-primary border-l-2 border-accent-purple'
                          : 'text-text-secondary'
                      }`}
                    >
                      <span>{item.emoji}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="text-[10px] opacity-60">{item.count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 mx-3 border-t border-border" />
                <div className="flex flex-wrap gap-1 px-3">
                  {['food', 'travel', 'design', 'fitness'].map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {/* Grid mockup with real images */}
              <div className="flex-1 grid grid-cols-3 gap-2">
                {[
                  { seed: 'food1', caption: '🍕' },
                  { seed: 'travel1', caption: '🇬🇷' },
                  { seed: 'design1', caption: '🏠' },
                  { seed: 'fashion1', caption: '👗' },
                  { seed: 'fitness1', caption: '💪' },
                  { seed: 'quote1', caption: '💬' },
                ].map((item) => (
                  <div
                    key={item.seed}
                    className="aspect-square rounded-lg overflow-hidden relative group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://picsum.photos/seed/${item.seed}/200/200`}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                        {item.caption}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-20 pb-8 text-center text-text-secondary text-xs">
        <p>&copy; {new Date().getFullYear()} Archivrr. Made by chikit.</p>
      </footer>
    </section>
  );
}
