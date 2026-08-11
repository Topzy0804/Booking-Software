'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
};

const WEEKDAY_LABEL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StaffProfilePanel({
  resource,
  services,
  workingHours,
}: {
  resource: {
    id: string;
    name: string;
    email: string | null;
    title: string | null;
    bio: string | null;
    phone: string | null;
    serviceIds: string[];
  };
  services: Service[];
  workingHours: { dayOfWeek: number; startTime: string; endTime: string }[];
}) {
  const [title, setTitle] = useState(resource.title ?? '');
  const [bio, setBio] = useState(resource.bio ?? '');
  const [phone, setPhone] = useState(resource.phone ?? '');
  const [serviceIds, setServiceIds] = useState<string[]>(resource.serviceIds);
  const [submitting, setSubmitting] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  function toggleService(id: string) {
    setServiceIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/staffProfile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, bio, phone, serviceIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Couldn't save your profile");
        return;
      }

      setIsEditOpen(false);
      toast.success('Profile updated');
    } finally {
      setSubmitting(false);
    }
  }

  const hoursByDay = new Map(workingHours.map((h) => [h.dayOfWeek, h]));
  const selectedServices = services.filter((service) => serviceIds.includes(service.id));

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">My profile</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            This is the information clients see when booking with you.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsEditOpen(true)}
          className="shrink-0 rounded-md bg-moss px-4 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark"
        >
          Edit profile
        </Button>
      </div>

      <div className="mb-5 rounded-lg border border-stone bg-paper-raised p-6">
        <div className="flex items-start gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-moss text-xl font-semibold text-white"
            aria-hidden="true"
          >
            {resource.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-ink">{resource.name}</h3>
            {title && <p className="mt-0.5 text-[13px] text-ink-soft">{title}</p>}
            <p className="mt-1 text-[13px] text-ink-soft">{resource.email ?? '—'}</p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-stone bg-paper-raised p-5">
        <h3 className="text-[13px] font-semibold text-ink">Profile information</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="text-[11px] text-ink-soft">Name</div>
            <div className="mt-0.5 text-[13px] font-semibold text-ink">{resource.name}</div>
            <div className="mt-1 text-[10px] text-ink-soft">Managed by your business owner.</div>
          </div>

          <div>
            <div className="text-[11px] text-ink-soft">Email</div>
            <div className="mt-0.5 wrap-break-word text-[13px] font-semibold text-ink">
              {resource.email ?? '—'}
            </div>
            <div className="mt-1 text-[10px] text-ink-soft">Managed by your business owner.</div>
          </div>

          <div>
            <div className="text-[11px] text-ink-soft">Professional title</div>
            <div className="mt-0.5 text-[13px] font-semibold text-ink">{title || '—'}</div>
          </div>

          <div>
            <div className="text-[11px] text-ink-soft">Phone</div>
            <div className="mt-0.5 text-[13px] font-semibold text-ink">{phone || '—'}</div>
          </div>

          <div className="sm:col-span-2">
            <div className="text-[11px] text-ink-soft">Bio</div>
            <p className="mt-1 whitespace-pre-wrap text-[13px] leading-6 text-ink">
              {bio || 'No bio added yet.'}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 rounded-lg border border-stone bg-paper-raised p-5">
        <h3 className="text-[13px] font-semibold text-ink">Services</h3>
        <p className="mt-0.5 text-[11px] text-ink-soft">
          Services clients can book with you.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {selectedServices.length > 0 ? (
            selectedServices.map((service) => (
              <span
                key={service.id}
                className="rounded-full border border-moss bg-moss px-3 py-1 text-[12px] font-medium text-white"
              >
                {service.name}
              </span>
            ))
          ) : (
            <span className="text-[12px] text-ink-soft">No services selected.</span>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-stone bg-paper-raised p-5">
        <h3 className="text-[13px] font-semibold text-ink">Working hours</h3>
        <p className="mb-3 mt-0.5 text-[11px] text-ink-soft">
          Set by your business owner.
        </p>

        <div className="divide-y divide-stone">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const h = hoursByDay.get(day);

            return (
              <div key={day} className="flex justify-between gap-4 py-2 text-[13px]">
                <span className="text-ink-soft">{WEEKDAY_LABEL[day]}</span>
                <span className="font-mono text-ink">{h ? `${h.startTime} – ${h.endTime}` : 'Off'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {isEditOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !submitting) setIsEditOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-stone bg-paper-raised shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone px-5 py-4">
              <div>
                <h3 id="edit-profile-title" className="text-lg font-semibold text-ink">
                  Edit profile
                </h3>
                <p className="mt-0.5 text-[12px] text-ink-soft">
                  Update the information clients see when booking with you.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setIsEditOpen(false)}
                disabled={submitting}
                aria-label="Close edit profile"
                className="rounded-md px-2 py-1 text-lg text-ink-soft hover:bg-stone/30 hover:text-ink disabled:opacity-50"
              >
                ×
              </Button>
            </div>

            <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
              <div className="space-y-4 overflow-y-auto p-5">
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink">Professional title</span>
                  <input
                    className="input mt-1"
                    placeholder="e.g. Senior Stylist, Physiotherapist"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="text-[12px] font-semibold text-ink">Bio</span>
                  <textarea
                    className="input mt-1 min-h-30 resize-y"
                    placeholder="A couple of sentences clients will see when choosing you."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={600}
                  />
                  <div className="mt-1 text-right text-[10px] text-ink-soft">
                    {bio.length}/600
                  </div>
                </label>

                <label className="block">
                  <span className="text-[12px] font-semibold text-ink">Phone</span>
                  <input
                    className="input mt-1"
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>

                <div>
                  <span className="text-[12px] font-semibold text-ink">Services I offer</span>
                  <p className="mt-0.5 text-[11px] text-ink-soft">
                    Select the services clients can book with you.
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {services.map((service) => {
                      const selected = serviceIds.includes(service.id);

                      return (
                        <Button
                          type="button"
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          aria-pressed={selected}
                          className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${
                            selected
                              ? 'border-moss bg-moss text-white'
                              : 'border-stone text-ink-soft hover:border-moss hover:text-ink'
                          }`}
                        >
                          {selected ? '✓ ' : ''}
                          {service.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 justify-end gap-2 border-t border-stone px-5 py-4">
                <Button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  disabled={submitting}
                  className="rounded-md border border-stone px-4 py-2 text-[13px] font-semibold text-ink-soft hover:bg-stone/20 disabled:opacity-50"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-moss px-4 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
                >
                  {submitting ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}