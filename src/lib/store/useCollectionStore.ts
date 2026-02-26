'use client';

import { create } from 'zustand';
import { Collection } from '@/lib/types';
import { nanoid } from 'nanoid';
import { getCollectionColor } from '@/lib/utils/colors';
import * as db from '@/lib/db/indexeddb';

// 📚 LEARN: Separate stores for separate concerns. Posts and Collections
// are different entities with different CRUD operations. Keeping them in
// separate Zustand stores follows the Single Responsibility Principle.

interface CollectionStore {
  collections: Collection[];
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  addCollection: (name: string, emoji?: string) => Promise<Collection>;
  updateCollection: (id: string, updates: Partial<Collection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  reorderCollections: (collections: Collection[]) => Promise<void>;
  clearAll: () => Promise<void>;
  setCollections: (collections: Collection[]) => Promise<void>;
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  collections: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const collections = await db.getAllCollections();
      set({ collections, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  addCollection: async (name, emoji = '📁') => {
    const newCollection: Collection = {
      id: nanoid(),
      name,
      emoji,
      color: getCollectionColor(get().collections.length),
      createdAt: Math.floor(Date.now() / 1000),
      sortOrder: get().collections.length,
    };

    set((state) => ({
      collections: [...state.collections, newCollection],
    }));
    await db.saveCollection(newCollection);
    return newCollection;
  },

  updateCollection: async (id, updates) => {
    set((state) => ({
      collections: state.collections.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    const updated = get().collections.find((c) => c.id === id);
    if (updated) await db.saveCollection(updated);
  },

  deleteCollection: async (id) => {
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id),
    }));
    await db.deleteCollection(id);
  },

  reorderCollections: async (collections) => {
    const reordered = collections.map((c, i) => ({ ...c, sortOrder: i }));
    set({ collections: reordered });
    await db.saveCollections(reordered);
  },

  clearAll: async () => {
    set({ collections: [] });
    await db.clearCollections();
  },

  setCollections: async (collections) => {
    set({ collections });
    await db.saveCollections(collections);
  },
}));
