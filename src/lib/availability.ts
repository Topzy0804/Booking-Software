import { db } from "@/db/client";
import { workingHours, availabilityExceptions, bookings } from "@/db/schema";
import { and, eq, gte, lte, ne } from "drizzle-orm";

export type Slot = { start: Date; end: Date };

export async function getAvailableSlots(params: {
  resourceId: string;
  day: Date; 
  durationMinutes: number;
  bufferAfterMinutes: number;
}): Promise<Slot[]> {
  const { resourceId, day, durationMinutes, bufferAfterMinutes } = params;

  const dayStart = new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate())
  );
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
  const dayOfWeek = dayStart.getUTCDay();

  // 1. Recurring working hours for this weekday
  const hours = await db
    .select()
    .from(workingHours)
    .where(
      and(eq(workingHours.resourceId, resourceId), eq(workingHours.dayOfWeek, dayOfWeek))
    );

  if (hours.length === 0) return [];

  let candidateIntervals: Slot[] = hours.map((h) => ({
    start: timeOnDay(dayStart, h.startTime),
    end: timeOnDay(dayStart, h.endTime),
  }));

  // 2. Subtract one-off exceptions overlapping this day
  const exceptions = await db
    .select()
    .from(availabilityExceptions)
    .where(
      and(
        eq(availabilityExceptions.resourceId, resourceId),
        lte(availabilityExceptions.startsAt, dayEnd.toISOString()),
        gte(availabilityExceptions.endsAt, dayStart.toISOString())
      )
    );

  for (const ex of exceptions) {
    candidateIntervals = subtractInterval(candidateIntervals, {
      start: new Date(ex.startsAt),
      end: new Date(ex.endsAt),
    });
  }

  // 3. Subtract existing confirmed bookings (with buffer-after applied)
  const existing = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.resourceId, resourceId),
        ne(bookings.status, "cancelled"),
        lte(bookings.startsAt, dayEnd.toISOString()),
        gte(bookings.endsAt, dayStart.toISOString())
      )
    );

  for (const b of existing) {
    const bufferedEnd = new Date(new Date(b.endsAt).getTime() + bufferAfterMinutes * 60000);
    candidateIntervals = subtractInterval(candidateIntervals, {
      start: new Date(b.startsAt),
      end: bufferedEnd,
    });
  }

  // 4. Slice remaining intervals into duration-sized slots on a 15-min grid
  const slots: Slot[] = [];
  const stepMs = 15 * 60 * 1000;
  const durationMs = durationMinutes * 60 * 1000;

  for (const interval of candidateIntervals) {
    let cursor = interval.start.getTime();
    const limit = interval.end.getTime();
    while (cursor + durationMs <= limit) {
      slots.push({ start: new Date(cursor), end: new Date(cursor + durationMs) });
      cursor += stepMs;
    }
  }

  return slots;
}

function timeOnDay(day: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  return new Date(
    Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), h, m)
  );
}

// Subtracts `cut` from every interval in `intervals`, splitting an
// interval in two if the cut falls in the middle of it.
function subtractInterval(intervals: Slot[], cut: Slot): Slot[] {
  const result: Slot[] = [];
  for (const iv of intervals) {
    if (cut.end <= iv.start || cut.start >= iv.end) {
      // No overlap
      result.push(iv);
      continue;
    }
    if (cut.start > iv.start) {
      result.push({ start: iv.start, end: new Date(Math.min(cut.start.getTime(), iv.end.getTime())) });
    }
    if (cut.end < iv.end) {
      result.push({ start: new Date(Math.max(cut.end.getTime(), iv.start.getTime())), end: iv.end });
    }
  }
  return result.filter((iv) => iv.end > iv.start);
}