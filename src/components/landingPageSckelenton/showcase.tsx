import Link from "next/link";

export default function Showcase() {
  const appointments = [
    {
      time: "09:00",
      client: "Amara T.",
      service: "Fade & line-up",
      status: "Booked",
    },
    {
      time: "10:15",
      client: "Priya K.",
      service: "Deep clean",
      status: "Booked",
    },
    {
      time: "11:00",
      client: "—",
      service: "Open slot",
      status: "Available",
    },
    {
      time: "12:30",
      client: "David O.",
      service: "Consultation",
      status: "Booked",
    },
  ];

  return (
    <section className="border-y border-stone-soft bg-paper-raised/70">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8">
        <div className="order-2 lg:order-1">
          <div className="overflow-hidden rounded-xl border border-stone bg-paper-raised shadow-[0_20px_60px_rgba(34,38,31,0.08)] sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-stone-soft px-4 py-3 sm:px-5 sm:py-4">
              <div>
                <p className="font-display text-sm font-semibold text-ink">
                  Today
                </p>

                <p className="mt-0.5 text-[9px] text-ink-soft sm:text-[10px]">
                  Tuesday, 14 October
                </p>
              </div>

              <span className="rounded-md border border-stone px-2 py-1 font-mono text-[8px] text-ink-soft sm:px-2.5 sm:text-[9px]">
                4 appointments
              </span>
            </div>

            <div>
              {appointments.map((appointment) => (
                <div
                  key={`${appointment.time}-${appointment.client}`}
                  className="flex items-center gap-2.5 border-b border-stone-soft px-4 py-3.5 last:border-b-0 sm:gap-4 sm:px-5 sm:py-4"
                >
                  <span className="w-10 shrink-0 font-mono text-[9px] text-ink-soft sm:w-12 sm:text-[10px]">
                    {appointment.time}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-xs sm:text-sm ${
                        appointment.client === "—"
                          ? "italic text-ink-soft"
                          : "font-semibold text-ink"
                      }`}
                    >
                      {appointment.client === "—"
                        ? appointment.service
                        : appointment.client}
                    </p>

                    {appointment.client !== "—" && (
                      <p className="mt-0.5 truncate text-[9px] text-ink-soft sm:text-[10px]">
                        {appointment.service}
                      </p>
                    )}
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2 py-1 font-mono text-[8px] font-semibold sm:px-2.5 sm:text-[9px] ${
                      appointment.status === "Booked"
                        ? "bg-moss/10 text-moss"
                        : "bg-stone-soft text-ink-soft"
                    }`}
                  >
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-moss sm:text-[10px]">
            Your business dashboard
          </p>

          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Know what's happening today before the day starts.
          </h2>

          <p className="mt-4 text-sm leading-6 text-ink-soft sm:mt-5 sm:text-[15px] sm:leading-7">
            Your booking page handles the client side. Your dashboard gives
            you the clear view you need to manage the business side.
          </p>

          <div className="mt-6 space-y-3 sm:mt-7">
            {[
              "See upcoming appointments at a glance",
              "Know which slots are booked or available",
              "Manage services and staff from one place",
              "Keep booking information organized",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss text-[10px] text-white">
                  ✓
                </span>

                <span className="text-sm text-ink-soft">{item}</span>
              </div>
            ))}
          </div>

          <Link
            href="/signup"
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-moss px-5 py-3 text-sm font-semibold text-white transition hover:bg-moss-dark sm:mt-8"
          >
            Create your business
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </section>
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