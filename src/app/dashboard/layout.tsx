'use client';

import { useEffect, useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import ToastContainer from '@/components/ui/Toast';
import { usePostStore } from '@/lib/store/usePostStore';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { useToastStore } from '@/lib/store/useToastStore';
import { analyzePost, hasApiKey } from '@/lib/ai/openrouter';

// 📚 LEARN: The dashboard layout wraps all /dashboard/* routes.
// It provides the sidebar, mobile nav, and handles store hydration.
// This pattern keeps the sidebar persistent across route changes.

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const hydratePost = usePostStore((s) => s.hydrate);
  const hydrateCollection = useCollectionStore((s) => s.hydrate);
  const isPostHydrated = usePostStore((s) => s.isHydrated);
  const isCollectionHydrated = useCollectionStore((s) => s.isHydrated);
  const bulkAddTags = usePostStore((s) => s.bulkAddTags);
  const updatePost = usePostStore((s) => s.updatePost);
  const addToast = useToastStore((s) => s.addToast);

  const [isAutoTagging, setIsAutoTagging] = useState(false);

  // 📚 LEARN: Hydrate stores from IndexedDB on mount. This bridges SSR and client state.
  useEffect(() => {
    hydratePost();
    hydrateCollection();
  }, [hydratePost, hydrateCollection]);

  // 📚 LEARN: We snapshot untagged posts at call time to avoid stale closure issues.
  const handleAIAutoTag = useCallback(async () => {
    if (!hasApiKey()) {
      addToast('error', 'Please add your OpenRouter API key in Settings first.');
      return;
    }

    const currentPosts = usePostStore.getState().posts.filter((p) => !p.isDeleted);
    const untaggedPosts = currentPosts.filter((p) => !p.aiAnalyzed);
    if (untaggedPosts.length === 0) {
      addToast('info', 'All posts are already analyzed!');
      return;
    }

    setIsAutoTagging(true);
    addToast('ai', `Analyzing ${untaggedPosts.length} posts...`);

    let processed = 0;
    let failures = 0;
    for (const post of untaggedPosts) {
      try {
        const result = await analyzePost(post.url, post.caption, (msg, variant) => addToast(variant, msg));
        await bulkAddTags(post.id, result.tags);
        await updatePost(post.id, { aiAnalyzed: true });
        processed++;

        if (processed % 5 === 0) {
          addToast('ai', `Analyzed ${processed} of ${untaggedPosts.length} posts...`);
        }

        // 📚 LEARN: Rate limit respect — wait between API calls to avoid 429 errors.
        await new Promise((r) => setTimeout(r, 800));
      } catch (err) {
        const code = err instanceof Error ? err.message : '';
        failures++;
        if (code === 'NO_API_KEY') {
          addToast('error', 'Please add your OpenRouter API key in Settings.');
          break;
        } else if (code === 'INVALID_KEY') {
          addToast('error', 'Your API key is invalid. Please check it in Settings.');
          break;
        } else if (code === 'NO_CREDITS') {
          addToast('error', 'No credits on your OpenRouter account. Add credits at openrouter.ai/credits for premium AI.');
          break;
        } else if (code === 'ALL_MODELS_FAILED') {
          addToast('error', 'All AI models are rate-limited. Try again later or add credits to your OpenRouter account.');
          break;
        } else {
          addToast('error', `Failed to analyze post ${processed + failures}. Continuing...`);
        }
        // Wait longer after failures
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    setIsAutoTagging(false);
    if (processed > 0) {
      addToast('success', `Done! Analyzed ${processed} posts${failures > 0 ? ` (${failures} failed)` : ''}.`);
    }
  }, [bulkAddTags, updatePost, addToast]);

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
