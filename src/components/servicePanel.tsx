'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import EmptyState from './emptyState';
import type { Service } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/currency';

const DEFAULT_FORM = { name: '', durationMinutes: 30, priceCents: 0 };


export default function Services({ initialServices }: { initialServices: Service[] }) {
  const [service, setService] = useState(initialServices);
  const [showForm, setShowForm] = useState(initialServices.length === 0);
  const [form, setForm] = useState({ name: '', durationMinutes: 30, priceCents: 0 });
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [removingServiceId, setRemovingServiceId] = useState<string | null>(null)

  function openAddForm() {
    setEditingServiceId(null);
    setForm(DEFAULT_FORM);
    setShowForm(true);
  }

  function openEditForm(s: Service) {
    setEditingServiceId(s.id);
    setForm({
      name: s.name,
      durationMinutes: s.durationMinutes,
      priceCents: s.priceCents,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false)
    setEditingServiceId(null);
    setForm(DEFAULT_FORM);
  }

  async function handleAdd(e: React.FormEvent) {
  e.preventDefault();
  setSubmitting(true);
  try {
    const res = await fetch(editingServiceId ? `/api/services/${editingServiceId}` : '/api/services', {
      method: editingServiceId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Couldn't save that service");
      return;
    }

    if (editingServiceId) {
      setService((cur) => cur.map((s) => (s.id === editingServiceId ? data.service : s)));
      toast.success('Service updated');
    } else {
      setService((cur) => [...cur, data.service]);
      toast.success('Service added');
    }
    closeForm();
  } finally {
    setSubmitting(false);
  }
}
  async function handleRemove(s: Service) {
    if (!confirm(`remove '${s.name}'? it ill disapeare from your booking page, but past bookings for it are kept.`)) {
      return;
    }
    setRemovingServiceId(s.id);
    try {
      const res = await fetch(`/api/services/${s.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "couldn't remove this service");
        return;
      }

      setService((cur) => cur.filter((svc) => svc.id !== s.id));
      toast.success('service removed');
    } finally {
      setRemovingServiceId(null);
    }
  }

  return (
    <div>
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">Services</h2>
              <p className="mt-1 text-xs text-ink-soft">
                What clients can book on your public page.
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="rounded-md border border-stone px-3.5 py-2 text-xs font-medium text-ink hover:bg-stone-soft"
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
                <span className="text-xs font-semibold text-ink">Duration (min)</span>
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
                <span className="text-xs font-semibold text-ink">Price{formatPrice(form.priceCents)}</span>
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
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-moss px-4 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
                >
                  {submitting ? "Adding…" : "Add service"}
                </Button>
                {service.length > 0 && (
                  <Button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-md px-4 py-2 text-[13px] font-medium text-ink-soft hover:bg-stone-soft"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
    
          {service.length === 0 && !showForm ? (
            <EmptyState
              title="No services yet"
              body="Clients can't book anything until you add at least one service with a duration and price."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {service.map((s) => (
                <Card key={s.id} className="border-stone bg-paper-raised">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base font-semibold text-ink">{s.name}</CardTitle>
                      <div className="font-mono text-moss">{formatPrice(s.priceCents)}</div>
                    </div>
                  </CardHeader>
                  <CardContent className='flex items-center justify-between'>
                    <div className="text-[12px] text-ink-soft">{s.durationMinutes} minutes</div>
                    <div className='flex shrink-0 gap-1'>
                      <Button
                      onClick={() => openEditForm(s)}
                      className='rounded-md px-2 py-1 text-xs hover:bg-stone-soft font-medium text-ink-soft'
                      >Edit</Button>
                      <Button
                      disabled={removingServiceId === s.id}
                      onClick={() => handleRemove(s)}
                      className='rounded-md px-2 py-1 text-xs hover:bg-stone-soft font-medium text-ink-soft disabled:opacity-50'
                      >Remove</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
  )
}