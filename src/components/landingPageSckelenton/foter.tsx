import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {

  return (
    <footer className="border-t border-stone-soft bg-paper">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" className="flex gap-2">
                  <Image src="/logo.png" alt="Topzy logo" width={140} height={30} />
                  
                </Link>
    
                <p className="mt-2 max-w-xs text-[11px] leading-5 text-ink-soft sm:text-xs">
                  Simple booking software for service businesses.
                </p>
              </div>
    
              <div className="flex items-center gap-5 sm:gap-6">
                <Link
                  href="/login"
                  className="text-xs font-medium text-ink-soft transition hover:text-ink"
                >
                  Sign in
                </Link>
    
                <Link
                  href="/signup"
                  className="text-xs font-medium text-moss transition hover:text-moss-dark"
                >
                  Get started
                </Link>
              </div>
            </div>
    
            <div className="mt-7 border-t border-stone-soft pt-5 sm:mt-8 sm:pt-6">
              <p className="text-[9px] text-ink-soft sm:text-[10px]">
                © {new Date().getFullYear()} Topzy booking software. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
  );
}
