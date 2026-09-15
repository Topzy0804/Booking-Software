export default function Faq() {
  const questions = [
    {
      question: "Do my clients need an account?",
      answer:
        "No. Your clients can use your booking page without creating an account. They simply choose the service and an available time.",
    },
    {
      question: "Can I use Topzy booking software if I'm a solo business?",
      answer:
        "Yes. Topzy booking software is designed to work for a single service provider as well as businesses that have multiple staff members.",
    },
    {
      question: "How do clients find my booking page?",
      answer:
        "You get a shareable booking link that you can place on WhatsApp, Instagram, your website, QR codes, or anywhere else you communicate with clients.",
    },
    {
      question: "Can clients reschedule or cancel?",
      answer:
        "The booking flow can provide clients with a management link so they can manage their appointment without needing to contact you directly.",
    },
    {
      question: "Do I need a website?",
      answer:
        "No. Your Topzy booking page can be shared directly with clients, so you can start accepting online bookings even if you don't have a website.",
    },
    {
      question: "How long does setup take?",
      answer:
        "The basic setup is designed to be quick: add your business information, configure your services and availability, then share your booking link.",
    },
  ];

  return (
    <section
      id="faq"
      className="border-y border-stone-soft bg-paper-raised/70"
    >
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="text-center">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-moss sm:text-[10px]">
            Questions
          </p>

          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Everything you need to know.
          </h2>
        </div>

        <div className="mt-10 divide-y divide-stone sm:mt-12">
          {questions.map((item) => (
            <details key={item.question} className="group py-4 sm:py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-sm font-semibold text-ink sm:text-base">
                <span>{item.question}</span>

                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-stone text-ink-soft transition group-open:rotate-45">
                  +
                </span>
              </summary>

              <p className="max-w-2xl pt-3 text-[12px] leading-5 text-ink-soft sm:text-[13px] sm:leading-6">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}