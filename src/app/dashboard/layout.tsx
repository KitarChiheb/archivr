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
  // The auto-tag loop is robust: it retries failed posts with exponential backoff,
  // only stops on fatal errors (bad key), and continues through rate limits.
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
    let consecutiveFailures = 0;
    const failedPosts: typeof untaggedPosts = [];

    for (const post of untaggedPosts) {
      try {
        const result = await analyzePost(post.url, post.caption, (msg, variant) => addToast(variant, msg));
        await bulkAddTags(post.id, result.tags);
        await updatePost(post.id, { aiAnalyzed: true });
        processed++;
        consecutiveFailures = 0;

        if (processed % 5 === 0) {
          addToast('ai', `Analyzed ${processed} of ${untaggedPosts.length} posts...`);
        }

        // Wait between posts to respect rate limits
        await new Promise((r) => setTimeout(r, 2500));
      } catch (err) {
        const code = err instanceof Error ? err.message : '';
        consecutiveFailures++;

        // Fatal errors — stop immediately
        if (code === 'NO_API_KEY') {
          addToast('error', 'Please add your OpenRouter API key in Settings.');
          break;
        }
        if (code === 'INVALID_KEY') {
          addToast('error', 'Your API key is invalid. Please check it in Settings.');
          break;
        }

        // Non-fatal: rate limits, all models busy — save for retry
        failedPosts.push(post);

        if (consecutiveFailures >= 5) {
          addToast('info', `Rate limited. Waiting 15s before continuing...`);
          await new Promise((r) => setTimeout(r, 15000));
          consecutiveFailures = 0;
        } else {
          // Exponential backoff: 3s, 6s, 9s, 12s
          const backoff = 3000 * consecutiveFailures;
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    }

    // Retry failed posts once with longer delays
    if (failedPosts.length > 0 && consecutiveFailures < 5) {
      addToast('ai', `Retrying ${failedPosts.length} failed posts with longer delays...`);
      await new Promise((r) => setTimeout(r, 10000));

      for (const post of failedPosts) {
        // Check if it was already tagged (might have been retried)
        const current = usePostStore.getState().posts.find((p) => p.id === post.id);
        if (current?.aiAnalyzed) continue;

        try {
          const result = await analyzePost(post.url, post.caption, (msg, variant) => addToast(variant, msg));
          await bulkAddTags(post.id, result.tags);
          await updatePost(post.id, { aiAnalyzed: true });
          processed++;
          await new Promise((r) => setTimeout(r, 4000));
        } catch {
          // Second attempt failed — skip this post
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }

    setIsAutoTagging(false);
    const remaining = untaggedPosts.length - processed;
    if (processed > 0) {
      addToast('success', `Done! Analyzed ${processed} of ${untaggedPosts.length} posts${remaining > 0 ? `. ${remaining} couldn't be tagged — try again later.` : '!'}`);
    } else {
      addToast('error', 'All AI models are currently busy. Please try again in a minute, or add credits at openrouter.ai/credits for more reliable tagging.');
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
