import Link from 'next/link';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/featureCard';
import Step from '@/components/step';

export default function ForBusinessPage() {
  return (
    <main className="bg-paper flex flex-1 flex-col items-center px-6 py-24 text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
        For businesses
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-[38px]">
        The calendar your staff, your clients, and you all read from the same
        page
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
        Topzy gives every business its own booking site, staff schedule, and
        client history — set up in minutes, not migrations.
      </p>

      <div className="mt-8 flex gap-4">
        <Button asChild className="bg-moss hover:bg-moss-dark px-6 py-6 text-white">
          <Link href="/signup">Create your business</Link>
        </Button>
        <Button asChild className="border-stone px-6 py-6 text-ink">
          <Link href="/pricing">See pricing</Link>
        </Button>
      </div>

      <RosterPreview />

      <section className="mt-24 w-full max-w-4xl">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
          Everything you need, nothing you don&apos;t
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Four sections. One dashboard.
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FeatureCard
            tag="Bookings"
            title="See what's happening today"
            body="Every appointment, filterable by day, week, or staff member — always current, never a spreadsheet."
          />
          <FeatureCard
            tag="Services"
            title="Define what you offer"
            body="Set the service, how long it takes, and who on your team is qualified to do it."
          />
          <FeatureCard
            tag="Staff"
            title="Set hours per person"
            body="Edit someone's hours or services without losing a single past booking. Deactivate instead of delete."
          />
          <FeatureCard
            tag="Clients"
            title="Keep the history"
            body="Every client's visits in one place — no digging through texts to remember what they had last time."
          />
        </div>
      </section>

      <section className="mt-24 w-full max-w-4xl">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
          Getting started
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Live in three steps
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Step
            number="1"
            title="Name your business"
            body="Your booking link — yourbusiness.topzycorp.app — is live the moment you sign up."
          />
          <Step
            number="2"
            title="Add services & staff hours"
            body="Takes a few minutes. Change any of it any time, without losing history."
          />
          <Step
            number="3"
            title="Share your booking link"
            body="Put it in your bio, your window, your receipts. Clients book straight into your calendar."
          />
        </div>
      </section>

      <section className="mt-24">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Ready to stop double-booking?
        </h2>
        <Button asChild className="bg-moss hover:bg-moss-dark mt-6 px-6 py-6 text-white">
          <Link href="/signup">Create your business</Link>
        </Button>
      </section>
    </main>
  );
}

function RosterPreview() {
  const staff = ['J. Reyes', 'S. Osei', 'F. Lawal'];
  const slots: { time: string; cells: (string | null)[] }[] = [
    { time: '09:00', cells: ['Amara T. — Fade', null, 'Deo K. — Repair'] },
    { time: '09:30', cells: [null, 'Priya K. — Deep clean', null] },
    { time: '10:00', cells: ['Nate O. — Trim', 'Ciara M. — Wax', 'off today'] },
  ];

  return (
    <div className="mx-auto mt-14 w-full max-w-3xl overflow-x-auto rounded-lg border border-stone bg-paper-raised text-left shadow-sm">
      <div className="grid min-w-[560px] grid-cols-[64px_repeat(3,1fr)] border-b border-dashed border-stone">
        <div className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
          Time
        </div>
        {staff.map((s) => (
          <div
            key={s}
            className="px-4 py-3 font-mono text-[11px] uppercase tracking-wide text-ink-soft"
          >
            {s}
          </div>
        ))}
      </div>
      {slots.map((row) => (
        <div
          key={row.time}
          className="grid min-w-[560px] grid-cols-[64px_repeat(3,1fr)] border-b border-stone-soft last:border-b-0"
        >
          <div className="px-4 py-3 font-mono text-xs text-ink-soft">{row.time}</div>
          {row.cells.map((cell, i) => (
            <div key={i} className="m-1 rounded px-2 py-2 text-xs">
              {cell ? (
                <span className="rounded bg-stone-soft px-2 py-1 text-ink">{cell}</span>
              ) : (
                <span className="text-stone">open</span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}