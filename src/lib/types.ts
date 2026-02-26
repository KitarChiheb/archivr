// 📚 LEARN: Centralizing all TypeScript interfaces in one file creates a "single source of truth"
// for your data shapes. Every component, store, and utility imports from here.
// This prevents type drift (where different parts of the app disagree on what data looks like).

// ─── Core Data Models ────────────────────────────────────────────────

export interface SavedPost {
  id: string;                    // nanoid() — short unique ID
  url: string;                   // Instagram post URL
  thumbnailUrl?: string;         // Placeholder image URL (picsum for demo)
  caption?: string;              // User-added or AI-extracted caption
  tags: string[];                // e.g. ["food", "aesthetic", "dark-moody"]
  collectionId: string | null;   // null = uncollected
  savedAt: number;               // Unix timestamp from Instagram export
  addedToArchivr: number;        // Unix timestamp when added to this app
  aiAnalyzed: boolean;           // Has AI processed this post?
  userNotes?: string;            // Personal notes field
  isDeleted?: boolean;           // Soft delete — never hard delete user data
}

export interface Collection {
  id: string;
  name: string;
  emoji: string;                 // Visual identifier (e.g. "🍕")
  color: string;                 // Accent color hex
  createdAt: number;
  sortOrder: number;
  description?: string;
}

export interface Tag {
  name: string;                  // Normalized: lowercase, hyphenated
  count: number;                 // Number of posts using this tag
  color: string;                 // Deterministic color from tag name hash
}

// ─── AI Types ────────────────────────────────────────────────────────

export interface AIAnalysisResult {
  tags: string[];
  suggestedCollection?: string;
  mood?: string;
  dominantColors?: string[];
  confidence: number;
}

// 📚 LEARN: Discriminated unions let TypeScript narrow types in switch/if statements.
// Each error type has a unique `type` field, so TS knows exactly which properties exist.
export type AppError =
  | { type: 'PARSE_ERROR'; message: string; detail: string }
  | { type: 'AI_ERROR'; message: string; retryable: boolean }
  | { type: 'STORAGE_ERROR'; message: string }
  | { type: 'NETWORK_ERROR'; message: string };

// ─── Toast System ────────────────────────────────────────────────────

export type ToastVariant = 'error' | 'success' | 'info' | 'ai';

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number; // ms, default 4000
}

// ─── UI State Types ──────────────────────────────────────────────────

export type ViewMode = 'grid' | 'list' | 'masonry';

export type SortOption = 'savedAt' | 'addedToArchivr' | 'caption';

export type SortDirection = 'asc' | 'desc';

// ─── Import Types ────────────────────────────────────────────────────

export type ImportMethod = 'json' | 'url' | 'demo';

export interface ParsedPost {
  url: string;
  savedAt: number;
  caption?: string;
}

// ─── AI API Types ────────────────────────────────────────────────────

export interface AIRequestBody {
  prompt: string;
  model: string;
  postUrl?: string;
}

export interface AIResponseBody {
  result: AIAnalysisResult;
}

export interface AIErrorResponse {
  error: string;
  retryable: boolean;
}
