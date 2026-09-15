import { schedules } from "@trigger.dev/sdk";
import { db } from "@/db/client";
import {
  bookings,
  clients,
  services,
  resources,
  tenants,
} from "@/db/schema";
import { eq, and, gte, lt, isNull } from "drizzle-orm";
import { sendBookingReminderEmail } from "@/lib/email";

const REMINDER_START_HOURS = 23;
const REMINDER_END_HOURS = 25;

export const sendBookingReminders = schedules.task({
  id: "send-booking-reminders",

  cron: "*/30 * * * *",

  run: async () => {
    const now = new Date();

    const windowStart = new Date(
      now.getTime() + REMINDER_START_HOURS * 60 * 60 * 1000
    );

    const windowEnd = new Date(
      now.getTime() + REMINDER_END_HOURS * 60 * 60 * 1000
    );

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
      .innerJoin(
        clients,
        eq(clients.id, bookings.clientId)
      )
      .innerJoin(
        services,
        eq(services.id, bookings.serviceId)
      )
      .innerJoin(
        resources,
        eq(resources.id, bookings.resourceId)
      )
      .innerJoin(
        tenants,
        eq(tenants.id, bookings.tenantId)
      )
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

    for (const booking of due) {
      try {
        const currentBooking = await db
          .select({
            id: bookings.id,
            status: bookings.status,
            reminderSentAt: bookings.reminderSentAt,
          })
          .from(bookings)
          .where(eq(bookings.id, booking.id))
          .limit(1);

        const current = currentBooking[0];

        if (!current) {
          continue;
        }

        if (current.status !== "confirmed") {
          continue;
        }

        if (current.reminderSentAt) {
          continue;
        }

        const ok = await sendBookingReminderEmail({
          to: booking.clientEmail,
          clientName: booking.clientName,
          tenantName: booking.tenantName,
          serviceName: booking.serviceName,
          resourceName: booking.resourceName,
          startsAt: booking.startsAt,
          durationMinutes: booking.durationMinutes,
          priceCents: booking.priceCentsSnapshot,
        });

        if (!ok) {
          failed++;
          continue;
        }

        await db
          .update(bookings)
          .set({
            reminderSentAt: new Date(),
          })
          .where(
            and(
              eq(bookings.id, booking.id),
              eq(bookings.status, "confirmed"),
              isNull(bookings.reminderSentAt)
            )
          );

        sent++;
      } catch (error) {
        console.error(
          `Failed to process reminder for booking ${booking.id}`,
          error
        );

        failed++;
      }
    }

    // IMPORTANT:
    if (failed > 0) {
      throw new Error(
        `${failed} booking reminder(s) failed to send`
      );
    }

    return {
      checked: due.length,
      sent,
      failed,
    };
  },
});