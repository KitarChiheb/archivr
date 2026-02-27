'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, SlidersHorizontal, ChevronDown, Inbox } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import PostCard from '@/components/posts/PostCard';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { usePostStore } from '@/lib/store/usePostStore';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { useToastStore } from '@/lib/store/useToastStore';
import { analyzePost, hasApiKey } from '@/lib/ai/openrouter';
import { getTagColor } from '@/lib/utils/colors';
import { SavedPost, ViewMode, SortOption } from '@/lib/types';
import Link from 'next/link';

// 📚 LEARN: The main dashboard page displays all posts with filtering, sorting, and search.
// We use useMemo for expensive computations (filtering/sorting) and useCallback for handlers
// to prevent unnecessary re-renders in a list of potentially hundreds of cards.

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const allPosts = usePostStore((s) => s.posts);
  const posts = useMemo(() => allPosts.filter((p) => !p.isDeleted), [allPosts]);
  const updatePost = usePostStore((s) => s.updatePost);
  const deletePost = usePostStore((s) => s.deletePost);
  const moveToCollection = usePostStore((s) => s.moveToCollection);
  const addTag = usePostStore((s) => s.addTag);
  const removeTag = usePostStore((s) => s.removeTag);
  const bulkAddTags = usePostStore((s) => s.bulkAddTags);
  const collections = useCollectionStore((s) => s.collections);
  const addToast = useToastStore((s) => s.addToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('savedAt');
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Modal states
  const [moveModalPostId, setMoveModalPostId] = useState<string | null>(null);
  const [tagModalPostId, setTagModalPostId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [analyzingPostId, setAnalyzingPostId] = useState<string | null>(null);

  // 📚 LEARN: useMemo caches the filtered + sorted result. It only recomputes when
  // its dependencies change, saving expensive re-computation on every render.
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Filter by uncollected
    if (filterParam === 'uncollected') {
      result = result.filter((p) => p.collectionId === null);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const matchCaption = p.caption?.toLowerCase().includes(q);
        const matchUrl = p.url.toLowerCase().includes(q);
        const matchTags = p.tags.some((t) => t.includes(q));
        const matchNotes = p.userNotes?.toLowerCase().includes(q);
        return matchCaption || matchUrl || matchTags || matchNotes;
      });
    }

    // Tag filter
    if (selectedTagFilters.length > 0) {
      result = result.filter((p) =>
        selectedTagFilters.every((tag) => p.tags.includes(tag))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'savedAt') return b.savedAt - a.savedAt;
      if (sortBy === 'addedToArchivr') return b.addedToArchivr - a.addedToArchivr;
      if (sortBy === 'caption') return (a.caption || '').localeCompare(b.caption || '');
      return 0;
    });

    return result;
  }, [posts, searchQuery, sortBy, selectedTagFilters, filterParam]);

  const allTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    posts.forEach((p) => p.tags.forEach((t) => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    return Object.entries(tagCounts).sort(([, a], [, b]) => b - a);
  }, [posts]);

  const handleAIAnalyze = useCallback(async (postId: string) => {
    if (!hasApiKey()) {
      addToast('error', 'Please add your OpenRouter API key in Settings first.');
      return;
    }
    const post = usePostStore.getState().posts.find((p) => p.id === postId);
    if (!post) return;

    setAnalyzingPostId(postId);
    addToast('ai', 'Archivrr AI is analyzing...');

    try {
      const result = await analyzePost(post.url, post.caption, (msg, variant) => addToast(variant, msg));
      await bulkAddTags(postId, result.tags);
      await updatePost(postId, { aiAnalyzed: true });
      addToast('success', `Added ${result.tags.length} tags!`);
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'NO_API_KEY') {
        addToast('error', 'Please add your OpenRouter API key in Settings to use AI features.');
      } else if (code === 'INVALID_KEY') {
        addToast('error', 'Your API key is invalid. Please check it in Settings.');
      } else if (code === 'NO_CREDITS') {
        addToast('error', 'No credits on your OpenRouter account. Add $1-5 at openrouter.ai/credits for premium AI.');
      } else if (code === 'ALL_MODELS_FAILED') {
        addToast('error', 'All AI models are currently unavailable. Try again later or add credits to your OpenRouter account.');
      } else {
        addToast('error', 'AI analysis failed. Check your API key in Settings.');
      }
    } finally {
      setAnalyzingPostId(null);
    }
  }, [bulkAddTags, updatePost, addToast]);

  const handleDelete = useCallback((postId: string) => {
    deletePost(postId);
    addToast('success', 'Post deleted');
  }, [deletePost, addToast]);

  const handleMoveToCollection = useCallback((postId: string, collectionId: string | null) => {
    moveToCollection(postId, collectionId);
    setMoveModalPostId(null);
    const colName = collectionId
      ? collections.find((c) => c.id === collectionId)?.name || 'collection'
      : 'Uncollected';
    addToast('success', `Moved to ${colName}`);
  }, [moveToCollection, collections, addToast]);

  const handleAddTag = useCallback(() => {
    if (!tagModalPostId || !newTagInput.trim()) return;
    addTag(tagModalPostId, newTagInput.trim());
    setNewTagInput('');
  }, [tagModalPostId, newTagInput, addTag]);

  const getCollectionForPost = (post: SavedPost) => {
    if (!post.collectionId) return null;
    return collections.find((c) => c.id === post.collectionId) || null;
  };

  const tagModalPost = tagModalPostId ? posts.find((p) => p.id === tagModalPostId) : null;

  const gridColsClass = viewMode === 'list'
    ? 'flex flex-col gap-2'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-6 opacity-60">
            <Inbox size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">No posts yet</h2>
          <p className="text-text-secondary text-sm mb-6">
            Import your Instagram saved posts to get started. You can upload a JSON export, paste URLs, or try demo data.
          </p>
          <Link
            href="/import"
            className="inline-flex items-center gap-2 px-6 py-3 gradient-accent text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Import Posts
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts by caption, tag, or URL..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-surface border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50 transition-all"
            aria-label="Search posts"
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-surface border border-border">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-bg-surface border border-border text-text-secondary text-sm hover:text-text-primary transition-colors"
          >
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Sort</span>
            <ChevronDown size={14} />
          </button>
          <AnimatePresence>
            {showSortDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute right-0 top-full mt-1 w-48 glass-card p-1 z-20"
              >
                {([
                  ['savedAt', 'Date Saved'],
                  ['addedToArchivr', 'Date Added'],
                  ['caption', 'Title'],
                ] as [SortOption, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setSortBy(key); setShowSortDropdown(false); }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      sortBy === key ? 'bg-accent-purple/10 text-text-primary' : 'text-text-secondary hover:bg-bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {allTags.slice(0, 12).map(([tag]) => {
            const isSelected = selectedTagFilters.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => {
                  setSelectedTagFilters((prev) =>
                    isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                  );
                }}
                className={`
                  px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200
                  ${isSelected
                    ? 'border-accent-purple/50 bg-accent-purple/20 text-accent-purple'
                    : 'border-border bg-bg-surface text-text-secondary hover:text-text-primary hover:border-border/80'
                  }
                `}
              >
                {tag}
              </button>
            );
          })}
          {selectedTagFilters.length > 0 && (
            <button
              onClick={() => setSelectedTagFilters([])}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-text-secondary text-xs mb-4">
        {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
        {searchQuery && ` matching "${searchQuery}"`}
        {filterParam === 'uncollected' && ' (uncollected)'}
      </p>

      {/* Post grid */}
      <div className={gridColsClass}>
        <AnimatePresence>
          {filteredPosts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
            >
              <div className="relative">
                <PostCard
                  post={post}
                  collection={getCollectionForPost(post)}
                  onMoveToCollection={(id) => setMoveModalPostId(id)}
                  onEditTags={(id) => setTagModalPostId(id)}
                  onAIAnalyze={handleAIAnalyze}
                  onDelete={handleDelete}
                />
                {analyzingPostId === post.id && (
                  <div className="absolute inset-0 rounded-glass bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex items-center gap-2 text-purple-300 text-sm">
                      <div className="w-4 h-4 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredPosts.length === 0 && posts.length > 0 && (
        <div className="text-center py-20">
          <p className="text-text-secondary text-sm">No posts match your filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTagFilters([]); }}
            className="text-accent-purple text-sm mt-2 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Move to Collection Modal */}
      <Modal
        isOpen={!!moveModalPostId}
        onClose={() => setMoveModalPostId(null)}
        title="Move to Collection"
      >
        <div className="space-y-1">
          <button
            onClick={() => handleMoveToCollection(moveModalPostId!, null)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
          >
            <span>📂</span>
            <span>Uncollected</span>
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => handleMoveToCollection(moveModalPostId!, col.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
            >
              <span>{col.emoji}</span>
              <span>{col.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Edit Tags Modal */}
      <Modal
        isOpen={!!tagModalPostId}
        onClose={() => { setTagModalPostId(null); setNewTagInput(''); }}
        title="Edit Tags"
      >
        {tagModalPost && (
          <div>
            <div className="flex flex-wrap gap-1.5 mb-4 min-h-[32px]">
              {tagModalPost.tags.length === 0 && (
                <p className="text-text-secondary text-sm">No tags yet</p>
              )}
              {tagModalPost.tags.map((tag) => (
                <Badge
                  key={tag}
                  label={tag}
                  color={getTagColor(tag)}
                  onRemove={() => removeTag(tagModalPostId!, tag)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag();
                  }}
                  placeholder="Add a tag..."
                />
              </div>
              <Button onClick={handleAddTag} disabled={!newTagInput.trim()}>
                Add
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
