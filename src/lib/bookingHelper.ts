import type { MergedSlot } from '@/types/book';

export function buildNextDays(count: number): Date[] {
  const out: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    out.push(new Date(today.getTime() + i * 86400000));
  }
  return out;
}

export function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function toDateParam(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function mergeSlots(
  availability: { resourceId: string; resourceName: string; slots: { start: string; end: string }[] }[]
): MergedSlot[] {
  const seen = new Map<string, MergedSlot>();
  for (const r of availability) {
    for (const slot of r.slots) {
      if (!seen.has(slot.start)) {
        seen.set(slot.start, {
          startISO: slot.start,
          resourceId: r.resourceId,
          resourceName: r.resourceName,
          resources: [{ resourceId: r.resourceId, resourceName: r.resourceName }],
        });
        continue;
      }

      const existing = seen.get(slot.start);
      if (!existing) {
        continue;
      }

      if (!existing.resources.some((resource) => resource.resourceId === r.resourceId)) {
        existing.resources.push({ resourceId: r.resourceId, resourceName: r.resourceName });
      }
    }
  }
  return [...seen.values()].sort((a, b) => a.startISO.localeCompare(b.startISO));
}