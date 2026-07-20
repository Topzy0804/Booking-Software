'use client';

import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';

import type { Service, MergedSlot, Step, Client } from '@/types/book';
import { buildNextDays, toDateParam, mergeSlots } from '@/lib/bookingHelper';
import { ServiceStep } from '@/components/book/serviceStep';
import { DateTimeStep } from '@/components/book/dateTimeStep';
import { DetailsStep } from '@/components/book/detailStep';
import { ConfirmationStub } from '@/components/book/confirmationtub';

export default function BookingFlow({
  tenantName,
  services,
}: {
  tenantName: string;
  services: Service[];
}) {
  const [step, setStep] = useState<Step>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(
    services.length > 0 ? services[0] : null
  );

  const days = useMemo(() => buildNextDays(14), []);
  const [selectedDay, setSelectedDay] = useState(days[0]);

  const [slots, setSlots] = useState<MergedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<MergedSlot | null>(null);

  const [client, setClient] = useState<Client>({ fullName: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    startISO: string;
    resourceName: string;
  } | null>(null);

  useEffect(() => {
    if (step !== 2 || !selectedService) return;
    let cancelled = false;
    setLoadingSlots(true);
    setSelectedSlot(null);

    const dateParam = toDateParam(selectedDay);
    fetch(`/api/availability?serviceId=${selectedService.id}&date=${dateParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSlots(mergeSlots(data.availability ?? []));
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Failed to fetch availability');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, selectedService, selectedDay]);

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
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          resourceId: selectedSlot.resourceId,
          startsAt: selectedSlot.startISO,
          client,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Something went wrong, please try again.');
        return;
      }

      if (res.status ===409) {
        toast.error(data.error ?? 'something went wrong, please try again.');
        return;
      }

      setConfirmed({ startISO: selectedSlot.startISO, resourceName: selectedSlot.resourceName });
      setStep(4);
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
          <div className="w-full max-w-[420px]">
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
                  className={`h-[3px] w-6 rounded-full ${s <= step ? "bg-moss" : "bg-stone"}`}
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
                slots={slots}
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
  )
}