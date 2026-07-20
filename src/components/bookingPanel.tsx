"use client";

import { useState } from "react";
import { toast } from "sonner";
import EmptyState from "./emptyState";
import type { Booking, BookingStatus } from "@/types/dashboard";
import { Button } from '@/components/ui/button';

const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  attended: "Attended",
  cancelled: "Cancelled",
  no_show: "No-show",
};
const STATUS_CLASS: Record<BookingStatus, string> = {
  confirmed: "bg-[#E1E9E2] text-moss-dark",
  attended: "bg-[#ECE4D3] text-gold",
  cancelled: "bg-[#F5E4DF] text-rust",
  no_show: "bg-[#EFEBE0] text-ink-soft",
};

export default function BookingsPanel({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: BookingStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't update that booking");
        return;
      }
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
      toast.success("Booking updated");
    } finally {
      setUpdatingId(null);
    }
  }

  const sorted = [...bookings].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Bookings</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          {bookings.length} total · {bookings.filter((b) => b.status === "confirmed").length}{" "}
          upcoming
        </p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          body="Once your booking page is set up with a service, appointments booked by clients will show up here."
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone bg-paper-raised">
          <div className="grid min-w-[720px] grid-cols-[110px_1.4fr_1fr_1fr_120px_1fr] gap-3 bg-stone-soft px-4 py-2.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
            <div>Time</div>
            <div>Client</div>
            <div>Service</div>
            <div>Staff</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>
          {sorted.map((b) => (
            <div
              key={b.id}
              className="grid min-w-[720px] grid-cols-[110px_1.4fr_1fr_1fr_120px_1fr] items-center gap-3 border-t border-stone-soft px-4 py-3 text-[13px]"
            >
              <div className="font-mono text-ink">
                {new Date(b.startsAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
              <div>
                <div className="font-semibold text-ink">{b.clientName}</div>
                <div className="text-[11px] text-ink-soft">{b.clientEmail}</div>
              </div>
              <div className="text-ink-soft">{b.serviceName}</div>
              <div className="text-ink-soft">{b.resourceName}</div>
              <div>
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[b.status]}`}
                >
                  {STATUS_LABEL[b.status]}
                </span>
              </div>
              <div className="flex justify-end gap-2">
                {b.status === "confirmed" && (
                  <>
                    <Button
                      disabled={updatingId === b.id}
                      onClick={() => updateStatus(b.id, "attended")}
                      className="text-[11px] font-medium text-moss hover:underline disabled:opacity-50"
                    >
                      Attended
                    </Button>
                    <Button
                      disabled={updatingId === b.id}
                      onClick={() => updateStatus(b.id, "no_show")}
                      className="text-[11px] font-medium text-ink-soft hover:underline disabled:opacity-50"
                    >
                      No-show
                    </Button>
                    <Button
                      disabled={updatingId === b.id}
                      onClick={() => updateStatus(b.id, "cancelled")}
                      className="text-[11px] font-medium text-rust hover:underline disabled:opacity-50"
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}