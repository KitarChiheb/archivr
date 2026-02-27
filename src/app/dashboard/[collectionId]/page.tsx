'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { ViewMode } from '@/lib/types';

// 📚 LEARN: Dynamic route segments in Next.js App Router use folder names with [brackets].
// The `useParams()` hook extracts the segment value at runtime.

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.collectionId as string;

  const allPosts = usePostStore((s) => s.posts);
  const posts = useMemo(() => allPosts.filter((p) => !p.isDeleted), [allPosts]);
  const updatePost = usePostStore((s) => s.updatePost);
  const deletePost = usePostStore((s) => s.deletePost);
  const moveToCollection = usePostStore((s) => s.moveToCollection);
  const addTag = usePostStore((s) => s.addTag);
  const removeTag = usePostStore((s) => s.removeTag);
  const bulkAddTags = usePostStore((s) => s.bulkAddTags);
  const collections = useCollectionStore((s) => s.collections);
  const updateCollection = useCollectionStore((s) => s.updateCollection);
  const deleteCollection = useCollectionStore((s) => s.deleteCollection);
  const addToast = useToastStore((s) => s.addToast);

  const collection = collections.find((c) => c.id === collectionId);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [moveModalPostId, setMoveModalPostId] = useState<string | null>(null);
  const [tagModalPostId, setTagModalPostId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [analyzingPostId, setAnalyzingPostId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const collectionPosts = useMemo(() => {
    let result = posts.filter((p) => p.collectionId === collectionId);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const matchCaption = p.caption?.toLowerCase().includes(q);
        const matchTags = p.tags.some((t) => t.includes(q));
        return matchCaption || matchTags;
      });
    }

    return result.sort((a, b) => b.savedAt - a.savedAt);
  }, [posts, collectionId, searchQuery]);

  const handleAIAnalyze = useCallback(async (postId: string) => {
    if (!hasApiKey()) {
      addToast('error', 'Please add your OpenRouter API key in Settings first.');
      return;
    }
    const post = usePostStore.getState().posts.find((p) => p.id === postId);
    if (!post) return;
    setAnalyzingPostId(postId);
    addToast('ai', 'Archivr AI is analyzing...');
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
        addToast('error', 'No credits on your OpenRouter account. Add $1-5 at openrouter.ai/credits.');
      } else if (code === 'ALL_MODELS_FAILED') {
        addToast('error', 'All AI models are rate-limited. Try again later or add credits.');
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

  const handleMoveToCollection = useCallback((postId: string, colId: string | null) => {
    moveToCollection(postId, colId);
    setMoveModalPostId(null);
    addToast('success', 'Post moved');
  }, [moveToCollection, addToast]);

  const handleAddTag = useCallback(() => {
    if (!tagModalPostId || !newTagInput.trim()) return;
    addTag(tagModalPostId, newTagInput.trim());
    setNewTagInput('');
  }, [tagModalPostId, newTagInput, addTag]);

  const handleDeleteCollection = useCallback(async () => {
    // Move all posts to uncollected first
    for (const post of collectionPosts) {
      await moveToCollection(post.id, null);
    }
    await deleteCollection(collectionId);
    addToast('success', 'Collection deleted');
    router.push('/dashboard');
  }, [collectionPosts, moveToCollection, deleteCollection, collectionId, addToast, router]);

  const handleRename = useCallback(async () => {
    if (!editName.trim()) return;
    await updateCollection(collectionId, { name: editName.trim() });
    setIsEditing(false);
    addToast('success', 'Collection renamed');
  }, [editName, collectionId, updateCollection, addToast]);

  const tagModalPost = tagModalPostId ? posts.find((p) => p.id === tagModalPostId) ?? null : null;

  if (!collection) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <p className="text-text-secondary mb-4">Collection not found</p>
          <Link href="/dashboard" className="text-accent-purple hover:underline text-sm">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
          aria-label="Back to all posts"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                className="text-xl font-semibold bg-transparent border-b-2 border-accent-purple text-text-primary outline-none"
              />
              <Button size="sm" onClick={handleRename}>Save</Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl">{collection.emoji}</span>
              <h1 className="text-xl font-semibold text-text-primary">{collection.name}</h1>
              <span className="text-text-secondary text-sm">({collectionPosts.length})</span>
              <button
                onClick={() => { setIsEditing(true); setEditName(collection.name); }}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors ml-1"
                aria-label="Edit collection name"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="Delete collection"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
          {collection.description && (
            <p className="text-text-secondary text-sm mt-1">{collection.description}</p>
          )}
        </div>
      </div>

      {/* Search + View toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in this collection..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-surface border border-border text-text-primary text-sm placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent-purple/50 transition-all"
            aria-label="Search in collection"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-bg-surface border border-border">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-secondary'}`}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-bg-surface-hover text-text-primary' : 'text-text-secondary'}`}
            aria-label="List view"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      {collectionPosts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-secondary text-sm">No posts in this collection yet.</p>
          <p className="text-text-secondary text-xs mt-1">Move posts here from the main dashboard.</p>
        </div>
      ) : (
        <div className={viewMode === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'}>
          <AnimatePresence>
            {collectionPosts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.5) }}
              >
                <div className="relative">
                  <PostCard
                    post={post}
                    collection={collection}
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
      )}

      {/* Move Modal */}
      <Modal isOpen={!!moveModalPostId} onClose={() => setMoveModalPostId(null)} title="Move to Collection">
        <div className="space-y-1">
          <button
            onClick={() => handleMoveToCollection(moveModalPostId!, null)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
          >
            <span>📂</span><span>Uncollected</span>
          </button>
          {collections.map((col) => (
            <button
              key={col.id}
              onClick={() => handleMoveToCollection(moveModalPostId!, col.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
            >
              <span>{col.emoji}</span><span>{col.name}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Tag Modal */}
      <Modal isOpen={!!tagModalPostId} onClose={() => { setTagModalPostId(null); setNewTagInput(''); }} title="Edit Tags">
        {tagModalPost && (
          <div>
            <div className="flex flex-wrap gap-1.5 mb-4 min-h-[32px]">
              {tagModalPost.tags.length === 0 && <p className="text-text-secondary text-sm">No tags yet</p>}
              {tagModalPost.tags.map((tag) => (
                <Badge key={tag} label={tag} color={getTagColor(tag)} onRemove={() => removeTag(tagModalPostId!, tag)} />
              ))}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag(); }}
                  placeholder="Add a tag..."
                />
              </div>
              <Button onClick={handleAddTag} disabled={!newTagInput.trim()}>Add</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Collection?" size="sm">
        <p className="text-text-secondary text-sm mb-4">
          This will delete &quot;{collection.name}&quot; and move all {collectionPosts.length} posts to Uncollected. This cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteCollection}>Delete Collection</Button>
        </div>
      </Modal>
    </div>
  );
}
