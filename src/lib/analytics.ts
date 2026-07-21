import { bookings, resources, services, clients } from '@/db/schema';
import { db } from '@/db/client';
import { and, asc, eq, gte, lt, ne } from 'drizzle-orm';
import type { Booking } from '@/types/dashboard';

export async function getUpcomingBookings(tenantId: string, limit = 10): Promise<Booking[]> {
  const now = new Date();

  return db
    .select({
      id: bookings.id,
      startsAt: bookings.startsAt,
      endsAt: bookings.endsAt,
      status: bookings.status,
      priceCentsSnapshot: bookings.priceCentsSnapshot,
      clientName: clients.fullName,
      clientEmail: clients.email,
      serviceName: services.name,
      resourceName: resources.name,
      serviceId: bookings.serviceId,
      resourceId: bookings.resourceId,
    })
    .from(bookings)
    .innerJoin(clients, eq(clients.id, bookings.clientId))
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(resources, eq(resources.id, bookings.resourceId))
    .where(and(eq(bookings.tenantId, tenantId), eq(bookings.status, 'confirmed'), gte(bookings.startsAt, now)))
    .orderBy(asc(bookings.startsAt))
    .limit(limit);
}

export async function getThisWeekBookingCount(tenantId: string): Promise<number> {
  const { weekStart, weekEnd } = currentWeekBoundUTC();

  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.tenantId, tenantId),
        ne(bookings.status, 'cancelled'),
        gte(bookings.startsAt, weekStart),
        lt(bookings.startsAt, weekEnd)
      )
    )

  return rows.length;
}

export async function getThisWeekBokingCount(tenantId: string): Promise<number> {
  return getThisWeekBookingCount(tenantId);
}

export async function getNoShowCount(tenantId: string): Promise<number> {
  const rows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(eq(bookings.tenantId, tenantId), eq(bookings.status, 'no_show')));

  return rows.length;
}

function currentWeekBoundUTC(): { weekStart: Date; weekEnd: Date } {
  const now = new Date();
  const day = now.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diffToMonday)
  );
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { weekStart, weekEnd };
}