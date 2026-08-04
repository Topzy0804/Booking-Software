import { db } from "@/db/client";
import { workingHours, availabilityExceptions, bookings } from "@/db/schema";
import { and, eq, gte, lte, ne } from "drizzle-orm";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export type Slot = { start: Date; end: Date };

/**
 * Computes bookable start-time slots for a given resource on a given
 * CALENDAR day in the TENANT'S OWN TIMEZONE -- not UTC, and not the
 * server's or client's local timezone.
 *
 * Why this matters concretely: a staff member's working hours are
 * entered as "09:00" in the dashboard, meaning 9am *where the
 * business is*. Storage is UTC throughout (Postgres timestamptz,
 * unchanged) -- timezone only matters at this boundary, converting
 * between "wall-clock time in Lagos" and "the correct UTC instant".
 * Getting this wrong doesn't crash anything; it just silently shows
 * the wrong times, which is worse.
 *
 * Order of operations (each layer narrows the previous one):
 *  1. Start from the resource's recurring working hours for that
 *     weekday, AS OBSERVED IN THE TENANT'S TIMEZONE (a date that's
 *     "Tuesday" in Lagos might already be "Wednesday" in UTC near
 *     midnight -- getUTCDay() would silently pick the wrong day).
 *  2. Subtract one-off exceptions (time off / holidays) that overlap
 *     the day.
 *  3. Subtract existing confirmed bookings (+ the service's
 *     buffer-after).
 *  4. Slice what's left into slots at the service's duration,
 *     stepping every 15 minutes.
 */
export async function getAvailableSlots(params: {
  resourceId: string;
  day: Date; // any instant on the target calendar day
  durationMinutes: number;
  bufferAfterMinutes: number;
  timezone: string; // IANA name, e.g. "Africa/Lagos" -- from tenants.timezone
  excludeBookingId?: string;
}): Promise<Slot[]> {
  const { resourceId, day, durationMinutes, bufferAfterMinutes, timezone, excludeBookingId } =
    params;

  // toZonedTime shifts the instant so that reading it back with plain
  // JS getters (getFullYear/getMonth/getDate/getDay) yields the wall-
  // clock values AS OBSERVED IN `timezone` -- this is what makes
  // "which weekday is this, in Lagos" answerable without a timezone-
  // aware getDay() call existing anywhere in the standard library.
  const zonedDay = toZonedTime(day, timezone);
  const year = zonedDay.getFullYear();
  const month = zonedDay.getMonth();
  const date = zonedDay.getDate();
  const dayOfWeek = zonedDay.getDay(); // 0 = Sunday, in the TENANT's calendar

  // The actual UTC instants marking the start/end of this calendar
  // day AS OBSERVED IN THE TENANT'S TIMEZONE -- not midnight UTC.
  const dayStart = fromZonedTime(new Date(year, month, date, 0, 0, 0), timezone);
  const dayEnd = fromZonedTime(new Date(year, month, date + 1, 0, 0, 0), timezone);

  // 1. Recurring working hours for this weekday
  const hours = await db
    .select()
    .from(workingHours)
    .where(
      and(eq(workingHours.resourceId, resourceId), eq(workingHours.dayOfWeek, dayOfWeek))
    );

  if (hours.length === 0) return [];

  let candidateIntervals: Slot[] = hours.map((h) => ({
    start: timeOnDay(year, month, date, h.startTime, timezone),
    end: timeOnDay(year, month, date, h.endTime, timezone),
  }));

  // 2. Subtract one-off exceptions overlapping this day
  const exceptions = await db
    .select()
    .from(availabilityExceptions)
    .where(
      and(
        eq(availabilityExceptions.resourceId, resourceId),
        lte(availabilityExceptions.startsAt, dayEnd),
        gte(availabilityExceptions.endsAt, dayStart)
      )
    );

  for (const ex of exceptions) {
    candidateIntervals = subtractInterval(candidateIntervals, {
      start: ex.startsAt,
      end: ex.endsAt,
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
        lte(bookings.startsAt, dayEnd),
        gte(bookings.endsAt, dayStart),
        ...(excludeBookingId ? [ne(bookings.id, excludeBookingId)] : [])
      )
    );

  for (const b of existing) {
    // Duration arithmetic (adding minutes) is timezone-agnostic --
    // only wall-clock instants need conversion, not elapsed time.
    const bufferedEnd = new Date(b.endsAt.getTime() + bufferAfterMinutes * 60000);
    candidateIntervals = subtractInterval(candidateIntervals, {
      start: b.startsAt,
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

// Converts "09:00" wall-clock on a given tenant-local calendar date
// into the correct UTC instant. This is the fix for the bug where a
// Lagos business's "9am" was previously being stored/compared as 9am
// UTC (i.e. 10am Lagos time) regardless of the tenant's real timezone.
function timeOnDay(year: number, month: number, date: number, hhmm: string, timezone: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  return fromZonedTime(new Date(year, month, date, h, m, 0), timezone);
}

// Subtracts `cut` from every interval in `intervals`, splitting an
// interval in two if the cut falls in the middle of it.
function subtractInterval(intervals: Slot[], cut: Slot): Slot[] {
  const result: Slot[] = [];
  for (const iv of intervals) {
    if (cut.end <= iv.start || cut.start >= iv.end) {
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