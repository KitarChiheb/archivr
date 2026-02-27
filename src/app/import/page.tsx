'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link as LinkIcon, Play, FileJson, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import Button from '@/components/ui/Button';
import ToastContainer from '@/components/ui/Toast';
import { usePostStore } from '@/lib/store/usePostStore';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { useToastStore } from '@/lib/store/useToastStore';
import { parseInstagramExport, parseUrlList, isValidInstagramUrl } from '@/lib/instagram/parser';
import { DEMO_POSTS, DEMO_COLLECTIONS } from '@/lib/utils/demo-data';
import { SavedPost, ImportMethod } from '@/lib/types';
import TopNav from '@/components/layout/TopNav';

// 📚 LEARN: The import page is a critical onboarding step. Three import methods
// ensure every user can get started regardless of their technical comfort level.

const tabs: { id: ImportMethod; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'json',
    label: 'Instagram Export',
    icon: <FileJson size={20} />,
    description: 'Upload your Instagram data export JSON file',
  },
  {
    id: 'url',
    label: 'Paste URLs',
    icon: <LinkIcon size={20} />,
    description: 'Paste Instagram post URLs, one per line',
  },
  {
    id: 'demo',
    label: 'Demo Mode',
    icon: <Play size={20} />,
    description: 'Load 30 sample posts to explore the app',
  },
];

