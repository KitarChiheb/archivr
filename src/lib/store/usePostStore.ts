'use client';

import { create } from 'zustand';
import { SavedPost } from '@/lib/types';
import { nanoid } from 'nanoid';
import * as db from '@/lib/db/indexeddb';

// 📚 LEARN: Zustand is a lightweight state management library that replaces Redux for most modern apps.
// The pattern is: 1) Define state shape, 2) Define actions, 3) Use in components with selector hooks.
// We persist to IndexedDB on every mutation so data survives page refreshes.

interface PostStore {
  posts: SavedPost[];
  isLoading: boolean;
  isHydrated: boolean;

  // Lifecycle
  hydrate: () => Promise<void>;

  // Actions
  addPosts: (posts: Omit<SavedPost, 'id' | 'addedToArchivr'>[]) => Promise<void>;
  updatePost: (id: string, updates: Partial<SavedPost>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  moveToCollection: (postId: string, collectionId: string | null) => Promise<void>;
  addTag: (postId: string, tag: string) => Promise<void>;
  removeTag: (postId: string, tag: string) => Promise<void>;
  bulkAddTags: (postId: string, tags: string[]) => Promise<void>;
  clearAll: () => Promise<void>;
  setPosts: (posts: SavedPost[]) => Promise<void>;

  // Selectors (computed from state)
  getPostsByCollection: (collectionId: string | null) => SavedPost[];
  getPostsByTag: (tag: string) => SavedPost[];
  searchPosts: (query: string) => SavedPost[];
  getActivePosts: () => SavedPost[];
  getAllTags: () => Record<string, number>;
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  isLoading: false,
  isHydrated: false,

  // 📚 LEARN: "Hydration" loads persisted data from IndexedDB into Zustand on app start.
  // This bridges the gap between server rendering (no IndexedDB) and client state.
  hydrate: async () => {
    set({ isLoading: true });
    try {
      const posts = await db.getAllPosts();
      set({ posts, isHydrated: true, isLoading: false });
    } catch {
      set({ isHydrated: true, isLoading: false });
    }
  },

  addPosts: async (newPosts) => {
    const now = Math.floor(Date.now() / 1000);
    const postsWithIds: SavedPost[] = newPosts.map((p) => ({
      ...p,
      id: nanoid(),
      addedToArchivr: now,
    }));

    set((state) => ({ posts: [...state.posts, ...postsWithIds] }));
    await db.savePosts(postsWithIds);
  },

  updatePost: async (id, updates) => {
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    const updated = get().posts.find((p) => p.id === id);
    if (updated) await db.savePost(updated);
  },

  deletePost: async (id) => {
    // 📚 LEARN: Soft delete — we set isDeleted: true instead of removing from the array.
    // This prevents data loss and allows "undo" functionality.
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === id ? { ...p, isDeleted: true } : p
      ),
    }));
    const post = get().posts.find((p) => p.id === id);
    if (post) await db.savePost(post);
  },

  moveToCollection: async (postId, collectionId) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, collectionId } : p
      ),
    }));
    const post = get().posts.find((p) => p.id === postId);
    if (post) await db.savePost(post);
  },

  addTag: async (postId, tag) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId && !p.tags.includes(normalizedTag)
          ? { ...p, tags: [...p.tags, normalizedTag] }
          : p
      ),
    }));
    const post = get().posts.find((p) => p.id === postId);
    if (post) await db.savePost(post);
  },

  removeTag: async (postId, tag) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, tags: p.tags.filter((t) => t !== tag) } : p
      ),
    }));
    const post = get().posts.find((p) => p.id === postId);
    if (post) await db.savePost(post);
  },

  bulkAddTags: async (postId, tags) => {
    const normalizedTags = tags.map((t) => t.toLowerCase().trim().replace(/\s+/g, '-'));
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id !== postId) return p;
        const newTags = normalizedTags.filter((t) => !p.tags.includes(t));
        return { ...p, tags: [...p.tags, ...newTags] };
      }),
    }));
    const post = get().posts.find((p) => p.id === postId);
    if (post) await db.savePost(post);
  },

  clearAll: async () => {
    set({ posts: [] });
    await db.clearPosts();
  },

  setPosts: async (posts) => {
    set({ posts });
    await db.savePosts(posts);
  },

  // ─── Selectors ────────────────────────────────────────────────────

  getActivePosts: () => {
    return get().posts.filter((p) => !p.isDeleted);
  },

  getPostsByCollection: (collectionId) => {
    return get()
      .posts.filter((p) => !p.isDeleted && p.collectionId === collectionId);
  },

  getPostsByTag: (tag) => {
    return get()
      .posts.filter((p) => !p.isDeleted && p.tags.includes(tag));
  },

  searchPosts: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return get().getActivePosts();

    return get().posts.filter((p) => {
      if (p.isDeleted) return false;
      const matchCaption = p.caption?.toLowerCase().includes(q);
      const matchUrl = p.url.toLowerCase().includes(q);
      const matchTags = p.tags.some((t) => t.includes(q));
      const matchNotes = p.userNotes?.toLowerCase().includes(q);
      return matchCaption || matchUrl || matchTags || matchNotes;
    });
  },

  getAllTags: () => {
    const tagCounts: Record<string, number> = {};
    for (const post of get().posts) {
      if (post.isDeleted) continue;
      for (const tag of post.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
    return tagCounts;
  },
}));
