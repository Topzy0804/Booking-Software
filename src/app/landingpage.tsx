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
    <main className="flex flex-1 flex-col items-center bg-paper px-6 py-20 text-center sm:px-8">
      <div className="w-full max-w-6xl">
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-moss">
            Booking, staff &amp; clients — one ledger
          </p>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-5xl lg:text-6xl">
            Run every appointment from one calendar your whole team can trust
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-soft">
            Give your business its own booking page, staff schedule, and client
            history — no double-bookings, no spreadsheets, and no endless back-and-forth.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="bg-moss px-6 py-6 text-white hover:bg-moss-dark">
              <Link href="/signup">Create your business</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-stone bg-paper-raised px-6 py-6 text-ink hover:bg-stone-soft"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>

        <div className="mt-16">
          <DayLedger />
        </div>

        <section className="mt-24 w-full">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-moss">
              What&apos;s in the ledger
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              Three views. One source of truth.
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
              Everything a client books and every update your staff make touches the
              same calendar — instantly, for everyone.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            <FeatureCard
              tag="→ /book"
              title="Booking page"
              body="Clients pick a service and a time that’s actually open. No calls, no back-and-forth."
            />
            <FeatureCard
              tag="→ /staff"
              title="Staff roster"
              body="Set who works when and what they can do. Update schedules in a click without losing history."
            />
            <FeatureCard
              tag="→ /clients"
              title="Client ledger"
              body="Every booking, past and upcoming, stays attached to the right client and the right service."
            />
          </div>
        </section>

        <section className="mt-24">
          <div className="mx-auto max-w-3xl rounded-2xl border border-stone bg-paper-raised p-8 text-center shadow-sm">
            <blockquote className="font-display text-xl font-medium italic leading-relaxed text-ink sm:text-2xl">
              “Since we moved our bookings online, nobody double-books Priya anymore —
              and I stopped tracking hours on a whiteboard.”
            </blockquote>
            <cite className="mt-4 block text-sm not-italic text-ink-soft">
              — Jordan, Bright Cuts Barbershop
            </cite>
          </div>
        </section>

        <section className="mt-24">
          <div className="mx-auto max-w-xl rounded-2xl border border-stone bg-paper-raised p-8 text-center shadow-sm">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-moss">
              Pricing
            </p>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-ink">
              Free while Topzy is in early access.
            </h2>
            <Link
              href="/pricing"
              className="mt-4 inline-block text-sm font-semibold text-moss transition hover:text-moss-dark"
            >
              See what&apos;s included →
            </Link>
          </div>
        </section>

        {process.env.NODE_ENV === 'development' && (
          <p className="mt-16 text-center text-xs text-ink-soft/70">
            Local dev tip: after creating a business at subdomain{' '}
            <code className="rounded bg-stone-soft px-1 py-0.5">acme</code>, visit{' '}
            <code className="rounded bg-stone-soft px-1 py-0.5">
              acme.localhost:&lt;port&gt;
            </code>
            .
          </p>
        )}
      </div>
    </main>
  );
}

function DayLedger() {
  const rows = [
    { time: '09:00', client: 'Amara T.', service: 'Fade & line-up', staff: 'J. Reyes', status: 'booked' as const },
    { time: '09:30', client: null, service: 'open slot', staff: 'J. Reyes', status: 'open' as const },
    { time: '10:15', client: 'Priya K.', service: 'Deep clean', staff: 'S. Osei', status: 'booked' as const },
    { time: '11:00', client: null, service: 'open slot', staff: 'S. Osei', status: 'open' as const },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-stone bg-paper-raised text-left shadow-[0_18px_40px_rgba(34,38,31,0.06)]">
      <div className="flex items-center justify-between border-b border-dashed border-stone px-6 py-4">
        <span className="font-display text-base font-semibold text-ink">
          Tuesday, 14 October
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft">
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