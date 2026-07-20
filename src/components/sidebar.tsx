'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard/book', label: 'Bookings' },
  { href: '/dashboard/service', label: 'Services' },
  { href: '/dashboard/staff', label: 'Staff' },
  { href: '/dashboard/client', label: 'Clients' },
];


export default function Sidebar({
  tenantName,
  subdomain,
}: {
  tenantName: string;
  subdomain: string;
}) {
  const pathname = usePathname();

  return (
    <>
    <div className='hidden w-[250px] shrink-0 flex-col border-r border-stone bg-paper-raised gap-4 py-6 md:flex'>
      <div className='mb-3.5 border-b border-stone-soft px-5 pb-5'>
        <div className='font-display text-base font-semibold text-ink'>{tenantName}</div>
        <div className='mt-0.5 font-mono text-[11px] text-ink-soft'>{subdomain}.app.com</div>
      </div>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border-l-[3px] px-5 py-2.5 text-left text-[13px] font-medium ${
              active
                ? "border-moss bg-stone-soft text-ink"
                : "border-transparent text-ink-soft hover:bg-stone-soft/50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>

    {/* mobile view */}
    <div className='fixed bottom-0 left-0 right-0 z-10 flex border-t border-stone bg-paper-raised md:hidden'>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 py-3 text-center text-xs font-medium ${
              active ? "text-moss" : "text-ink-soft"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
    </>
  )
}