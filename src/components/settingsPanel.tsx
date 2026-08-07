'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function SettingsPanel({
  tenantName,
  subdomain,
  timezone,
}: {
  tenantName: string;
  subdomain: string;
  timezone: string;
}) {
  const [name, setName] = useState(tenantName);
  const [tz, setTz] = useState(timezone);
  const [submitting, setSubmitting] = useState(false);

  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      return [timezone];
    }
  }, [timezone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, timezone: tz }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'could not save settings');
        return;
      }
      toast.success('Settings saved');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">Settings</h2>
        <p className="mt-1 text-xs text-ink-soft">Business details and defaults.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-stone bg-paper-raised p-5">
        <label className="block">
          <span className="text-xs font-semibold text-ink">Business name</span>
          <input
            required
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <div>
          <span className="text-xs font-semibold text-ink">Booking page address</span>
          <div className="mt-1 flex items-center gap-1">
            <span className="rounded-md border border-stone bg-stone-soft px-3 py-2 font-mono text-[13px] text-ink-soft">
              {subdomain}
            </span>
          </div>
          <span className="mt-1 block text-xs text-ink-soft">
            Contact support to change this -- it&rsquo;s tied to your booking links and existing
            confirmation emails.
          </span>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-ink">Timezone</span>
          <select className="input" value={tz} onChange={(e) => setTz(e.target.value)}>
            {timezones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-ink-soft">
            Used to work out your staff&rsquo;s working hours and what &ldquo;today&rdquo; means on
            your booking page -- get this wrong and every appointment time will be off.
          </span>
        </label>

        <Button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-moss px-4 py-2 text-xs font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  )
}