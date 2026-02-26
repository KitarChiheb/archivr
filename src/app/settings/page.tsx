'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Download, Upload, Trash2, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import ToastContainer from '@/components/ui/Toast';
import { usePostStore } from '@/lib/store/usePostStore';
import { useCollectionStore } from '@/lib/store/useCollectionStore';
import { useToastStore } from '@/lib/store/useToastStore';
import { exportAllData } from '@/lib/db/indexeddb';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useThemeStore } from '@/lib/store/useThemeStore';

// 📚 LEARN: Settings page handles sensitive operations: API key management, data export/import,
// and destructive actions (clear all). We store the API key in localStorage since it needs
// to be accessible from the client for display, but the actual API calls go through the server route.

export default function SettingsPage() {
  const clearAllPosts = usePostStore((s) => s.clearAll);
  const clearAllCollections = useCollectionStore((s) => s.clearAll);
  const setPosts = usePostStore((s) => s.setPosts);
  const setCollections = useCollectionStore((s) => s.setCollections);
  const addToast = useToastStore((s) => s.addToast);
  const theme = useThemeStore((s) => s.theme);

  const [apiKey, setApiKey] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('archivr-openrouter-key');
    if (stored) setApiKey(stored);
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem('archivr-openrouter-key', apiKey);
    setIsSaved(true);
    addToast('success', 'API key saved');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archivr-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('success', 'Data exported successfully');
    } catch {
      addToast('error', 'Export failed');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.posts && Array.isArray(data.posts)) {
        await setPosts(data.posts);
      }
      if (data.collections && Array.isArray(data.collections)) {
        await setCollections(data.collections);
      }

      addToast('success', 'Data imported successfully');
    } catch {
      addToast('error', 'Invalid backup file');
    }
  };

  const handleClearAll = async () => {
    await clearAllPosts();
    await clearAllCollections();
    localStorage.removeItem('archivr-openrouter-key');
    setApiKey('');
    setShowClearConfirm(false);
    addToast('success', 'All data cleared');
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-h2 text-text-primary">Settings</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* API Key */}
          <section className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key size={18} className="text-accent-purple" />
              <h2 className="text-lg font-semibold text-text-primary">OpenRouter API Key</h2>
            </div>
            <p className="text-text-secondary text-sm mb-4">
              Required for AI auto-tagging. Get a free key at{' '}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-purple hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                />
              </div>
              <Button onClick={handleSaveKey} variant={isSaved ? 'secondary' : 'primary'}>
                {isSaved ? <Check size={16} /> : 'Save'}
              </Button>
            </div>
            <p className="text-text-secondary text-xs mt-2">
              Stored locally in your browser. Never sent to our servers.
            </p>
          </section>

          {/* Appearance */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary text-sm font-medium">Theme</p>
                <p className="text-text-secondary text-xs">
                  Currently using {theme} mode
                </p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          {/* Data Management */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Data Management</h2>

            <div className="space-y-3">
              {/* Export */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-text-primary text-sm font-medium">Export Data</p>
                  <p className="text-text-secondary text-xs">Download all posts and collections as JSON</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleExport}>
                  <Download size={14} />
                  Export
                </Button>
              </div>

              {/* Import */}
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="text-text-primary text-sm font-medium">Import Backup</p>
                  <p className="text-text-secondary text-xs">Restore from a previously exported JSON file</p>
                </div>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-bg-surface border border-border text-text-primary hover:bg-bg-surface-hover transition-colors font-medium">
                    <Upload size={14} />
                    Import
                  </span>
                  <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
              </div>

              {/* Clear */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-text-primary text-sm font-medium">Clear All Data</p>
                  <p className="text-text-secondary text-xs">Delete all posts, collections, and settings</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => setShowClearConfirm(true)}>
                  <Trash2 size={14} />
                  Clear
                </Button>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="glass-card p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-2">About Archivr</h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              Archivr is an open-source Instagram saved posts organizer. All data is stored locally in your browser using IndexedDB — nothing is sent to any server except AI analysis requests (when you choose to use them).
            </p>
            <p className="text-text-secondary text-xs mt-3">
              Built with Next.js, TypeScript, Zustand, Tailwind CSS, and Framer Motion.
            </p>
          </section>
        </motion.div>
      </div>

      {/* Clear Confirm Modal */}
      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Clear All Data?" size="sm">
        <p className="text-text-secondary text-sm mb-4">
          This will permanently delete all posts, collections, tags, and settings. This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleClearAll}>Clear Everything</Button>
        </div>
      </Modal>

      <ToastContainer />
    </div>
  );
}
