'use client';

import { useState } from 'react';
import { toast } from 'sonner';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
};

const WEEKDAY_LABEL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      toast.success('Profile updated');
    } finally {
      setSubmitting(false);
    }
  }

  const hoursByDay = new Map(workingHours.map((h) => [h.dayOfWeek, h]));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">My profile</h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          What clients see when booking with you, and which services you offer.
        </p>
      </div>

      <div className="mb-5 rounded-lg border border-stone bg-paper-raised p-5">
        <div className="grid grid-cols-2 gap-4 text-[13px] sm:grid-cols-3">
          <div>
            <div className="text-ink-soft">Name</div>
            <div className="font-semibold text-ink">{resource.name}</div>
          </div>
          <div>
            <div className="text-ink-soft">Email</div>
            <div className="font-semibold text-ink">{resource.email ?? "—"}</div>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-ink-soft">
          Name and email are managed by your business owner.
        </p>
      </div>

      <form onSubmit={handleSave} className="mb-5 space-y-4 rounded-lg border border-stone bg-paper-raised p-5">
        <label className="block">
          <span className="text-[12px] font-semibold text-ink">Title</span>
          <input
            className="input"
            placeholder="e.g. Senior Stylist, Physiotherapist"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label className="block">
          <span className="text-[12px] font-semibold text-ink">Bio</span>
          <textarea
            className="input min-h-screen"
            placeholder="A couple of sentences clients will see when choosing you."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={600}
          />
        </label>

        <label className="block max-w-xs">
          <span className="text-[12px] font-semibold text-ink">Phone</span>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>

        <div>
          <span className="text-[12px] font-semibold text-ink">Services I offer</span>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {services.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={`rounded-full border px-3 py-1 text-[12px] ${
                  serviceIds.includes(s.id) ? "border-moss bg-moss text-white" : "border-stone text-ink-soft"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-moss px-4 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>

      <div className="rounded-lg border border-stone bg-paper-raised p-5">
        <span className="text-[12px] font-semibold text-ink">Working hours</span>
        <p className="mb-3 mt-0.5 text-[11px] text-ink-soft">Set by your business owner.</p>
        <div className="space-y-1.5">
          {[1, 2, 3, 4, 5, 6, 0].map((day) => {
            const h = hoursByDay.get(day);
            return (
              <div key={day} className="flex justify-between text-[13px]">
                <span className="text-ink-soft">{WEEKDAY_LABEL[day]}</span>
                <span className="font-mono text-ink">{h ? `${h.startTime} – ${h.endTime}` : "Off"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  )
}