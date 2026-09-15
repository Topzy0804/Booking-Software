export default function Features() {
  const items = [
    {
      icon: "↗",
      title: "A booking page that represents your business",
      body: "Give clients one clean link where they can see your services, availability, and book an appointment without creating an account.",
    },
    {
      icon: "✓",
      title: "Availability clients can actually trust",
      body: "Bookings are checked against your existing schedule so clients don't choose slots that are already taken.",
    },
    {
      icon: "◷",
      title: "Automatic confirmations & reminders",
      body: "Keep clients informed after they book and reduce the need to manually remind people about upcoming appointments.",
    },
    {
      icon: "＋",
      title: "Start solo. Add your team later.",
      body: "Begin with your own schedule and add staff, services, and more structure as your business grows.",
    },
    {
      icon: "↻",
      title: "Rescheduling without the back-and-forth",
      body: "Clients can manage their appointment through the booking flow instead of having to message you for every change.",
    },
    {
      icon: "▤",
      title: "A dashboard built around your day",
      body: "See your upcoming appointments and booking status clearly so you always know what is happening next.",
    },
  ];

  return (
     <section
      id="features"
      className="border-y border-stone-soft bg-paper-raised/70"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-moss sm:text-[10px]">
              Everything you need
            </p>

            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Less admin. More time doing the work you actually get paid for.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-ink-soft">
            Topzy booking software takes care of the repetitive parts of appointment
            scheduling while keeping you in control.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:mt-12 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-stone bg-paper-raised p-5 transition hover:bg-paper sm:p-7"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-moss/10 font-mono text-lg text-moss sm:h-11 sm:w-11">
                {item.icon}
              </div>

              <h3 className="mt-5 font-display text-base font-semibold leading-snug text-ink sm:mt-6 sm:text-lg">
                {item.title}
              </h3>

              <p className="mt-2.5 text-[12px] leading-5 text-ink-soft sm:mt-3 sm:text-[13px] sm:leading-6">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}