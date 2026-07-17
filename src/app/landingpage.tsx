import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentTenants } from '@/lib/tenant';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const tenant = await getCurrentTenants();
  if (tenant) {
    redirect('/book');
  }

  return (
    <main className="bg-paper flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
        Booking, staff &amp; clients — one ledger
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
        Run every appointment from one calendar your whole team can trust
      </h1>
 
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        Give each business its own booking page, staff calendar, and client
        list — set up in minutes, no double-bookings, ever.
      </p>
 
      <div className="mt-8 flex gap-4">
        <Button asChild className="bg-moss hover:bg-moss-dark text-white">
          <Link href="/signup">Create your business</Link>
        </Button>
        <Button asChild variant="outline" className="border-stone text-ink">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
 
      <div className="mt-16 flex flex-wrap justify-center gap-10">
        <Stat number="3 min" label="to set up a booking page" />
        <Stat number="0" label="double-bookings, guaranteed" />
        <Stat number="24/7" label="self-serve client booking" />
      </div>
 
      <p className="mt-10 text-xs text-ink-soft/70">
        Local dev tip: after creating a business at subdomain{" "}
        <code className="rounded bg-stone-soft px-1 py-0.5">acme</code>, visit{" "}
        <code className="rounded bg-stone-soft px-1 py-0.5">
          acme.localhost:&lt;port&gt;
        </code>
        .
      </p>
    </main>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-left">
      <div className="font-mono text-xl text-moss">{number}</div>
      <div className="mt-0.5 text-xs text-ink-soft">{label}</div>
    </div>
  );
}