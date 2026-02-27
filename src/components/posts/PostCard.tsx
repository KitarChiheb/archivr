'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FolderInput, Tag, Sparkles, ExternalLink, Trash2, Instagram } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { SavedPost, Collection } from '@/lib/types';
import { formatRelativeTime } from '@/lib/utils/dates';
import { getTagColor } from '@/lib/utils/colors';

// 📚 LEARN: PostCard is the main visual element in the grid.
// It uses Next.js Image for lazy loading + optimization, and
// Framer Motion for hover/enter animations. All actions are
// revealed on hover via an overlay — keeping the default view clean.

interface PostCardProps {
  post: SavedPost;
  collection?: Collection | null;
  onMoveToCollection: (postId: string) => void;
  onEditTags: (postId: string) => void;
  onAIAnalyze: (postId: string) => void;
  onDelete: (postId: string) => void;
}

export default function PostCard({
  post,
  collection,
  onMoveToCollection,
  onEditTags,
  onAIAnalyze,
  onDelete,
}: PostCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-card overflow-hidden group cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-square bg-bg-surface-hover">
        {/* Skeleton loading */}
        {!imageLoaded && post.thumbnailUrl && (
          <div className="absolute inset-0 skeleton" />
        )}

        {/* Thumbnail */}
        {post.thumbnailUrl ? (
          <Image
            src={post.thumbnailUrl}
            alt={post.caption || 'Instagram post'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-all duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-surface-hover gap-2">
            <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center">
              <Instagram size={24} className="text-accent-purple" />
            </div>
            <span className="text-text-secondary text-[10px] px-3 text-center truncate max-w-full">
              {post.url.replace(/https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '') || 'Instagram Post'}
            </span>
          </div>
        )}

        {/* Hover overlay with actions */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-2 pointer-events-none"
          style={{ pointerEvents: isHovered ? 'auto' : 'none' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); onMoveToCollection(post.id); }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Move to collection"
            title="Move to collection"
          >
            <FolderInput size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEditTags(post.id); }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Edit tags"
            title="Edit tags"
          >
            <Tag size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onAIAnalyze(post.id); }}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="AI analyze"
            title="AI analyze"
          >
            <Sparkles size={16} />
          </button>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Open on Instagram"
            title="Open on Instagram"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
            className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 transition-colors"
            aria-label="Delete post"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </motion.div>

        {/* AI badge */}
        {post.aiAnalyzed && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-medium flex items-center gap-1">
            <Sparkles size={8} />
            AI
          </div>
        )}
      </div>

      {/* Content below image */}
      <div className="p-3">
        {/* Collection breadcrumb */}
        {collection && (
          <div className="text-[10px] font-medium text-text-secondary mb-1 flex items-center gap-1">
            <span>{collection.emoji}</span>
            <span>{collection.name}</span>
          </div>
        )}

        {/* Caption */}
        {(post.caption || !post.thumbnailUrl) && (
          <p className="text-xs text-text-primary line-clamp-2 mb-2 leading-relaxed">
            {post.caption || post.url.replace(/https?:\/\/(www\.)?instagram\.com/, '').replace(/\/$/, '')}
          </p>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} label={tag} color={getTagColor(tag)} size="sm" />
            ))}
            {post.tags.length > 4 && (
              <span className="text-[10px] text-text-secondary px-1.5 py-0.5">
                +{post.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Saved date */}
        <p className="text-[10px] text-text-secondary">
          Saved {formatRelativeTime(post.savedAt)}
        </p>
      </div>
    </motion.div>
  );
}
