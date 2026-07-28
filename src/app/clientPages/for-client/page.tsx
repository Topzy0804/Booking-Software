"use client";

import { useState } from "react";
import Step from "@/components/step";

export default function ForClientsPage() {
  return (
    <main className="bg-paper flex flex-1 flex-col items-center px-6 py-24 text-center">
      <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
        For clients
      </p>
      <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-[38px]">
        Book your next appointment without calling anyone
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-soft">
        Got a link from your barber, your mechanic, or your massage
        therapist? Pick a service, pick a time, done.
      </p>

      <ConfirmationReceipt />

      <section className="mt-24 w-full max-w-4xl">
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
          How it works
        </p>
        <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
          Three steps, no account required
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <Step
            number="1"
            title="Pick a service"
            body="See what's offered and how long it takes, right on the business's own booking page."
          />
          <Step
            number="2"
            title="Choose a time that works"
            body="Only real open slots are shown — never a time that's already taken."
          />
          <Step
            number="3"
            title="Get your confirmation"
            body="A reminder lands in your inbox before your visit, with everything you need to reschedule."
          />
        </div>

        <ul className="mx-auto mt-14 flex max-w-md flex-col gap-3 text-left">
          {[
            "No account or app download needed to book",
            "Reschedule or cancel straight from your confirmation email",
            "Reminders sent automatically before your visit",
          ].map((line) => (
            <li key={line} className="flex items-start gap-2.5 text-sm text-ink-soft">
              <span className="mt-0.5 font-semibold text-moss">✓</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <FindBusiness />
    </main>
  );
}

function ConfirmationReceipt() {
  return (
    <div className="mx-auto mt-14 w-full max-w-xs rounded-lg border border-stone bg-paper-raised text-left shadow-sm">
      <div className="border-b border-dashed border-stone px-6 py-4 text-center">
        <div className="font-display text-base font-semibold text-ink">
          Bright Cuts Barbershop
        </div>
        <div className="mt-0.5 font-mono text-[10px] text-ink-soft">
          brightcuts.modabyyz.me
        </div>
      </div>
      <div className="px-6 py-1">
        {[
          ["Service", "Fade & line-up"],
          ["With", "J. Reyes"],
          ["Date", "Tue, 14 Oct"],
          ["Time", "9:00 AM"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between border-b border-stone-soft py-2.5 text-sm last:border-b-0"
          >
            <span className="text-ink-soft">{label}</span>
            <span className="font-semibold text-ink">{value}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center py-4">
        <span className="-rotate-6 rounded border border-rust px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wide text-rust">
          Confirmed
        </span>
      </div>
    </div>
  );
}

function FindBusiness() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSearchBusinessName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const subdomain = value.trim().toLowerCase();
    if (!subdomain) {
      setError("Enter a business name to search for.");
      return;
    }

    setChecking(true);
    try {
      const res = await fetch(`/api/tenant?subdomain=${encodeURIComponent(subdomain)}`);
      const data = await res.json();

      if (!res.ok || !data.exists) {
        setError(`We couldn't find a business at "${subdomain}". Double-check the name.`);
        return;
      }

      // Confirmed to exist -- safe to redirect. Uses the real
      // subdomain returned by the API (not the raw typed value)
      // in case casing/whitespace differed.
      const rootHost = window.location.host.replace(/^www\./, "");
      window.location.href = `${window.location.protocol}//${data.subdomain}.${rootHost}/book`;
    } catch {
      setError("Something went wrong checking that. Try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="mt-24 w-full max-w-md">
      <p className="font-mono text-xs font-medium uppercase tracking-wide text-moss">
        Know the business, not the link?
      </p>
      <h2 className="mt-3 font-display text-xl font-semibold text-ink">
        Find their booking page
      </h2>

      <form
        onSubmit={handleSearchBusinessName}
        className="mt-6 rounded-lg border border-stone bg-paper-raised p-5 text-left shadow-sm"
      >
        <label htmlFor="business-slug" className="text-xs font-semibold text-ink">
          Business name
        </label>
        <div className="mt-2 flex overflow-hidden rounded-md border border-stone bg-white">
          <input
            id="business-slug"
            type="text"
            placeholder="brightcuts"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="min-w-0 flex-1 px-3 py-2.5 text-sm text-ink outline-none"
          />
          <span className="flex items-center border-l border-stone bg-stone-soft px-3 font-mono text-xs text-ink-soft">
            .{typeof window !== "undefined"
                  ? window.location.host.replace(/^www\./, "")
                  : "localhost:3000"}
          </span>
        </div>

        {error && <p className="mt-2 text-xs text-rust">{error}</p>}

        <button
          type="submit"
          disabled={checking}
          className="mt-3 w-full rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
        >
          {checking ? "Checking…" : "Go to booking page"}
        </button>
      </form>
    </section>
  );
}