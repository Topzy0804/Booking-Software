'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Booking, Service } from '@/types/dashboard';
import { StaffOption } from '@/types/book';
import { toDateParam } from '@/lib/bookingHelper';

export default function NewBookingModal({
  services,
  onClose,
  onCreated,
}: {
  services: Service[];
  onClose: () => void;
  onCreated: (booking: Booking) => void;
}) {
  const [allStaff, setAllStaff] = useState<{ id: string; name: string; serviceIds: string[] }[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '');
  const [resourceId, setResourceId] = useState('');
  const [slots, setSlots] = useState<{ start: string }[]>([]);
  const [date, setDate] = useState(() => toDateParam(new Date()));
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [client, setClient] = useState({
    fullName: '',
    email: '',
    phone: '',
  });
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    fetch('/api/resources')
      .then((res) => res.json())
      .then((data) => {
        setAllStaff(
          (data.resources ?? []).map((r: { id: string; name: string; serviceIds: string[] }) => ({
            id: r.id,
            name: r.name,
            serviceIds: r.serviceIds,
          }))
        );
      })
      .catch(() => toast.error("couldn't load staff list"))
      .finally(() => setLoadingStaff(false));
  }, []);

  const handleQualifiedStaff: StaffOption[] = useMemo(
    () =>
      allStaff
        .filter((r) => r.serviceIds.includes(serviceId))
        .map((r) => ({ id: r.id, name: r.name })),
    [allStaff, serviceId]
  );

  useEffect(() => {
    if (!serviceId || !resourceId || !date) {
      return;
    }
    let cancelled = false;
    setLoadingSlots(true);
    setStartsAt(null);
    fetch(`/api/availability?serviceId=${serviceId}&date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const forThisStaff = (data.availability ?? []).find(
          (r: { resourceId: string }) => r.resourceId === resourceId
        );
        setSlots(forThisStaff?.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) toast.error('could not load availability');
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, resourceId, date]);

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!startsAt) return;
      setSubmit(true);
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ serviceId, resourceId, startsAt, client }),
        });
        const data = await res.json();
        if (res.status === 409) {
          toast.error(data.error ?? 'that slot is no longer available.');
          setStartsAt(null);
          setSlots((prev) => prev.filter((s) => s.start !== startsAt));
          return;
        }
        if (!res.ok) {
          toast.error(data.error ?? 'could not create booking')
          return;
        }

        const service = services.find((s) => s.id === serviceId);
        const staff = handleQualifiedStaff.find((s) => s.id === resourceId);

        onCreated({
          id: data.booking.id,
          serviceId,
          resourceId,
          startsAt: new Date(startsAt),
          endsAt: new Date(data.booking.endsAt),
          status: 'confirmed',
          priceCentsSnapshot: service?.priceCents ?? 0,
          clientName: client.fullName,
          clientEmail: client.email,
          serviceName: service?.name ?? '',
          resourceName: staff?.name ?? '',
        });
        toast.success('Booking created');
        onClose();
      } finally {
        setSubmit(false);
      }
    }

    return (
      <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border border-stone bg-paper-raised p-6">
        <div className="mb-5 flex items-start justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">New booking</h3>
          <button onClick={onClose} className="text-ink-soft hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-ink-soft">Add a service before creating a booking.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-[12px] font-semibold text-ink">Service</span>
              <select
                className="input"
                value={serviceId}
                onChange={(e) => {
                  const nextServiceId = e.target.value;
                  setServiceId(nextServiceId);
                  setStartsAt(null);
                  const nextQualifiedStaff = allStaff.filter((r) => r.serviceIds.includes(nextServiceId));
                  setResourceId(nextQualifiedStaff[0]?.id ?? '');
                }}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.durationMinutes}min, ${(s.priceCents / 100).toFixed(2)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[12px] font-semibold text-ink">Staff member</span>
              {loadingStaff ? (
                <p className="mt-1 text-xs text-ink-soft">Loading…</p>
              ) : handleQualifiedStaff.length === 0 ? (
                <p className="mt-1 text-xs text-rust">No staff perform this service yet.</p>
              ) : (
                <select
                  className="input"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                >
                  {handleQualifiedStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </label>

            <label className="block">
              <span className="text-[12px] font-semibold text-ink">Date</span>
              <input
                type="date"
                className="input"
                value={date}
                min={toDateParam(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>

            <div>
              <span className="text-[12px] font-semibold text-ink">Time</span>
              {loadingSlots ? (
                <p className="mt-1.5 text-xs text-ink-soft">Loading times…</p>
              ) : slots.length === 0 ? (
                <p className="mt-1.5 text-xs text-ink-soft">No openings this day.</p>
              ) : (
                <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                  {slots.map((s) => (
                    <button
                      type="button"
                      key={s.start}
                      onClick={() => setStartsAt(s.start)}
                      className={`rounded-md border py-1.5 font-mono text-[12px] ${
                        startsAt === s.start
                          ? "border-moss bg-moss text-white"
                          : "border-stone text-ink"
                      }`}
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

            <div className="space-y-3 border-t border-stone-soft pt-4">
              <label className="block">
                <span className="text-[12px] font-semibold text-ink">Client name</span>
                <input
                  required
                  className="input"
                  value={client.fullName}
                  onChange={(e) => setClient({ ...client, fullName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink">Client email</span>
                <input
                  required
                  type="email"
                  className="input"
                  value={client.email}
                  onChange={(e) => setClient({ ...client, email: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink">Client phone</span>
                <input
                  className="input"
                  value={client.phone}
                  onChange={(e) => setClient({ ...client, phone: e.target.value })}
                />
              </label>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={submit || !startsAt}
                className="rounded-md bg-moss px-4 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submit ? "Creating…" : "Create booking"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-stone-soft"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    )
}