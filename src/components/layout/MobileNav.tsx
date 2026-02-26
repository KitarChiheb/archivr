'use client';

import { Bookmark, FolderOpen, Settings, Import } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 📚 LEARN: Mobile bottom navigation replaces the sidebar on small screens.
// This follows the mobile-first pattern used by Instagram itself.

const navItems = [
  { href: '/dashboard', icon: <Bookmark size={20} />, label: 'Posts' },
  { href: '/dashboard?filter=uncollected', icon: <FolderOpen size={20} />, label: 'Collections' },
  { href: '/import', icon: <Import size={20} />, label: 'Import' },
  { href: '/settings', icon: <Settings size={20} />, label: 'Settings' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border bg-bg-surface/90 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname.startsWith('/dashboard'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors
                ${isActive ? 'text-accent-purple' : 'text-text-secondary'}
              `}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
