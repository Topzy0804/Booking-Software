"use client";

import { useState } from "react";
import EmptyState from "./emptyState";
import type { Client } from "@/types/dashboard";

const PAGE_SIZE = 10;

export default function ClientsPanel({ clients }: { clients: Client[] }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = clients.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Clients</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          {clients.length} {clients.length === 1 ? "client" : "clients"} · added automatically
          when someone books
        </p>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          title="No clients yet"
          body="Clients are added automatically the first time they book an appointment through your booking page."
        />
      ) : (
        <>
          {/* Desktop / tablet: table */}
          <div className="hidden overflow-hidden rounded-lg border border-stone bg-paper-raised md:block">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_90px] gap-3 bg-stone-soft px-4 py-2.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
              <div>Name</div>
              <div>Email</div>
              <div>Phone</div>
              <div className="text-right">Bookings</div>
            </div>
            {paginated.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1.4fr_1fr_1fr_90px] items-center gap-3 border-t border-stone-soft px-4 py-3 text-[13px]"
              >
                <div className="font-semibold text-ink">{c.fullName}</div>
                <div className="text-ink-soft">{c.email}</div>
                <div className="text-ink-soft">{c.phone ?? "—"}</div>
                <div className="text-right font-mono text-ink">{c.bookingCount}</div>
              </div>
            ))}
          </div>

          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            {paginated.map((c) => (
              <div key={c.id} className="rounded-lg border border-stone bg-paper-raised p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-ink">{c.fullName}</div>
                    <div className="truncate text-[12px] text-ink-soft">{c.email}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-ink">{c.bookingCount}</div>
                    <div className="text-[10px] uppercase tracking-wide text-ink-soft">bookings</div>
                  </div>
                </div>
                <div className="mt-2 text-[12px] text-ink-soft">{c.phone ?? "No phone on file"}</div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-[12px] text-ink-soft">
                Page {safePage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="rounded-md border border-stone px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-stone-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="rounded-md border border-stone px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-stone-soft disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}