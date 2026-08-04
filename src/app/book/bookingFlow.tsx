'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

import type { Service, MergedSlot, Step, Client, Preference, StaffOption } from '@/types/book';
import { buildNextDays, toDateParam, mergeSlots, buildSlotsForResource } from '@/lib/bookingHelper';
import { ServiceStep } from '@/components/book/serviceStep';
import { DateTimeStep } from '@/components/book/dateTimeStep';
import { DetailsStep } from '@/components/book/detailStep';
import { ConfirmationStub } from '@/components/book/confirmationtub';

export default function BookingFlow({
  tenantName,
  services,
  timezone,
}: {
  tenantName: string;
  services: Service[];
  timezone: string;
}) {
  const [step, setStep] = useState<Step>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(
    services.length > 0 ? services[0] : null
  );

  const days = useMemo(() => buildNextDays(14, timezone), [timezone]);
  const [selectedDay, setSelectedDay] = useState(days[0]);

  // Staff preference: "any" keeps the fair auto-assign/shuffle
  // behavior (default); "specific" lets the client pick who they see.
  const [preference, setPreference] = useState<Preference>('any');
  const [allStaff, setAllStaff] = useState<{ id: string; name: string; serviceIds: string[] }[]>([]);
  const [chosenStaffId, setChosenStaffId] = useState<string>('');

  const [slots, setSlots] = useState<MergedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MergedSlot | null>(null);

  const [client, setClient] = useState<Client>({ fullName: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    startISO: string;
    resourceName: string;
    manageUrl: string;
  } | null>(null);

  // Load every staff member once, so "choose staff" can filter down
  // to whoever's actually qualified for the selected service.
  useEffect(() => {
    fetch('/api/resources')
      .then((res) => res.json())
      .then((data) => setAllStaff(data.resources ?? []))
      .catch(() => {});
  }, []);

  const qualifiedStaff: StaffOption[] = useMemo(
    () =>
      selectedService
        ? allStaff
            .filter((r) => r.serviceIds.includes(selectedService.id))
            .map((r) => ({ id: r.id, name: r.name }))
        : [],
    [allStaff, selectedService]
  );

  // Keep a valid default without copying derived staff data into state.
  const effectiveStaffId = qualifiedStaff.some((staff) => staff.id === chosenStaffId)
    ? chosenStaffId
    : (qualifiedStaff[0]?.id ?? '');

  const displayedSlots = preference === 'specific' && !effectiveStaffId ? [] : slots;

  useEffect(() => {
    if (step !== 2 || !selectedService) return;
    const service = selectedService;
    let cancelled = false;
    async function loadSlots() {
      setLoadingSlots(true);
      setSelectedSlot(null);

      try {
        const dateParam = toDateParam(selectedDay);
        const response = await fetch(`/api/availability?serviceId=${service.id}&date=${dateParam}`);
        const data = await response.json();

        if (cancelled) return;
        const availability = data.availability ?? [];
        setSlots(
          preference === 'specific'
            ? buildSlotsForResource(availability, effectiveStaffId)
            : mergeSlots(availability)
        );
      } catch {
        if (!cancelled) {
          toast.error('Failed to fetch availability');
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }

    void loadSlots();

    return () => {
      cancelled = true;
    };
  }, [step, selectedService, selectedDay, preference, effectiveStaffId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService) return;
    if (!selectedSlot) {
      toast.error('Please choose a time slot again.');
      setStep(2);
      return;
    }
    setSubmitting(true);
    try {
      // Try every staff member who was free for this slot, in order,
      // before giving up -- covers the gap between "we loaded
      // availability" and "the client actually submitted". With
      // preference "specific" this list has exactly one candidate, so
      // the loop just runs once; no special-casing needed either way.
      for (const candidate of selectedSlot.candidates) {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: selectedService.id,
            resourceId: candidate.resourceId,
            startsAt: selectedSlot.startISO,
            client,
          }),
        });
        const data = await res.json();

        if (res.status === 409) continue;
        if (!res.ok) {
          toast.error(data.error ?? 'Something went wrong, please try again.');
          return;
        }

        setConfirmed({ startISO: selectedSlot.startISO, resourceName: candidate.resourceName, manageUrl: data.manageUrl });
        setStep(4);
        return;
      }

      toast.error('That time just filled up. Please pick another.');
      setSelectedSlot(null);
      setStep(2);
      setSlots((prev) => prev.filter((s) => s.startISO !== selectedSlot.startISO));
    } finally {
      setSubmitting(false);
    }
  }

  if (services.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-24 text-center">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">
            {tenantName} isn&rsquo;t taking bookings yet
          </h1>
          <p className="mt-2 max-w-sm text-sm text-ink-soft">
            This business hasn&rsquo;t added any services to their booking page yet. Check back
            soon.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 justify-center px-4 py-11">
      <div className="w-full max-w-105">
        <div className="mb-7 text-center">
          <p className="font-mono text-[11px] uppercase tracking-wide text-moss">
            Book an appointment
          </p>
          <div className="font-display text-xl font-semibold text-ink">{tenantName}</div>
        </div>

        <div className="mb-7 flex justify-center gap-1.5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-0.75 w-6 rounded-full ${s <= step ? "bg-moss" : "bg-stone"}`}
            />
          ))}
        </div>

        {step === 1 && selectedService && (
          <ServiceStep
            services={services}
            selected={selectedService}
            onSelect={setSelectedService}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <DateTimeStep
            days={days}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            preference={preference}
            onPreferenceChange={setPreference}
            qualifiedStaff={qualifiedStaff}
            chosenStaffId={effectiveStaffId}
            onChooseStaff={setChosenStaffId}
            slots={displayedSlots}
            loading={loadingSlots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && selectedService && (
          <DetailsStep
            client={client}
            setClient={setClient}
            submitting={submitting}
            priceCents={selectedService.priceCents}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && confirmed && selectedService && (
          <ConfirmationStub
            serviceName={selectedService.name}
            durationMinutes={selectedService.durationMinutes}
            priceCents={selectedService.priceCents}
            resourceName={confirmed.resourceName}
            startISO={confirmed.startISO}
            clientEmail={client.email}
          />
        )}
      </div>
    </main>
  );
}
