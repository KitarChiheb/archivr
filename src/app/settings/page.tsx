'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Download, Upload, Trash2, Check, ExternalLink, Info, AlertTriangle, Sparkles } from 'lucide-react';
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
import TopNav from '@/components/layout/TopNav';

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
      <TopNav />
      <div className="max-w-2xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
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
              <Sparkles size={18} className="text-accent-purple" />
              <h2 className="text-lg font-semibold text-text-primary">AI Features (OpenRouter)</h2>
            </div>

            {/* Info box */}
            <div className="p-3 rounded-xl bg-accent-purple/5 border border-accent-purple/20 mb-4">
              <div className="flex gap-2">
                <Info size={16} className="text-accent-purple shrink-0 mt-0.5" />
                <div className="text-xs text-text-secondary leading-relaxed">
                  <p className="font-semibold text-text-primary mb-1">What is OpenRouter?</p>
                  <p>OpenRouter gives you access to AI models for auto-tagging your posts. Archivr uses free models by default, but they can be rate-limited. For the best experience, we recommend adding a small credit ($1–5 lasts a long time).</p>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="p-3 rounded-xl bg-bg-surface border border-border mb-4">
              <p className="text-text-primary text-xs font-semibold mb-2">How to get your API key:</p>
              <ol className="text-text-secondary text-xs space-y-1 list-decimal list-inside leading-relaxed">
                <li>Go to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline inline-flex items-center gap-0.5">openrouter.ai/keys <ExternalLink size={10} /></a></li>
                <li>Sign in with Google or create an account</li>
                <li>Click <strong className="text-text-primary">Create Key</strong></li>
                <li>Copy the key (starts with <code className="text-accent-purple">sk-or-v1-</code>) and paste it below</li>
              </ol>
            </div>

            {/* Recommendation */}
            <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 mb-4">
              <div className="flex gap-2">
                <AlertTriangle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  <strong className="text-yellow-400">Tip:</strong> Free models get rate-limited quickly. Adding just $1–5 in <a href="https://openrouter.ai/credits" target="_blank" rel="noopener noreferrer" className="text-accent-purple hover:underline">OpenRouter credits</a> unlocks faster, more reliable AI tagging with premium models.
                </p>
              </div>
            </div>

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
            {!apiKey && (
              <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
                <Key size={12} />
                No API key set — AI features are disabled.
              </p>
            )}
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
              Made by chikit.
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
