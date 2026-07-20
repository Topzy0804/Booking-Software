import EmptyState from "./emptyState";
import type { Client } from "@/types/dashboard";


export default function ClientsPanel({ clients }: { clients: Client[] }) {
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
        <div className="overflow-hidden rounded-lg border border-stone bg-paper-raised">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_90px] gap-3 bg-stone-soft px-4 py-2.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div className="text-right">Bookings</div>
          </div>
          {clients.map((c) => (
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
      )}
    </div>
  );
}