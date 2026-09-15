import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-8 lg:py-28">
        {/* Hero copy */}
        <div className="text-center lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-stone bg-paper-raised px-3 py-1.5 shadow-sm sm:mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" />

            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-soft sm:text-[10px]">
              Simple scheduling for service businesses
            </span>
          </div>

          <h1 className="mx-auto max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-5xl md:text-6xl lg:mx-0 lg:text-[4.25rem]">
            Let clients book.
            <span className="block text-moss">You get back to work.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-6 text-ink-soft sm:mt-6 sm:text-base sm:leading-7 lg:mx-0 lg:text-lg">
            Give your clients a simple booking page they can use anytime.
            Manage your schedule, services, staff, and appointments from one
            place — without the endless calls and messages.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-moss px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-moss-dark"
            >
              Create your booking page
              <ArrowRightIcon />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-stone bg-paper-raised px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-stone-soft"
            >
              See how it works
            </a>
          </div>

          <div className="mt-6 flex flex-col items-center gap-2 sm:mt-7 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-2 lg:justify-start">
            <TrustPoint text="No client account required" />
            <TrustPoint text="Set up in minutes" />
            <TrustPoint text="Solo businesses & teams" />
          </div>
        </div>

        {/* Product preview */}
        <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">
          <div className="absolute -right-10 -top-10 hidden h-48 w-48 rounded-full bg-moss/10 blur-3xl sm:block" />

          <div className="absolute -bottom-10 -left-10 hidden h-48 w-48 rounded-full bg-gold/10 blur-3xl sm:block" />

          <div className="relative rounded-2xl border border-stone bg-paper-raised p-2 shadow-[0_20px_60px_rgba(34,38,31,0.10)] sm:p-3">
            {/* Browser header */}
            <div className="flex items-center justify-between border-b border-stone-soft px-2 pb-2.5 sm:px-3 sm:pb-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-stone sm:h-2.5 sm:w-2.5" />
                <span className="h-2 w-2 rounded-full bg-stone sm:h-2.5 sm:w-2.5" />
                <span className="h-2 w-2 rounded-full bg-stone sm:h-2.5 sm:w-2.5" />
              </div>

              <div className="max-w-45 truncate rounded-md border border-stone-soft bg-paper px-4 py-1.5 font-mono text-[8px] text-ink-soft sm:max-w-none sm:px-8 sm:text-[9px]">
                ledger.app/bright-studio
              </div>

              <div className="w-5 sm:w-8" />
            </div>

            {/* Mobile: single-column preview */}
            <div className="grid gap-3 p-2.5 sm:p-4 md:grid-cols-[1fr_1.15fr]">
              {/* Booking page */}
              <div className="rounded-xl border border-stone bg-paper p-4 sm:p-5">
                <div className="mb-4 sm:mb-5">
                  <p className="font-display text-base font-semibold text-ink sm:text-lg">
                    Bright Studio
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-ink-soft sm:text-xs">
                    Choose a service and a time that works for you.
                  </p>
                </div>

                <div className="space-y-2">
                  <BookingOption
                    title="Deep Tissue Massage"
                    duration="60 min"
                    price="₦25,000"
                    active
                  />

                  <BookingOption
                    title="Signature Facial"
                    duration="45 min"
                    price="₦18,000"
                  />

                  <BookingOption
                    title="Consultation"
                    duration="30 min"
                    price="₦10,000"
                  />
                </div>

                <button className="mt-4 min-h-10 w-full rounded-lg bg-moss py-2.5 text-[11px] font-semibold text-white sm:text-xs">
                  Continue
                </button>
              </div>

              {/* Calendar */}
              <div className="rounded-xl border border-stone bg-paper-raised p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-semibold text-ink">
                      Choose a time
                    </p>

                    <p className="mt-0.5 text-[9px] text-ink-soft sm:text-[11px]">
                      Tuesday, 14 October
                    </p>
                  </div>

                  <span className="rounded-md border border-stone px-1.5 py-1 font-mono text-[8px] text-ink-soft sm:px-2 sm:text-[9px]">
                    GMT+1
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5">
                  {[
                    "9:00 AM",
                    "10:00 AM",
                    "11:30 AM",
                    "1:00 PM",
                    "2:00 PM",
                    "3:30 PM",
                  ].map((time, index) => (
                    <div
                      key={time}
                      className={`flex min-h-9 items-center justify-center rounded-lg border px-2 py-2 text-[10px] font-medium sm:min-h-10 sm:text-xs ${
                        index === 4
                          ? "border-moss bg-moss text-white"
                          : "border-stone bg-paper text-ink hover:border-moss"
                      }`}
                    >
                      {time}
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-moss/20 bg-moss/5 p-2.5 sm:mt-5 sm:p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-moss text-[10px] text-white">
                      ✓
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-ink sm:text-xs">
                        Appointment confirmed
                      </p>

                      <p className="truncate text-[9px] text-ink-soft sm:text-[10px]">
                        Confirmation sent to the client
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification hidden on very small screens */}
          <div className="absolute -bottom-6 -left-4 hidden w-60 rounded-xl border border-stone bg-paper-raised p-3 shadow-xl sm:block">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moss/10 text-moss">
                <CheckIcon />
              </div>

              <div>
                <p className="text-xs font-semibold text-ink">
                  New booking
                </p>

                <p className="mt-0.5 text-[11px] text-ink-soft">
                  Amara booked Deep Tissue Massage
                </p>

                <p className="mt-1 font-mono text-[9px] text-moss">
                  Today · 2:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookingOption({
  title,
  duration,
  price,
  active = false,
}: {
  title: string;
  duration: string;
  price: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-2.5 sm:p-3 ${
        active
          ? "border-moss bg-moss/5"
          : "border-stone-soft bg-paper-raised"
      }`}
    >
      <div className="flex items-center justify-between gap-2.5">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-ink sm:text-[11px]">
            {title}
          </p>

          <p className="mt-0.5 text-[8px] text-ink-soft sm:text-[9px]">
            {duration}
          </p>
        </div>

        <span className="shrink-0 font-mono text-[9px] font-semibold text-moss sm:text-[10px]">
          {price}
        </span>
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function TrustPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-moss/10 text-[9px] font-bold text-moss">
        ✓
      </span>

      <span className="text-[10px] font-medium text-ink-soft sm:text-[11px]">
        {text}
      </span>
    </div>
  );
}