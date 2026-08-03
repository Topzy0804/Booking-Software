import type { MergedSlot, Preference, StaffOption } from '@/types/book';
import { isSameDay } from '@/lib/bookingHelper';
import { Button } from '@/components/ui/button';


export function DateTimeStep({
  days,
  selectedDay,
  onSelectDay,
  preference,
  onPreferenceChange,
  qualifiedStaff,
  chosenStaffId,
  onChooseStaff,
  slots,
  loading,
  selectedSlot,
  onSelectSlot,
  onNext,
  onBack,
}: {
  days: Date[];
  selectedDay: Date;
  onSelectDay: (d: Date) => void;
  preference: Preference;
  onPreferenceChange: (p: Preference) => void;
  qualifiedStaff: StaffOption[];
  chosenStaffId: string;
  onChooseStaff: (id: string) => void;
  slots: MergedSlot[];
  loading: boolean;
  selectedSlot: MergedSlot | null;
  onSelectSlot: (s: MergedSlot) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
     <div>
      {/* Staff preference -- default "Any available" keeps the fair,
          auto-assigned behavior; "Choose staff" is opt-in. */}
      {qualifiedStaff.length > 1 && (
        <div className="mb-5">
          <div className="mb-2 flex rounded-md border border-stone p-0.5">
            <Button
              onClick={() => onPreferenceChange("any")}
              className={`flex-1 rounded px-3 py-1.5 text-[12px] font-medium ${
                preference === "any" ? "bg-moss text-white" : "text-ink-soft"
              }`}
            >
              Any available
            </Button>
            <Button
              onClick={() => onPreferenceChange("specific")}
              className={`flex-1 rounded px-3 py-1.5 text-[12px] font-medium ${
                preference === "specific" ? "bg-moss text-white" : "text-ink-soft"
              }`}
            >
              Choose staff
            </Button>
          </div>
          {preference === "specific" && (
            <select
              className="input"
              value={chosenStaffId}
              onChange={(e) => onChooseStaff(e.target.value)}
            >
              {qualifiedStaff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {days.map((d) => {
          const active = isSameDay(d, selectedDay);
          return (
            <Button
              key={d.toISOString()}
              onClick={() => onSelectDay(d)}
              className={`w-14 shrink-0 rounded-lg border py-2.5 text-center ${
                active ? "border-moss bg-moss text-white" : "border-stone bg-paper-raised text-ink"
              }`}
            >
              <div className={`font-mono text-[10px] uppercase ${active ? "text-white/80" : "text-ink-soft"}`}>
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </div>
              <div className="font-display text-base font-semibold">{d.getDate()}</div>
            </Button>
          );
        })}
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-ink-soft">Loading times…</p>
      ) : slots.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-soft">No openings on this day. Try another date.</p>
      ) : (
        <div className="mb-2 grid grid-cols-3 gap-2">
          {slots.map((s) => {
            const active = selectedSlot?.startISO === s.startISO;
            return (
              <Button
                key={s.startISO}
                onClick={() => onSelectSlot(s)}
                className={`rounded-md border py-2.5 font-mono text-[13px] ${
                  active ? "border-moss bg-moss text-white" : "border-stone bg-paper-raised text-ink"
                }`}
              >
                {new Date(s.startISO).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              </Button>
            );
          })}
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={!selectedSlot}
        className="mt-4 w-full rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continue
      </Button>
      <Button onClick={onBack} className="mt-3 w-full text-center text-xs text-ink-soft">
        ← Back to services
      </Button>
    </div>
  )
}