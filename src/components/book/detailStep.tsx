import type { Client } from '@/types/book';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/currency';

export function DetailsStep({
  client,
  setClient,
  submitting,
  priceCents,
  onSubmit,
  onBack,
}: {
  client: Client;
  setClient: (c: Client) => void;
  submitting: boolean;
  priceCents: number;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}) {
  return (
     <form onSubmit={onSubmit}>
      <label className="mb-4 block">
        <span className="text-[13px] font-semibold text-ink">Full name</span>
        <input
          required
          className="input"
          value={client.fullName}
          onChange={(e) => setClient({ ...client, fullName: e.target.value })}
        />
      </label>
      <label className="mb-4 block">
        <span className="text-[13px] font-semibold text-ink">Email</span>
        <input
          required
          type="email"
          className="input"
          value={client.email}
          onChange={(e) => setClient({ ...client, email: e.target.value })}
        />
      </label>
      <label className="mb-4 block">
        <span className="text-[13px] font-semibold text-ink">Phone</span>
        <input
          className="input"
          value={client.phone}
          onChange={(e) => setClient({ ...client, phone: e.target.value })}
        />
      </label>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
      >
        {submitting ? "Confirming…" : `Confirm booking — ${formatPrice(priceCents)}`}
      </Button>
      <Button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="mt-3 w-full text-center text-xs text-ink-soft"
      >
        ← Back to time
      </Button>
    </form>
  )
}