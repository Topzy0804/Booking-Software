import type { MergedSlot } from '@/types/book';
import { toZonedTime } from 'date-fns-tz';

export function buildNextDays(count: number, timezone: string): Date[] {
  const out: Date[] = [];
  const nowInTenantTz = toZonedTime(new Date(), timezone);
  const today = new Date(nowInTenantTz.getFullYear(),
    nowInTenantTz.getMonth(), nowInTenantTz.getDate());
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
  const seen = new Map<string, { resourceId: string; resourceName: string }[]>();
  for (const r of availability) {
    for (const slot of r.slots) {
      const existing = seen.get(slot.start) ?? [];
      existing.push({ resourceId: r.resourceId, resourceName: r.resourceName });
      seen.set(slot.start, existing);
    }
  }
  return [...seen.entries()]
    .map(([startISO, candidates]) => ({ startISO, candidates: shuffle(candidates) }))
    .sort((a, b) => a.startISO.localeCompare(b.startISO));
}


export function buildSlotsForResource(
  availability: { resourceId: string; resourceName: string; slots: { start: string; end: string }[] }[],
  resourceId: string
): MergedSlot[] {
  const match = availability.find((r) => r.resourceId === resourceId);
  if (!match) return [];
  return match.slots
    .map((slot) => ({
      startISO: slot.start,
      candidates: [{ resourceId: match.resourceId, resourceName: match.resourceName }],
    }))
    .sort((a, b) => a.startISO.localeCompare(b.startISO));
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}