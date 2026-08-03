import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { bookings, clients, services, resources, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyBookingToken } from "@/lib/bookingToken";
import { rescheduleBooking, BookingConflictError } from "@/lib/booking";
import { sendBookingCancellationEmail } from "@/lib/email";
import { z } from "zod";

// How close to the appointment self-service cancel/reschedule is
// blocked. A staff member can still override via the dashboard (that
// PATCH route has no such restriction) -- this cutoff only applies to
// the client-facing, no-login path.
const CUTOFF_HOURS = 2;

async function loadBookingDetails(bookingId: string) {
  const [row] = await db
    .select({
      id: bookings.id,
      tenantId: bookings.tenantId,
      serviceId: bookings.serviceId,
      resourceId: bookings.resourceId,
      startsAt: bookings.startsAt,
      endsAt: bookings.endsAt,
      status: bookings.status,
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
    .where(eq(bookings.id, bookingId));
  return row ?? null;
}

function isPastCutoff(startsAt: Date): boolean {
  const hoursUntil = (startsAt.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntil < CUTOFF_HOURS;
}

// GET -- fetch the booking's details for the manage page to display.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bookingId = verifyBookingToken(token);
  if (!bookingId) {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 401 });
  }

  const details = await loadBookingDetails(bookingId);
  if (!details) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({
    booking: details,
    canModify: details.status === "confirmed" && !isPastCutoff(details.startsAt),
    cutoffHours: CUTOFF_HOURS,
  });
}

const patchSchema = z.union([
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("reschedule"), startsAt: z.string() }),
]);

// PATCH -- cancel or reschedule, both gated by the token AND the
// cutoff window (checked server-side -- never trust a client-side
// countdown alone for something that changes real data).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bookingId = verifyBookingToken(token);
  if (!bookingId) {
    return NextResponse.json({ error: "This link is invalid or has expired." }, { status: 401 });
  }

  const existing = await loadBookingDetails(bookingId);
  if (!existing) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (existing.status !== "confirmed") {
    return NextResponse.json({ error: "This booking can no longer be changed." }, { status: 409 });
  }
  if (isPastCutoff(existing.startsAt)) {
    return NextResponse.json(
      { error: `Changes aren't allowed within ${CUTOFF_HOURS} hours of your appointment. Please contact ${existing.tenantName} directly.` },
      { status: 409 }
    );
  }

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (parsed.data.action === "cancel") {
    await db.update(bookings).set({ status: "cancelled", updatedAt: new Date() }).where(eq(bookings.id, bookingId));

    await sendBookingCancellationEmail({
      to: existing.clientEmail,
      clientName: existing.clientName,
      tenantName: existing.tenantName,
      serviceName: existing.serviceName,
      resourceName: existing.resourceName,
      startsAt: existing.startsAt,
      durationMinutes: existing.durationMinutes,
      priceCents: existing.priceCentsSnapshot,
      cancelledBy: "client",
    });

    return NextResponse.json({ ok: true });
  }

  // Reschedule
  try {
    await rescheduleBooking({ bookingId, newStartsAt: new Date(parsed.data.startsAt) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}