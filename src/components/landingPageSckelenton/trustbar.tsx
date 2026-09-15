export default function TrustBar() {
  return (
    <section className="border-y border-stone-soft bg-paper-raised">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-stone-soft px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
        <TrustBarItem
          title="One simple booking link"
          body="Share it on WhatsApp, Instagram, your website, or anywhere clients find you."
        />

        <TrustBarItem
          title="Fewer booking conversations"
          body="Clients can see availability and choose an appointment without waiting for a reply."
        />

        <TrustBarItem
          title="Everything in one place"
          body="Keep services, appointments, staff, and schedules organized from one dashboard."
        />
      </div>
    </section>
  );
}

function TrustBarItem({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="px-4 py-6 sm:px-8 sm:py-7">
      <h3 className="font-display text-sm font-semibold text-ink">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-[11px] leading-5 text-ink-soft sm:text-[12px]">
        {body}
      </p>
    </div>
  );
}