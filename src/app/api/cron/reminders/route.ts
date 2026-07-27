import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/client";
import { bookings, clients, services, resources, tenants } from "@/db/schema";
import { eq, and, gte, lt, isNull } from "drizzle-orm";
import { sendBookingReminderEmail } from "@/lib/email";

const WINDOW_START_HOURS = 23;
const WINDOW_END_HOURS = 25;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() + WINDOW_START_HOURS * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + WINDOW_END_HOURS * 60 * 60 * 1000);

  const due = await db
    .select({
      id: bookings.id,
      startsAt: bookings.startsAt,
      priceCentsSnapshot: bookings.priceCentsSnapshot,
      clientName: clients.fullName,
      clientEmail: clients.email,
      serviceName: services.name,
      durationMinutes: services.durationMinutes,
      resourceName: resources.name,
      tenantName: tenants.name,
    })
    .from(bookings)
    .innerJoin(clients, eq(clients.id, bookings.clientId))
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(resources, eq(resources.id, bookings.resourceId))
    .innerJoin(tenants, eq(tenants.id, bookings.tenantId))
    .where(
      and(
        eq(bookings.status, "confirmed"),
        isNull(bookings.reminderSentAt),
        gte(bookings.startsAt, windowStart),
        lt(bookings.startsAt, windowEnd)
      )
    );

    let sent = 0;
    let failed = 0;

    for (const b of due) {
      const ok = await sendBookingReminderEmail({
        to: b.clientEmail,
        clientName: b.clientName,
        tenantName: b.tenantName,
        serviceName: b.serviceName,
        resourceName: b.resourceName,
        startsAt: b.startsAt,
        durationMinutes: b.durationMinutes,
        priceCents: b.priceCentsSnapshot,
      });
      if (ok) {
        await db.update(bookings).set({ reminderSentAt: new Date() }).where(eq(bookings.id, b.id));
        sent++;
      } else {
        failed++;
      }
    }

    return NextResponse.json({ checked: due.length, sent, failed });
}