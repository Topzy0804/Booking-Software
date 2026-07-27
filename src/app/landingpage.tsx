import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentTenants } from '@/lib/tenant';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/featureCard';

export default async function HomePage() {
  const tenant = await getCurrentTenants();
  if (tenant) {
    redirect('/book');
  }

  return (
    <main className="bg-paper flex flex-1 flex-col items-center px-6 py-24 text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
        Booking, staff &amp; clients — one ledger
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
        Run every appointment from one calendar your whole team can trust
      </h1>

      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
        Give your business its own booking page, staff schedule, and client
        history — no double-bookings, no spreadsheets, no calls back and
        forth.
      </p>

      <div className="mt-8 flex gap-4">
        <Button asChild className="bg-moss hover:bg-moss-dark px-6 py-6 text-white">
          <Link href="/signup">Create your business</Link>
        </Button>
        <Button asChild className="border-stone px-6 py-6 text-ink">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>

      <DayLedger />

      <section className="mt-24 w-full max-w-4xl">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
          What&apos;s in the ledger
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Three views. One source of truth.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          Everything a client books and every update your staff make touch
          the same calendar — instantly, for everyone.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FeatureCard
            tag="→ /book"
            title="Booking page"
            body="Clients pick a service and a time that's actually open. No calls, no back-and-forth."
          />
          <FeatureCard
            tag="→ /staff"
            title="Staff roster"
            body="Set who works when and what they can do. Change it in a click — history stays intact."
          />
          <FeatureCard
            tag="→ /clients"
            title="Client ledger"
            body="Every booking, past and upcoming, kept against the client it belongs to."
          />
        </div>
      </section>

      <section className="mt-24 max-w-xl">
        <blockquote className="font-display text-xl font-medium italic leading-relaxed text-ink">
          &quot;Since we moved our bookings online, nobody double-books Priya
          anymore — and I stopped tracking hours on a whiteboard.&quot;
        </blockquote>
        <cite className="mt-4 block text-sm not-italic text-ink-soft">
          — Jordan, Bright Cuts Barbershop
        </cite>
      </section>

      <section className="mt-24">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
          Pricing
        </p>
        <h2 className="mt-3 font-display text-xl font-semibold text-ink">
          Free while Topzy is in early access.
        </h2>
        <Link
          href="/pricing"
          className="mt-3 inline-block text-sm font-semibold text-moss hover:text-moss-dark"
        >
          See what&apos;s included →
        </Link>
      </section>

      {process.env.NODE_ENV === 'development' && (
        <p className="mt-16 text-xs text-ink-soft/70">
          Local dev tip: after creating a business at subdomain{' '}
          <code className="rounded bg-stone-soft px-1 py-0.5">acme</code>,
          visit{' '}
          <code className="rounded bg-stone-soft px-1 py-0.5">
            acme.localhost:&lt;port&gt;
          </code>
          .
        </p>
      )}
    </main>
  );
}

function DayLedger() {
  const rows = [
    {
      time: '09:00',
      client: 'Amara T.',
      service: 'Fade & line-up',
      staff: 'J. Reyes',
      status: 'booked' as const,
    },
    {
      time: '09:30',
      client: null,
      service: 'open slot',
      staff: 'J. Reyes',
      status: 'open' as const,
    },
    {
      time: '10:15',
      client: 'Priya K.',
      service: 'Deep clean',
      staff: 'S. Osei',
      status: 'booked' as const,
    },
    {
      time: '11:00',
      client: null,
      service: 'open slot',
      staff: 'S. Osei',
      status: 'open' as const,
    },
  ];

  return (
    <div className="mx-auto mt-14 w-full max-w-xl overflow-hidden rounded-lg border border-stone bg-paper-raised text-left shadow-sm">
      <div className="flex items-center justify-between border-b border-dashed border-stone px-6 py-4">
        <span className="font-display text-base font-semibold text-ink">
          Tuesday, 14 October
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
          Bright Cuts — Ledger
        </span>
      </div>
      <div>
        {rows.map((row) => (
          <div
            key={row.time}
            className={`grid grid-cols-[56px_1fr_1fr_auto] items-center gap-3 border-b border-stone-soft px-6 py-3 text-sm last:border-b-0 ${
              row.status === 'open' ? 'italic text-ink-soft' : ''
            }`}
          >
            <span className="font-mono text-xs text-ink-soft">{row.time}</span>
            <span className={row.status === 'booked' ? 'font-semibold text-ink' : ''}>
              {row.client ?? '—'}
            </span>
            <span className="text-ink-soft">{row.service}</span>
            <span className="flex items-center justify-end gap-2 font-mono text-[11px] text-ink-soft">
              {row.staff}
              {row.status === 'booked' && (
                <span className="-rotate-6 rounded border border-rust px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-rust">
                  Booked
                </span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}