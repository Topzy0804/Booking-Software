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
  availability: { resourceId: string; resourceName: string; stats: { start: string; end: string }[] }[]
): MergedSlot[] {
  const seen = new Map<string, MergedSlot>();
  for (const r of availability) {
    for (const slot of r.stats) {
      if (!seen.has(slot.start)) {
        seen.set(slot.start, { startISO: slot.start, resourceId: r.resourceId, resourceName: r.resourceName });
      }
    }
  }
  return[...seen.values()].sort((a, b) => a.startISO.localeCompare(b.startISO));
}