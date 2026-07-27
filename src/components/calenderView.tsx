'use client';

import { useMemo, useState } from 'react';
import type { Booking, BookingStatus } from '@/types/dashboard';

const STATUS_CLASS: Record<BookingStatus, string> = {
  confirmed: 'bg-[#E1E9E2] text-moss-dark border-l-moss',
  attended: 'bg-[#ECE4D3] text-gold border-l-gold',
  cancelled: 'bg-[#F5E4DF] text-rust border-l-rust',
  no_show: 'bg-[#EFEBE0] text-ink-soft border-l-stone',
};

type CalendarMode = 'day' | 'week';

export default function CalendarView({
  bookings,
  updatingId,
  onUpdateStatus,
}: {
  bookings: Booking[];
  updatingId: string | null;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
}) {
  const [mode, setMode] = useState<CalendarMode>('week');
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));

  const days = useMemo(() => {
    if (mode === 'day') return [anchor];
    const weekStart = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [mode, anchor]);
  
  const byDay = useMemo(() => groupByDay(bookings, days), [bookings, days]);

  function shift(delta: number) {
    setAnchor((cur) => addDays(cur, mode === 'day' ? delta : delta * 7));
  }

  function startOfDay(d: Date): Date {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function startOfWeek(d: Date) {
    const copy = startOfDay(d);
    const day = copy.getDay();
    copy.setDate(copy.getDate() - day);
    return copy;
  }

  function addDays(d: Date, n: number): Date {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + n);
    return copy;
  }

  function isSameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
  }

  function groupByDay(bookings: Booking[], days: Date[]): Map<string, Booking[]> {
  const map = new Map<string, Booking[]>();
  for (const d of days) map.set(d.toDateString(), []);
  for (const b of bookings) {
    const key = new Date(b.startsAt).toDateString();
    if (map.has(key)) {
      map.get(key)!.push(b);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }
  return map;
}

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shift(-1)}
            className="rounded-md border border-stone px-2.5 py-1.5 text-ink-soft hover:bg-stone-soft"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            onClick={() => shift(1)}
            className="rounded-md border border-stone px-2.5 py-1.5 text-ink-soft hover:bg-stone-soft"
            aria-label="Next"
          >
            →
          </button>
          <button
            onClick={() => setAnchor(startOfDay(new Date()))}
            className="rounded-md border border-stone px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-stone-soft"
          >
            Today
          </button>
          <span className="ml-1 font-display text-sm font-semibold text-ink">
            {mode === "day"
              ? anchor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
              : `${days[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${days[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
          </span>
        </div>

        <div className="flex rounded-md border border-stone p-0.5">
          {(["day", "week"] as CalendarMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded px-3 py-1 text-[12px] font-medium capitalize ${
                mode === m ? "bg-moss text-white" : "text-ink-soft hover:bg-stone-soft"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`grid gap-2 ${mode === "week" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7" : "grid-cols-1"}`}
      >
        {days.map((day) => {
          const dayBookings = byDay.get(day.toDateString()) ?? [];
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toISOString()} className="rounded-lg border border-stone bg-paper-raised">
              <div
                className={`border-b border-stone-soft px-3 py-2 ${isToday ? "bg-stone-soft" : ""}`}
              >
                <div className="font-mono text-[10px] uppercase tracking-wide text-ink-soft">
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </div>
                <div className="font-display text-sm font-semibold text-ink">{day.getDate()}</div>
              </div>

              <div className="space-y-1.5 p-2">
                {dayBookings.length === 0 ? (
                  <p className="px-1 py-3 text-center text-[11px] text-ink-soft">No bookings</p>
                ) : (
                  dayBookings.map((b) => (
                    <div
                      key={b.id}
                      className={`rounded-r-md border-l-[3px] px-2 py-1.5 text-[11px] ${STATUS_CLASS[b.status]}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-semibold">
                          {new Date(b.startsAt).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate font-semibold text-ink">{b.clientName}</div>
                      <div className="truncate text-ink-soft">{b.serviceName}</div>
                      {b.status === "confirmed" && (
                        <div className="mt-1 flex gap-1.5">
                          <button
                            disabled={updatingId === b.id}
                            onClick={() => onUpdateStatus(b.id, "attended")}
                            className="text-[10px] font-medium text-moss hover:underline disabled:opacity-50"
                          >
                            Attended
                          </button>
                          <button
                            disabled={updatingId === b.id}
                            onClick={() => onUpdateStatus(b.id, "no_show")}
                            className="text-[10px] font-medium text-ink-soft hover:underline disabled:opacity-50"
                          >
                            No-show
                          </button>
                          <button
                            disabled={updatingId === b.id}
                            onClick={() => onUpdateStatus(b.id, "cancelled")}
                            className="text-[10px] font-medium text-rust hover:underline disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )
}