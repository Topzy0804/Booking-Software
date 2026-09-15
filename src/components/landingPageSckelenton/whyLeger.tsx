export default function WhyLedger() {
  const reasons = [
    {
      number: "01",
      title: "No client app to install",
      body: "Your clients open your booking link in their browser and book. They don't need to download another app just to make an appointment.",
    },
    {
      number: "02",
      title: "Built around real service businesses",
      body: "Services have duration and pricing. Staff can be part of the schedule. Appointments are the center of the experience.",
    },
    {
      number: "03",
      title: "Professional without being complicated",
      body: "Your clients get a clean booking experience while you get the controls you actually need to run the business.",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div>
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-moss sm:text-[10px]">
            Why Topzy booking software
          </p>

          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your clients get simplicity. You get control.
          </h2>

          <p className="mt-4 max-w-md text-sm leading-6 text-ink-soft sm:mt-5 sm:text-[15px] sm:leading-7">
            Good scheduling software should not make your business feel more
            complicated. Topzy booking software keeps the client experience simple while
            giving you the tools to manage what happens behind the scenes.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {reasons.map((reason) => (
            <div
              key={reason.number}
              className="grid gap-4 rounded-xl border border-stone bg-paper-raised p-5 sm:grid-cols-[52px_1fr] sm:gap-5 sm:p-6"
            >
              <div className="font-mono text-xs font-semibold text-moss">
                {reason.number}
              </div>

              <div>
                <h3 className="font-display text-base font-semibold text-ink sm:text-lg">
                  {reason.title}
                </h3>

                <p className="mt-2 text-[12px] leading-5 text-ink-soft sm:text-[13px] sm:leading-6">
                  {reason.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}