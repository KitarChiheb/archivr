'use client';

import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import ToastContainer from '@/components/ui/Toast';
import { usePostStore } from '@/lib/store/usePostStore';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { useToastStore } from '@/lib/store/useToastStore';
import { analyzePost } from '@/lib/ai/openrouter';

// 📚 LEARN: The dashboard layout wraps all /dashboard/* routes.
// It provides the sidebar, mobile nav, and handles store hydration.
// This pattern keeps the sidebar persistent across route changes.

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hydratePost = usePostStore((s) => s.hydrate);
  const hydrateCollection = useCollectionStore((s) => s.hydrate);
  const isPostHydrated = usePostStore((s) => s.isHydrated);
  const isCollectionHydrated = useCollectionStore((s) => s.isHydrated);
  const posts = usePostStore((s) => s.getActivePosts());
  const bulkAddTags = usePostStore((s) => s.bulkAddTags);
  const updatePost = usePostStore((s) => s.updatePost);
  const addToast = useToastStore((s) => s.addToast);

  const [isAutoTagging, setIsAutoTagging] = useState(false);

  // 📚 LEARN: Hydrate stores from IndexedDB on mount. This bridges SSR and client state.
  useEffect(() => {
    hydratePost();
    hydrateCollection();
  }, [hydratePost, hydrateCollection]);

  const handleAIAutoTag = useCallback(async () => {
    const untaggedPosts = posts.filter((p) => !p.aiAnalyzed);
    if (untaggedPosts.length === 0) {
      addToast('info', 'All posts are already analyzed!');
      return;
    }

    setIsAutoTagging(true);
    addToast('ai', `Analyzing ${untaggedPosts.length} posts...`);

    let processed = 0;
    for (const post of untaggedPosts) {
      try {
        const result = await analyzePost(post.url, post.caption);
        await bulkAddTags(post.id, result.tags);
        await updatePost(post.id, { aiAnalyzed: true });
        processed++;

        if (processed % 5 === 0) {
          addToast('ai', `Analyzed ${processed} of ${untaggedPosts.length} posts...`);
        }

        // 📚 LEARN: Rate limit respect — wait between API calls to avoid 429 errors.
        await new Promise((r) => setTimeout(r, 500));
      } catch {
        addToast('error', `Failed to analyze post ${processed + 1}. Continuing...`);
      }
    }

    setIsAutoTagging(false);
    addToast('success', `Done! Analyzed ${processed} posts.`);
  }, [posts, bulkAddTags, updatePost, addToast]);

  if (!isPostHydrated || !isCollectionHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading your archive...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar onAIAutoTag={handleAIAutoTag} isAutoTagging={isAutoTagging} />
      <main className="flex-1 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}
