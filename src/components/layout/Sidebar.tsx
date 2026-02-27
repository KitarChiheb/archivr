'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Plus, Sparkles, Settings, Hash, FolderOpen, Import, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePostStore } from '@/lib/store/usePostStore';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { getTagColor } from '@/lib/utils/colors';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { hasApiKey } from '@/lib/ai/openrouter';

// 📚 LEARN: The sidebar is persistent across dashboard routes via the dashboard layout.
// It uses Zustand selectors to reactively show post counts and tag clouds.

interface SidebarProps {
  onAIAutoTag?: () => void;
  isAutoTagging?: boolean;
}

export default function Sidebar({ onAIAutoTag, isAutoTagging }: SidebarProps) {
  const pathname = usePathname();
  const allPosts = usePostStore((s) => s.posts);
  const posts = useMemo(() => allPosts.filter((p) => !p.isDeleted), [allPosts]);
  const collections = useCollectionStore((s) => s.collections);
  const addCollection = useCollectionStore((s) => s.addCollection);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const post of posts) {
      for (const tag of post.tags) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return counts;
  }, [posts]);
  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  const handleCreateCollection = async () => {
    if (!newName.trim()) return;
    await addCollection(newName.trim());
    setNewName('');
    setIsCreating(false);
  };

  const getCollectionPostCount = (colId: string) => {
    return posts.filter((p) => p.collectionId === colId).length;
  };

  const uncollectedCount = posts.filter((p) => p.collectionId === null).length;

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col border-r border-border bg-bg-surface overflow-y-auto hidden lg:flex">
      {/* Logo */}
      <div className="p-4 pb-2">
        <Link href="/" className="flex items-center gap-2">
          <span className="gradient-text text-xl font-bold">Archivrr</span>
        </Link>
      </div>

      {/* All Posts */}
      <nav className="flex-1 px-2 py-2">
        <Link
          href="/dashboard"
          className={`
            flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200
            ${
              pathname === '/dashboard'
                ? 'bg-accent-purple/10 text-text-primary border-l-[3px] border-accent-purple'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
            }
          `}
        >
          <Bookmark size={16} />
          <span className="flex-1">All Posts</span>
          <span className="text-xs text-text-secondary bg-bg-surface-hover px-2 py-0.5 rounded-full">
            {posts.length}
          </span>
        </Link>

        {/* Uncollected */}
        {uncollectedCount > 0 && (
          <Link
            href="/dashboard?filter=uncollected"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-all duration-200 mt-1"
          >
            <FolderOpen size={16} />
            <span className="flex-1">Uncollected</span>
            <span className="text-xs text-text-secondary bg-bg-surface-hover px-2 py-0.5 rounded-full">
              {uncollectedCount}
            </span>
          </Link>
        )}

        {/* Collections */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-caption uppercase text-text-secondary tracking-wider">Collections</span>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
              aria-label="Create new collection"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* New collection inline input */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-2 mb-1"
              >
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCollection();
                    if (e.key === 'Escape') {
                      setIsCreating(false);
                      setNewName('');
                    }
                  }}
                  onBlur={() => {
                    if (newName.trim()) handleCreateCollection();
                    else setIsCreating(false);
                  }}
                  placeholder="Collection name..."
                  className="w-full px-3 py-1.5 rounded-lg bg-bg text-text-primary text-sm border border-accent-purple/50 focus:outline-none focus:ring-1 focus:ring-accent-purple/50 placeholder:text-text-secondary/40"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collection list */}
          <div className="space-y-0.5">
            {collections
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((col) => {
                const isActive = pathname === `/dashboard/${col.id}`;
                return (
                  <Link
                    key={col.id}
                    href={`/dashboard/${col.id}`}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200
                      ${
                        isActive
                          ? 'bg-accent-purple/10 text-text-primary border-l-[3px]'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
                      }
                    `}
                    style={isActive ? { borderLeftColor: col.color } : undefined}
                  >
                    <span>{col.emoji}</span>
                    <span className="flex-1 truncate">{col.name}</span>
                    <span className="text-xs text-text-secondary bg-bg-surface-hover px-2 py-0.5 rounded-full">
                      {getCollectionPostCount(col.id)}
                    </span>
                  </Link>
                );
              })}
          </div>
        </div>

        {/* Separator */}
        <div className="my-4 mx-3 border-t border-border" />

        {/* Tag cloud */}
        {sortedTags.length > 0 && (
          <div className="px-3">
            <span className="text-caption uppercase text-text-secondary tracking-wider flex items-center gap-1.5 mb-2">
              <Hash size={12} />
              Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sortedTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium cursor-default"
                  style={{
                    backgroundColor: `${getTagColor(tag)}15`,
                    color: getTagColor(tag),
                    border: `1px solid ${getTagColor(tag)}25`,
                  }}
                >
                  {tag}
                  <span className="opacity-60">{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="relative group">
          <button
            onClick={onAIAutoTag}
            disabled={isAutoTagging || !hasApiKey()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium gradient-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={14} className={isAutoTagging ? 'animate-spin' : ''} />
            {isAutoTagging ? 'Auto-tagging...' : 'AI Auto-Tag All'}
          </button>
          {!hasApiKey() && (
            <div className="absolute bottom-full left-0 right-0 mb-1 p-2 rounded-lg bg-bg text-text-secondary text-[10px] border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center">
              Add your OpenRouter API key in Settings to enable AI
            </div>
          )}
        </div>
        <div className="space-y-1">
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-all duration-200"
          >
            <Home size={14} />
            Home
          </Link>
          <Link
            href="/import"
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-all duration-200"
          >
            <Import size={14} />
            Import More
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-all duration-200"
            >
              <Settings size={14} />
              Settings
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
