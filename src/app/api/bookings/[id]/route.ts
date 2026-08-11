import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { bookings, services, clients, resources, tenants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireTenantSession } from "@/lib/requireAuth";
import { rescheduleBooking, BookingConflictError } from "@/lib/booking";
import { z } from "zod";
import { sendBookingCancellationEmail } from "@/lib/email";
import { getStaffScope } from "@/lib/staffScope";


const schema = z.object({
  status: z.enum(["confirmed", "cancelled", "attended", "no_show"]).optional(),
  startsAt: z.string().optional(), 
  resourceId: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { status, startsAt, resourceId } = parsed.data;

  const [existing] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.tenantId, auth.tenant.id)));
  if (!existing) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (auth.session.role === 'staff') {
    const { myResourceId } = await getStaffScope(auth.session.userId, auth.tenant.id, auth.session.role);
    if (existing.resourceId !== myResourceId) {
      return NextResponse.json({ error: 'You can only manage your own bookings' }, { status: 403 });
    }
  }



  if (startsAt !== undefined || resourceId !== undefined) {
    const [service] = await db.select().from(services).where(eq(services.id, existing.serviceId));
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    const newStart = startsAt ? new Date(startsAt) : new Date(existing.startsAt);
    const newEnd = new Date(newStart.getTime() + service.durationMinutes * 60000);

    try {
      const updated = await rescheduleBooking({
        id,
        tenantId: auth.tenant.id,
        resourceId: resourceId ?? existing.resourceId,
        startsAt: newStart,
        endsAt: newEnd,
      });
      return NextResponse.json({ booking: updated });
    } catch (err) {
      if (err instanceof BookingConflictError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      throw err;
    }
  }

  // Status-only path (cancel / attended / no-show) -- no time change,
  if (status !== undefined) {
    const willCancel = status === 'cancelled' && existing.status !== 'cancelled';


    const [updated] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(bookings.id, id), eq(bookings.tenantId, auth.tenant.id)))
      .returning();

      if (willCancel) {
        const [details] = await db
          .select({
            clientName: clients.fullName,
            clientEmail: clients.email,
            serviceName: services.name,
            durationMinutes: services.durationMinutes,
            priceCentsSnapshot: bookings.priceCentsSnapshot,
            resourceName: resources.name,
            tenantName: tenants.name,
            startsAt: bookings.startsAt,
          })
          .from(bookings)
          .innerJoin(clients, eq(clients.id, bookings.clientId))
          .innerJoin(services, eq(services.id, bookings.serviceId))
          .innerJoin(resources, eq(resources.id, bookings.resourceId))
          .innerJoin(tenants, eq(tenants.id, bookings.tenantId))
          .where(and(eq(bookings.id, id), eq(bookings.tenantId, auth.tenant.id)));

        if (details) {
          await sendBookingCancellationEmail({
            to: details.clientEmail,
            clientName: details.clientName,
            tenantName: details.tenantName,
            serviceName: details.serviceName,
            resourceName: details.resourceName,
            startsAt: details.startsAt,
            durationMinutes: details.durationMinutes,
            priceCents: details.priceCentsSnapshot,
            cancelledBy: "staff",
          });
        }
      }
    return NextResponse.json({ booking: updated });
  }

  return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
}