import { formatPrice } from '@/lib/currency';

export function ConfirmationStub({
  serviceName,
  durationMinutes,
  priceCents,
  resourceName,
  startISO,
  clientEmail,
}: {
  serviceName: string;
  durationMinutes: number;
  priceCents: number;
  resourceName: string;
  startISO: string;
  clientEmail: string;
}) {
  const start = new Date(startISO);
  return (
    <div className="relative rounded-xl border border-stone bg-paper-raised px-7 py-8 shadow-[0_10px_30px_rgba(34,38,31,0.1)]">
      <div className="mx-auto mb-3.5 flex h-11 w-11 items-center justify-center rounded-full bg-moss text-lg text-white">
        ✓
      </div>
      <h3 className="text-center font-display text-lg font-semibold text-ink">You&rsquo;re booked</h3>
      <p className="mt-1 text-center text-[13px] text-ink-soft">
        A confirmation has been sent to {clientEmail}
      </p>

      <div className="my-5 border-t border-dashed border-stone" />

      <Row k="Service" v={`${serviceName}, ${durationMinutes}min`} />
      <Row k="With" v={resourceName} />
      <Row
        k="Date"
        v={start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
      />
      <Row k="Time" v={start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} />
      <Row k="Total" v={formatPrice(priceCents)} />
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1.5 text-[13px]">
      <span className="text-ink-soft">{k}</span>
      <span className="font-mono font-semibold text-ink">{v}</span>
    </div>
  );
}