"use client";

import { useState } from "react";
import { toast } from "sonner";

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  bufferAfterMinutes: number;
  priceCents: number;
  isActive: boolean;
};

type Resource = {
  id: string;
  name: string;
  isActive: boolean;
};

type Booking = {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status: "confirmed" | "cancelled" | "attended" | "no_show";
  priceCentsSnapshot: number;
  clientName: string;
  clientEmail: string;
  serviceName: string;
  resourceName: string;
};

type Tab = "bookings" | "services" | "staff";

export default function DashboardClient({
  tenantName,
  subdomain,
  initialServices,
  initialResources,
  initialBookings,
}: {
  tenantName: string;
  subdomain: string;
  initialServices: Service[];
  initialResources: Resource[];
  initialBookings: Booking[];
}) {
  const [tab, setTab] = useState<Tab>("bookings");
  const [services, setServices] = useState(initialServices);
  const [resources, setResources] = useState(initialResources);
  const [bookings, setBookings] = useState(initialBookings);

  return (
    <div className="flex flex-1">
      {/* Left rail */}
      <div className="hidden w-[220px] flex-shrink-0 flex-col border-r border-stone bg-paper-raised py-6 md:flex">
        <div className="mb-3.5 border-b border-stone-soft px-5 pb-5">
          <div className="font-display text-base font-semibold text-ink">{tenantName}</div>
          <div className="mt-0.5 font-mono text-[11px] text-ink-soft">{subdomain}.app.com</div>
        </div>
        <RailItem label="Bookings" active={tab === "bookings"} onClick={() => setTab("bookings")} />
        <RailItem label="Services" active={tab === "services"} onClick={() => setTab("services")} />
        <RailItem label="Staff" active={tab === "staff"} onClick={() => setTab("staff")} />
      </div>

      {/* Mobile tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-stone bg-paper-raised md:hidden">
        {(["bookings", "services", "staff"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-medium capitalize ${
              tab === t ? "text-moss" : "text-ink-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 px-6 py-8 pb-20 sm:px-10 md:pb-8">
        {tab === "bookings" && (
          <BookingsPanel bookings={bookings} setBookings={setBookings} />
        )}
        {tab === "services" && (
          <ServicesPanel services={services} setServices={setServices} />
        )}
        {tab === "staff" && (
          <StaffPanel resources={resources} setResources={setResources} services={services} />
        )}
      </div>
    </div>
  );
}

function RailItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`border-l-[3px] px-5 py-2.5 text-left text-[13px] font-medium ${
        active
          ? "border-moss bg-stone-soft text-ink"
          : "border-transparent text-ink-soft hover:bg-stone-soft/50"
      }`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------

const STATUS_LABEL: Record<Booking["status"], string> = {
  confirmed: "Confirmed",
  attended: "Attended",
  cancelled: "Cancelled",
  no_show: "No-show",
};
const STATUS_CLASS: Record<Booking["status"], string> = {
  confirmed: "bg-[#E1E9E2] text-moss-dark",
  attended: "bg-[#ECE4D3] text-gold",
  cancelled: "bg-[#F5E4DF] text-rust",
  no_show: "bg-[#EFEBE0] text-ink-soft",
};

function BookingsPanel({
  bookings,
  setBookings,
}: {
  bookings: Booking[];
  setBookings: (b: Booking[]) => void;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function updateStatus(id: string, status: Booking["status"]) {
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

  const upcoming = [...bookings].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Bookings</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            {bookings.length} total · {bookings.filter((b) => b.status === "confirmed").length}{" "}
            upcoming
          </p>
        </div>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          body="Once your booking page is set up with a service, appointments booked by clients will show up here."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone bg-paper-raised">
          <div className="grid grid-cols-[110px_1.4fr_1fr_1fr_120px_1fr] gap-3 bg-stone-soft px-4 py-2.5 font-mono text-[10px] uppercase tracking-wide text-ink-soft">
            <div>Time</div>
            <div>Client</div>
            <div>Service</div>
            <div>Staff</div>
            <div>Status</div>
            <div className="text-right">Action</div>
          </div>
          {upcoming.map((b) => (
            <div
              key={b.id}
              className="grid grid-cols-[110px_1.4fr_1fr_1fr_120px_1fr] items-center gap-3 border-t border-stone-soft px-4 py-3 text-[13px]"
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
                    <button
                      disabled={updatingId === b.id}
                      onClick={() => updateStatus(b.id, "attended")}
                      className="text-[11px] font-medium text-moss hover:underline disabled:opacity-50"
                    >
                      Attended
                    </button>
                    <button
                      disabled={updatingId === b.id}
                      onClick={() => updateStatus(b.id, "no_show")}
                      className="text-[11px] font-medium text-ink-soft hover:underline disabled:opacity-50"
                    >
                      No-show
                    </button>
                    <button
                      disabled={updatingId === b.id}
                      onClick={() => updateStatus(b.id, "cancelled")}
                      className="text-[11px] font-medium text-rust hover:underline disabled:opacity-50"
                    >
                      Cancel
                    </button>
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

// ---------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------

function ServicesPanel({
  services,
  setServices,
}: {
  services: Service[];
  setServices: (s: Service[]) => void;
}) {
  const [showForm, setShowForm] = useState(services.length === 0);
  const [form, setForm] = useState({ name: "", durationMinutes: 30, priceCents: 0 });
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't add that service");
        return;
      }
      setServices([...services, data.service]);
      setForm({ name: "", durationMinutes: 30, priceCents: 0 });
      setShowForm(false);
      toast.success("Service added");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Services</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            What clients can book on your public page.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md border border-stone px-3.5 py-2 text-[13px] font-medium text-ink hover:bg-stone-soft"
          >
            + Add service
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 grid grid-cols-1 gap-3 rounded-lg border border-stone bg-paper-raised p-5 sm:grid-cols-4"
        >
          <label className="sm:col-span-2">
            <span className="text-[12px] font-semibold text-ink">Name</span>
            <input
              required
              className="input"
              placeholder="Deep Tissue Massage"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label>
            <span className="text-[12px] font-semibold text-ink">Duration (min)</span>
            <input
              required
              type="number"
              min={5}
              step={5}
              className="input"
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
            />
          </label>
          <label>
            <span className="text-[12px] font-semibold text-ink">Price ($)</span>
            <input
              required
              type="number"
              min={0}
              step={0.5}
              className="input"
              value={form.priceCents / 100}
              onChange={(e) =>
                setForm({ ...form, priceCents: Math.round(Number(e.target.value) * 100) })
              }
            />
          </label>
          <div className="flex items-end gap-2 sm:col-span-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-moss px-4 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add service"}
            </button>
            {services.length > 0 && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-stone-soft"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {services.length === 0 && !showForm ? (
        <EmptyState
          title="No services yet"
          body="Clients can't book anything until you add at least one service with a duration and price."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="rounded-lg border border-stone bg-paper-raised p-4">
              <div className="flex items-start justify-between">
                <div className="font-semibold text-ink">{s.name}</div>
                <div className="font-mono text-moss">${(s.priceCents / 100).toFixed(2)}</div>
              </div>
              <div className="mt-1 text-[12px] text-ink-soft">{s.durationMinutes} minutes</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

function StaffPanel({
  resources,
  setResources,
  services,
}: {
  resources: Resource[];
  setResources: (r: Resource[]) => void;
  services: Service[];
}) {
  const [showForm, setShowForm] = useState(resources.length === 0);
  const [name, setName] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [submitting, setSubmitting] = useState(false);

  function toggleDay(d: number) {
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));
  }
  function toggleService(id: string) {
    setSelectedServiceIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    );
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          serviceIds: selectedServiceIds,
          workingHours: { startTime, endTime, days },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't add that staff member");
        return;
      }
      setResources([...resources, data.resource]);
      setName("");
      setSelectedServiceIds([]);
      setShowForm(false);
      toast.success("Staff member added");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Staff</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Who clients can book, and when they're available.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md border border-stone px-3.5 py-2 text-[13px] font-medium text-ink hover:bg-stone-soft"
          >
            + Add staff
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="mb-6 space-y-4 rounded-lg border border-stone bg-paper-raised p-5"
        >
          <label className="block max-w-sm">
            <span className="text-[12px] font-semibold text-ink">Name</span>
            <input
              required
              className="input"
              placeholder="Sam Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          {services.length > 0 && (
            <div>
              <span className="text-[12px] font-semibold text-ink">Can perform</span>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {services.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleService(s.id)}
                    className={`rounded-full border px-3 py-1 text-[12px] ${
                      selectedServiceIds.includes(s.id)
                        ? "border-moss bg-moss text-white"
                        : "border-stone text-ink-soft"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-[12px] font-semibold text-ink">Working days</span>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => toggleDay(d.value)}
                  className={`w-11 rounded-md border py-1.5 text-[12px] font-medium ${
                    days.includes(d.value)
                      ? "border-moss bg-moss text-white"
                      : "border-stone text-ink-soft"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <label>
              <span className="text-[12px] font-semibold text-ink">Start</span>
              <input
                type="time"
                className="input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </label>
            <label>
              <span className="text-[12px] font-semibold text-ink">End</span>
              <input
                type="time"
                className="input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-moss px-4 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add staff member"}
            </button>
            {resources.length > 0 && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-stone-soft"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {resources.length === 0 && !showForm ? (
        <EmptyState
          title="No staff yet"
          body="Add at least one staff member with working hours before clients can book a time slot."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <div key={r.id} className="rounded-lg border border-stone bg-paper-raised p-4">
              <div className="font-semibold text-ink">{r.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-stone px-6 py-16 text-center">
      <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-soft">{body}</p>
    </div>
  );
}