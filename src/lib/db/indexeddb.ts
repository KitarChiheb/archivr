import { openDB, IDBPDatabase } from 'idb';
import { SavedPost, Collection } from '@/lib/types';

// 📚 LEARN: IndexedDB is a browser-native database that persists data across sessions.
// Unlike localStorage (which only stores strings and has a ~5MB limit), IndexedDB can store
// structured data and handle much larger datasets. The `idb` library wraps IndexedDB's
// callback-based API with Promises, making it much easier to work with.
// We use the untyped openDB overload here to avoid version-specific DBSchema compat issues.

const DB_NAME = 'archivr-db';
const DB_VERSION = 1;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbInstance: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 📚 LEARN: The upgrade callback runs when the DB is first created or version changes.
      // This is where you define your "schema" — object stores and indexes.
      if (!db.objectStoreNames.contains('posts')) {
        const postStore = db.createObjectStore('posts', { keyPath: 'id' });
        postStore.createIndex('by-collection', 'collectionId');
        postStore.createIndex('by-savedAt', 'savedAt');
      }
      if (!db.objectStoreNames.contains('collections')) {
        const collectionStore = db.createObjectStore('collections', { keyPath: 'id' });
        collectionStore.createIndex('by-sortOrder', 'sortOrder');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }
    },
  });

  return dbInstance;
}

// ─── Posts ────────────────────────────────────────────────────────────

export async function getAllPosts(): Promise<SavedPost[]> {
  const db = await getDB();
  return db.getAll('posts');
}

export async function savePosts(posts: SavedPost[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('posts', 'readwrite');
  await Promise.all([
    ...posts.map((post) => tx.store.put(post)),
    tx.done,
  ]);
}

export async function savePost(post: SavedPost): Promise<void> {
  const db = await getDB();
  await db.put('posts', post);
}

export async function deletePost(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('posts', id);
}

export async function clearPosts(): Promise<void> {
  const db = await getDB();
  await db.clear('posts');
}

// ─── Collections ─────────────────────────────────────────────────────

export async function getAllCollections(): Promise<Collection[]> {
  const db = await getDB();
  return db.getAll('collections');
}

export async function saveCollections(collections: Collection[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('collections', 'readwrite');
  await Promise.all([
    ...collections.map((col) => tx.store.put(col)),
    tx.done,
  ]);
}

export async function saveCollection(collection: Collection): Promise<void> {
  const db = await getDB();
  await db.put('collections', collection);
}

export async function deleteCollection(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('collections', id);
}

export async function clearCollections(): Promise<void> {
  const db = await getDB();
  await db.clear('collections');
}

// ─── Settings ────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | undefined> {
  const db = await getDB();
  return db.get('settings', key);
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const db = await getDB();
  await db.put('settings', value, key);
}

// ─── Bulk Operations ─────────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear('posts'),
    db.clear('collections'),
    db.clear('settings'),
  ]);
}

export async function exportAllData(): Promise<{
  posts: SavedPost[];
  collections: Collection[];
}> {
  const [posts, collections] = await Promise.all([
    getAllPosts(),
    getAllCollections(),
  ]);
  return { posts, collections };
}
