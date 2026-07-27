import Link from 'next/link';

const productLinks = [
  { href: '/clientPages/for-business', label: 'For businesses' },
  { href: '/clientPages/for-client', label: 'For clients' },
  { href: '/clientPages/pricing', label: 'Pricing' },
];

const accountLinks = [
  { href: '/login', label: 'Sign in' },
  { href: '/signup', label: 'Create your business' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone bg-paper">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.3fr_1fr_1fr]">
          <div className="text-left">
            <div className="flex items-center gap-1.5 font-display text-lg font-semibold text-moss">
              <span>◆</span>
              <span>Topzy</span>
            </div>
            <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-ink-soft">
              Booking, staff &amp; clients — one ledger every business can
              trust.
            </p>
          </div>

          <FooterColumn heading="Product" links={productLinks} />
          <FooterColumn heading="Account" links={accountLinks} />
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-stone-soft pt-6 sm:flex-row">
          <p className="font-mono text-xs text-ink-soft">
            © {year} Topzy. All rights reserved.
          </p>
          <p className="font-mono text-xs text-ink-soft">
            Built for businesses who don&apos;t double-book.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  links,
}: {
  heading: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="text-left">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-ink">
        {heading}
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-ink-soft transition-colors hover:text-moss"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}