export default function ImportPage() {
  const router = useRouter();
  const addPosts = usePostStore((s) => s.addPosts);
  const setCollections = useCollectionStore((s) => s.setCollections);
  const addToast = useToastStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<ImportMethod>('json');
  const [isDragging, setIsDragging] = useState(false);
  const [urlText, setUrlText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImportSuccess = useCallback(
    (count: number) => {
      setImportResult({ count });
      addToast('success', `Successfully imported ${count} posts!`);

      // 📚 LEARN: canvas-confetti creates a celebration moment on success.
      // Small delightful touches like this improve perceived quality.
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#833AB4', '#FD1D1D', '#F77737'],
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    },
    [addToast, router]
  );

  const handleJsonImport = useCallback(
    async (file: File) => {
      setIsImporting(true);
      setError(null);
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        const parsed = parseInstagramExport(json);

        const postsToAdd: Omit<SavedPost, 'id' | 'addedToArchivr'>[] = parsed.map((p) => ({
          url: p.url,
          savedAt: p.savedAt,
          caption: p.caption,
          tags: [],
          collectionId: null,
          aiAnalyzed: false,
        }));

        await addPosts(postsToAdd);
        handleImportSuccess(postsToAdd.length);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to parse file';
        setError(message);
        addToast('error', 'Import failed: ' + message);
      } finally {
        setIsImporting(false);
      }
    },
    [addPosts, addToast, handleImportSuccess]
  );

  const handleUrlImport = useCallback(async () => {
    setIsImporting(true);
    setError(null);
    try {
      const parsed = parseUrlList(urlText);
      if (parsed.length === 0) {
        throw new Error('No valid Instagram URLs found. Please paste URLs like https://www.instagram.com/p/ABC123/');
      }

      const postsToAdd: Omit<SavedPost, 'id' | 'addedToArchivr'>[] = parsed.map((p) => ({
        url: p.url,
        savedAt: p.savedAt,
        tags: [],
        collectionId: null,
        aiAnalyzed: false,
      }));

      await addPosts(postsToAdd);
      handleImportSuccess(postsToAdd.length);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse URLs';
      setError(message);
      addToast('error', message);
    } finally {
      setIsImporting(false);
    }
  }, [urlText, addPosts, addToast, handleImportSuccess]);

  const handleDemoImport = useCallback(async () => {
    setIsImporting(true);
    setError(null);
    try {
      await setCollections(DEMO_COLLECTIONS);
      await addPosts(
        DEMO_POSTS.map((p) => ({
          url: p.url,
          thumbnailUrl: p.thumbnailUrl,
          caption: p.caption,
          tags: p.tags,
          collectionId: p.collectionId,
          savedAt: p.savedAt,
          aiAnalyzed: p.aiAnalyzed,
        }))
      );
      handleImportSuccess(DEMO_POSTS.length);
    } catch {
      setError('Failed to load demo data');
      addToast('error', 'Failed to load demo data');
    } finally {
      setIsImporting(false);
    }
  }, [addPosts, setCollections, addToast, handleImportSuccess]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.name.endsWith('.json') || file.type === 'application/json')) {
        handleJsonImport(file);
      } else {
        setError('Please drop a JSON file');
      }
    },
    [handleJsonImport]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleJsonImport(file);
    },
    [handleJsonImport]
  );

  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-3.5rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-h2 text-text-primary mb-2">Import Your Saves</h1>
          <p className="text-text-secondary">Choose how you&apos;d like to get your posts into Archivrr</p>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError(null);
              }}
              className={`
                flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200
                ${
                  activeTab === tab.id
                    ? 'border-accent-purple/50 bg-accent-purple/10 text-text-primary'
                    : 'border-border bg-bg-surface text-text-secondary hover:bg-bg-surface-hover'
                }
              `}
            >
              <span className={activeTab === tab.id ? 'text-accent-purple' : ''}>{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-6"
          >
            <p className="text-text-secondary text-sm mb-4">
              {tabs.find((t) => t.id === activeTab)?.description}
            </p>

            {/* JSON Upload */}
            {activeTab === 'json' && (
              <div>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`
                    relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed transition-all duration-300
                    ${
                      isDragging
                        ? 'border-accent-purple bg-accent-purple/5 scale-[1.01]'
                        : 'border-border hover:border-text-secondary/30'
                    }
                  `}
                >
                  <Upload size={32} className={isDragging ? 'text-accent-purple' : 'text-text-secondary'} />
                  <p className="text-text-primary font-medium">
                    {isDragging ? 'Drop your file here' : 'Drag & drop your JSON file'}
                  </p>
                  <p className="text-text-secondary text-xs">or</p>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 rounded-xl bg-bg-surface-hover border border-border text-text-primary text-sm font-medium hover:bg-bg-surface transition-colors">
                      Browse files
                    </span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <div className="mt-4 p-3 rounded-xl bg-bg-surface border border-border text-left">
                    <p className="text-text-primary text-xs font-semibold mb-2">How to get your Instagram JSON file:</p>
                    <ol className="text-text-secondary text-xs space-y-1 list-decimal list-inside leading-relaxed">
                      <li>Go to <a href="https://accountscenter.instagram.com/info_and_permissions/" target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline inline-flex items-center gap-0.5">Accounts Center <ExternalLink size={10} /></a></li>
                      <li>Click <strong className="text-text-primary">Your information and permissions</strong></li>
                      <li>Click <strong className="text-text-primary">Export your information</strong></li>
                      <li>Click <strong className="text-text-primary">Create export</strong> → select your profile</li>
                      <li>Choose <strong className="text-text-primary">Export to device</strong>, format: <strong className="text-text-primary">JSON</strong></li>
                      <li>Under info to export, select <strong className="text-text-primary">Saved posts</strong></li>
                      <li>Click <strong className="text-text-primary">Start export</strong> — it may take 5–15 minutes</li>
                      <li>Once ready, download and unzip — upload the <code className="text-accent-purple">saved_posts.json</code> file here</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* URL Paste */}
            {activeTab === 'url' && (
              <div>
                <textarea
                  value={urlText}
                  onChange={(e) => setUrlText(e.target.value)}
                  placeholder={`https://www.instagram.com/p/ABC123/\nhttps://www.instagram.com/reel/DEF456/\nhttps://www.instagram.com/reels/GHI789/\nhttps://www.instagram.com/tv/JKL012/\nhttps://www.instagram.com/stories/username/123/`}
                  className="w-full h-48 px-4 py-3 rounded-xl bg-bg-surface border border-border text-text-primary text-sm placeholder:text-text-secondary/40 resize-none focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple/50"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-text-secondary text-xs">
                    {urlText.split('\n').filter((l) => isValidInstagramUrl(l.trim())).length} valid URLs detected
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleUrlImport}
                    isLoading={isImporting}
                    disabled={!urlText.trim()}
                  >
                    Import URLs
                  </Button>
                </div>
              </div>
            )}

            {/* Demo Mode */}
            {activeTab === 'demo' && (
              <div className="text-center py-6">
                <div className="grid grid-cols-3 gap-2 mb-6 max-w-xs mx-auto">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg overflow-hidden"
                      style={{
                        backgroundImage: `url(https://picsum.photos/seed/demo${i}/200/200)`,
                        backgroundSize: 'cover',
                      }}
                    />
                  ))}
                </div>
                <p className="text-text-secondary text-sm mb-4">
                  Load 30 curated demo posts across food, travel, design, fashion, fitness, and quotes.
                </p>
                <Button variant="primary" size="lg" onClick={handleDemoImport} isLoading={isImporting}>
                  Load Demo Data
                </Button>
              </div>
            )}

            {/* Error state */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Success state */}
            {importResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20"
              >
                <CheckCircle size={16} className="text-green-400 shrink-0" />
                <p className="text-green-300 text-sm">
                  {importResult.count} posts imported! Redirecting to dashboard...
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

      </motion.div>
      </div>
      <ToastContainer />
    </div>
  );
}
