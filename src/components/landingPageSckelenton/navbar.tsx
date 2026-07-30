'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/clientPages/for-business', label: 'For Businesses' },
  { href: '/clientPages/for-client', label: 'For Clients' },
  { href: '/clientPages/pricing', label: 'Pricing' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative w-full bg-white font-mono">
      <div className="flex items-center justify-between px-6 py-4 sm:px-12">
        <Link href="/" className="font-display text-2xl font-semibold text-moss">
          <span>◆</span> Topzy
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:block">
          <ul className="flex items-center justify-center gap-5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Button
                  asChild
                  className="rounded-full px-6 py-6 text-sm hover:bg-moss hover:text-white"
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden gap-4 md:flex">
          <Button
            asChild
            className="border border-moss bg-white px-6 py-6 text-sm leading-tight text-moss"
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button
            asChild
            className="border border-white bg-moss px-6 py-6 text-sm leading-tight text-white"
          >
            <Link href="/signup">Create your business</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-md text-ink md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-t border-stone bg-white px-6 pb-6 pt-2 shadow-sm md:hidden">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Button
                  asChild
                  className="w-full justify-start rounded-full px-6 py-6 text-sm hover:bg-moss hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-col gap-3 border-t border-stone-soft pt-4">
            <Button
              asChild
              className="w-full border border-moss bg-white px-6 py-6 text-sm leading-tight text-moss"
              onClick={() => setOpen(false)}
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="w-full border border-white bg-moss px-6 py-6 text-sm leading-tight text-white"
              onClick={() => setOpen(false)}
            >
              <Link href="/signup">Create your business</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}