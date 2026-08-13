import { formatPrice } from '@/lib/currency';
import type { Service } from '@/types/book';
import { Button } from '@/components/ui/button';

export function ServiceStep({
  services,
  selected,
  onSelect,
  onNext,
}: {
  services: Service[];
  selected: Service;
  onSelect: (s: Service) => void;
  onNext: () => void;
}) {
  return (
    <div>
      {services.map((s) => (
        <Button
          key={s.id}
          onClick={() => onSelect(s)}
          className={`mb-2.5 flex w-full items-center justify-between rounded-lg border bg-paper-raised px-4 py-10 text-left ${
            selected.id === s.id ? "border-moss shadow-[0_0_0_2px_rgba(62,92,70,0.14)]" : "border-stone"
          }`}
        >
          <div>
            <div className="text-sm font-semibold text-ink">{s.name}</div>
            <div className="mt-0.5 font-mono text-xs text-ink-soft">{s.durationMinutes} min</div>
          </div>
          <div className="font-mono font-medium text-moss">
            {formatPrice(s.priceCents)}
          </div>
        </Button>
      ))}
      <Button
        onClick={onNext}
        className="mt-2 w-full rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-dark"
      >
        Continue
      </Button>
    </div>
  );
}