'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';


export default function Navbar() {

  return (
    <header className="sticky top-0 z-50 border-b border-stone-soft bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="Topzy home"
        >
          <span className="">
            <Image src="/logo.png" alt="Topzy logo" width={140} height={30} />
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            How it works
          </a>

          <a
            href="#faq"
            className="text-sm font-medium text-ink-soft transition hover:text-ink"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden px-2 text-sm font-medium text-ink-soft transition hover:text-ink sm:inline"
          >
            Sign in
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-moss px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-moss-dark sm:px-4 sm:text-sm"
          >
            <span className="sm:hidden">Get started</span>
            <span className="hidden sm:inline">Start for free</span>
          </Link>
        </div>
      </div>
    </header>
  );
}