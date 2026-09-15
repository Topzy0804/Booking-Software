export default function WhoItsFor() {
  const categories = [
    {
      title: "Salons & spas",
      body: "Keep appointments organized while clients book themselves.",
      icon: "✦",
    },
     {
      title: "Photographers",
      body: "Let clients request available dates without the back-and-forth.",
      icon: "◈",
    },
    {
      title: "Videographers",
      body: "Share one professional booking page for your services.",
      icon: "▣",
    },
    {
      title: "Consultants & coaches",
      body: "Turn your availability into a simple scheduling experience.",
      icon: "◎",
    },
    {
      title: "Barbers",
      body: "Give regular clients an easier way to reserve their next slot.",
      icon: "◇",
    },
    {
      title: "Fitness professionals",
      body: "Manage sessions and availability without relying on messages.",
      icon: "＋",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-2xl">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-moss sm:text-[10px]">
          Built for service businesses
        </p>

        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          If your business runs on appointments, Topzy booking software fits the way you work.
        </h2>

        <p className="mt-4 text-sm leading-6 text-ink-soft sm:text-[15px] sm:leading-7">
          Whether you work alone or have a team, your clients get a
          professional way to book while you stay in control of your schedule.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.title}
            className="rounded-xl border border-stone bg-paper-raised p-5 transition hover:-translate-y-0.5 hover:border-moss/40 hover:shadow-md sm:p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-moss/10 font-display text-lg text-moss">
              {category.icon}
            </div>

            <h3 className="mt-4 font-display text-base font-semibold text-ink sm:mt-5">
              {category.title}
            </h3>

            <p className="mt-2 text-[12px] leading-5 text-ink-soft sm:text-[13px] sm:leading-6">
              {category.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}