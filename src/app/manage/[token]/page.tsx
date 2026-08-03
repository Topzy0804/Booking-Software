'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

type BookingDetails = {
  id: string;
  serviceId: string;
  resourceId: string;
  startsAt: string;
  status: string;
  priceCentsSnapshot: number;
  clientName: string;
  serviceName: string;
  durationMinutes: number;
  resourceName: string;
  tenantName: string;
};

export default function ManageBookingPage() {
  const { token } = useParams<{ token: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [canModify, setCanModify] = useState(false);
  const [cutoffHours, setCutoffHours] = useState(2);

  const [mode, setMode] = useState<"view" | "reschedule">("view");
  const [slots, setSlots] = useState<{ start: string }[]>([]);
  const [date, setDate] = useState(() => toDateParam(new Date()));
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/manageBookin/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
        setBooking({ ...data.booking, startsAt: data.booking.startsAt });
        setCanModify(data.canModify);
        setCutoffHours(data.cutoffHours);
      })
      .catch(() => setError("Couldn't load this booking."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (mode !== "reschedule" || !booking) return;
    let cancelled = false;
    setLoadingSlots(true);
    fetch(
      `/api/availability?serviceId=${booking.serviceId}&date=${date}&excludeBookingId=${booking.id}`
    )
    .then((res) => res.json())
    .then((data) => {
      if (cancelled) return;
      const forThisStaff = (data.availability ?? []).find(
        (r: { resourceId: string }) => r.resourceId === booking.resourceId
      );
      setSlots(forThisStaff?.slots ?? []);
    })
    .finally(() => {
      if (!cancelled) {
        setLoadingSlots(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mode, booking, date]);


  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setBusy(true);

    try {
      const res = await fetch(`/api/manageBookin/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to cancel booking.");
        return;
      }
      toast.success("Booking cancelled successfully.");
      setBooking((b) => (b ? { ...b, status: "cancelled" } : b));
      setCanModify(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleReschedule(newStartsAt: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/manageBookin/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", startsAt: newStartsAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to reschedule booking.");
        return;
      }
      toast.success("Booking rescheduled successfully.");
      setBooking((b) => (b ? { ...b, startsAt: newStartsAt } : b));
      setMode("view");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className='flex flex-1 items-center justify-center px-6 py-24'>
        <p className='text-sm text-ink-soft'>Loading booking details...</p>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className='flex flex-1 items-center justify-center px-6 py-24'>
        <div>
          <h1 className='font-display text-lg font-semibold text-ink'>Link not valid</h1>
          <p className='mt-2 max-w-sm text-sm text-ink-soft'>{error}</p>
        </div>
      </main>
    );
  }

  const start = new Date(booking.startsAt);

  return (
     <main className="flex flex-1 justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wide text-moss">
            {booking.tenantName}
          </p>
          <h1 className="mt-1 font-display text-xl font-semibold text-ink">Your booking</h1>
        </div>

        <div className="rounded-lg border border-stone bg-paper-raised p-5">
          <Row k="Service" v={`${booking.serviceName}, ${booking.durationMinutes}min`} />
          <Row k="With" v={booking.resourceName} />
          <Row
            k="Date"
            v={start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          />
          <Row k="Time" v={start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })} />
          <Row k="Status" v={booking.status.replace("_", "-")} />
        </div>

        {mode === "view" && (
          <>
            {canModify ? (
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setMode("reschedule")}
                  className="flex-1 rounded-md border border-stone px-4 py-2.5 text-sm font-semibold text-ink hover:bg-stone-soft"
                >
                  Reschedule
                </button>
                <button
                  disabled={busy}
                  onClick={handleCancel}
                  className="flex-1 rounded-md bg-rust px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : booking.status === "confirmed" ? (
              <p className="mt-5 text-center text-xs text-ink-soft">
                This is within {cutoffHours} hours of your appointment, so it can no longer be
                changed online. Contact {booking.tenantName} directly if you need to.
              </p>
            ) : (
              <p className="mt-5 text-center text-xs text-ink-soft">
                This booking is {booking.status.replace("_", "-")} and can&rsquo;t be changed.
              </p>
            )}
          </>
        )}

        {mode === "reschedule" && (
          <div className="mt-5">
            <label className="block">
              <span className="text-[12px] font-semibold text-ink">New date</span>
              <input
                type="date"
                className="input"
                value={date}
                min={toDateParam(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div className="mt-3">
              {loadingSlots ? (
                <p className="text-xs text-ink-soft">Loading times…</p>
              ) : slots.length === 0 ? (
                <p className="text-xs text-ink-soft">No openings this day.</p>
              ) : (
                <div className="grid grid-cols-3 gap-1.5">
                  {slots.map((s) => (
                    <button
                      key={s.start}
                      disabled={busy}
                      onClick={() => handleReschedule(s.start)}
                      className="rounded-md border border-stone py-2 font-mono text-[12px] text-ink hover:border-moss disabled:opacity-50"
                    >
                      {new Date(s.start).toLocaleTimeString(undefined, {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setMode("view")}
              className="mt-4 w-full text-center text-xs text-ink-soft"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-stone-soft py-2 text-xs last:border-b-0">
      <span className="text-ink-soft">{k}</span>
      <span className="font-semibold text-ink font-mono capitalize">{v}</span>
    </div>
  );
}

function toDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
} 