"use client";

import { useState } from "react";
import { toast } from "sonner";
import EmptyState from "@/components/emptyState";
import NewBookingModal from "@/components/newBookingMobal";
import CalendarView from "@/components/calenderView";
import AnalyticsStrip from "@/components/analyticStrip";
import type { Booking, BookingStatus, Service, Resource } from "@/types/dashboard";
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

export function capitalizeName(name: string) {
  return name
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function BookingsPanel({
  initialBookings,
  services,
  canCreateBookings,
}: {
  initialBookings: Booking[];
  services: Service[];
  canCreateBookings: boolean;
  // Accepted for prop-shape consistency with what the page fetches,
  // though NewBookingModal fetches its own richer copy (with
  // serviceIds attached) via GET /api/resources rather than using this.
  resources?: Resource[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10; 

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
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
  );
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Bookings</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            {bookings.length} total · {bookings.filter((b) => b.status === "confirmed").length}{" "}
            upcoming
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-stone p-0.5">
            {(["list", "calendar"] as const).map((v) => (
              <Button
                key={v}
                onClick={() => setView(v)}
                className={`rounded px-3 py-1.5 text-[12px] font-medium capitalize ${
                  view === v ? "bg-moss text-white" : "text-ink-soft hover:bg-stone-soft"
                }`}
              >
                {v}
              </Button>
            ))}
          </div>
          {canCreateBookings && (
          <Button
            onClick={() => setShowNewBooking(true)}
            className="rounded-md bg-moss px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark"
          >
            + New booking
          </Button>
          )}
        </div>
      </div>

      <AnalyticsStrip bookings={bookings} />

      {showNewBooking && (
        <NewBookingModal
          services={services}
          onClose={() => setShowNewBooking(false)}
          onCreated={(booking) => setBookings((cur) => [...cur, booking])}
        />
      )}

      {view === "calendar" ? (
        <CalendarView bookings={bookings} updatingId={updatingId} onUpdateStatus={updateStatus} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          body="Once your booking page is set up with a service, appointments booked by clients will show up here."
        />
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-stone bg-paper-raised md:block">
            <div className="grid min-w-[720px] grid-cols-[110px_1.4fr_1fr_1fr_120px_1fr] gap-3 bg-stone-soft px-4 py-2.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
              <div>Time</div>
              <div>Client</div>
              <div>Service</div>
              <div>Staff</div>
              <div>Status</div>
              <div className="text-right">Action</div>
            </div>
            {paginated.map((b) => (
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
                  <div className="font-semibold text-ink">{capitalizeName(b.clientName)}</div>
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

          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            {paginated.map((b) => (
              <div key={b.id} className="rounded-lg border border-stone bg-paper-raised p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate capitalize font-semibold text-ink">{capitalizeName(b.clientName)}</div>
                    <div className="truncate text-[11px] text-ink-soft">{b.clientEmail}</div>
                  </div>
                  <span
                    className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_CLASS[b.status]}`}
                  >
                    {STATUS_LABEL[b.status]}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-soft">
                  <span className="font-mono text-ink">
                    {new Date(b.startsAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>{b.serviceName}</span>
                  <span>{b.resourceName}</span>
                </div>
                {b.status === "confirmed" && (
                  <div className="mt-3 flex gap-4 border-t border-stone-soft pt-3">
                    <Button
                      disabled={updatingId === b.id}
                      onClick={() => updateStatus(b.id, "attended")}
                      className="text-[12px] font-medium text-moss disabled:opacity-50"
                    >
                      Attended
                    </Button>
                    <Button
                      disabled={updatingId === b.id}
                      onClick={() => updateStatus(b.id, "no_show")}
                      className="text-[12px] font-medium text-ink-soft disabled:opacity-50"
                    >
                      No-show
                    </Button>
                    <Button
                      disabled={updatingId === b.id}
                      onClick={() => updateStatus(b.id, "cancelled")}
                      className="text-[12px] font-medium text-rust disabled:opacity-50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[12px] text-ink-soft">
                Page {safePage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded-md border border-stone px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-stone-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-md border border-stone px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-stone-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}