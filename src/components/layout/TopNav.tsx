'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Import, Settings, Home } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function TopNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', icon: <Home size={16} />, label: 'Home' },
    { href: '/import', icon: <Import size={16} />, label: 'Import' },
    { href: '/dashboard', icon: <Bookmark size={16} />, label: 'Dashboard' },
    { href: '/settings', icon: <Settings size={16} />, label: 'Settings' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-bg-surface/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <Link href="/" className="gradient-text text-lg font-bold shrink-0">
          Archivr
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-accent-purple/10 text-accent-purple'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover'
                  }
                `}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
          <div className="ml-2 border-l border-border pl-2">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
