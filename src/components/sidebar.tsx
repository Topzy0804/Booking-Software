import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/book', label: 'Bookings' },
  { href: '/service', label: 'Services' },
  { href: '/resource', label: 'Resources' },
  { href: '/client', label: 'Clients' },
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
    <div className='hidden w-[250px] flex-col gap-4 p-4 md:flex'>
      <h2 className='text-xl font-bold'>{tenantName}</h2>
      <p className='text-sm text-muted-foreground'>{subdomain}</p>
      <nav className='flex flex-col gap-2'>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium transition-colors ${
              pathname === item.href
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}