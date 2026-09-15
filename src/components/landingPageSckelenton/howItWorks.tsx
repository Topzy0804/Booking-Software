export default function HowItWorks() {
  const steps = [
    {
      n: "1",
      title: "Create your business",
      body: "Sign up and create your business.",
    },

    { 
      n: "2",
      title: "Add your services",
      body: "List what you offer, how long each one takes, and the price.",
    },

    {
      n: "3",
      title: "Add your staff",
      body: "if it not a solo business, add your staff and assign them to the services they provides.",
    },

    {
      n: "4",
      title: "Share your link",
      body: "One booking page, sharable anywhere — social media, email, text, or your website.",
    },

    {
      n: "5",
      title: "Bookings come in",
      body: "Clients choose a service and available time. The appointment appears in your dashboard automatically.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="text-center">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-moss sm:text-[10px]">
          Simple by design
        </p>

        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          From setup to your first booking in few steps.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-soft sm:text-[15px] sm:leading-7">
          You don't need a developer, a complicated setup, or another system
          for your clients to learn.
        </p>
      </div>

      <div className="relative mt-12 grid gap-10 sm:mt-16 lg:grid-cols-3 lg:gap-8">
        <div className="absolute left-[16%] right-[16%] top-6 hidden border-t border-dashed border-stone lg:block" />

        {steps.map((step) => (
          <div key={step.n} className="relative text-center">
            <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border-4 border-paper bg-moss font-mono text-xs font-semibold text-white shadow-sm">
              {step.n}
            </div>

            <h3 className="mt-5 font-display text-lg font-semibold text-ink sm:mt-6">
              {step.title}
            </h3>

            <p className="mx-auto mt-2.5 max-w-xs text-[12px] leading-5 text-ink-soft sm:mt-3 sm:text-[13px] sm:leading-6">
              {step.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}