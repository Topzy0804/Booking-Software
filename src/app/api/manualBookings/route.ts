import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { services, clients, resources } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireTenantSession } from '@/lib/requireAuth';
import { z } from 'zod';
import { createBooking, BookingConflictError } from '@/lib/booking';
import { sendBookingConfirmationEmail } from '@/lib/email';
import { createBookingManageToken, buildManageUrl } from '@/lib/bookingToken';


const schema = z.object({
  serviceId: z.string(),
  resourceId: z.string(),
  startsAt: z.string(),
  client: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  if (auth.session.role !== 'owner') {
    return NextResponse.json(
      { error: 'Only the business owner can create bookings manually.' },
      { status: 403 }
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { serviceId, resourceId, startsAt, client } = parsed.data;

  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.tenantId, auth.tenant.id)));
  if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

  const [resource] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.id, resourceId), eq(resources.tenantId, auth.tenant.id)));
  if (!resource) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });

  const startDate = new Date(startsAt);
  const endDate = new Date(startDate.getTime() + service.durationMinutes * 60000);

  let [existingClient] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.tenantId, auth.tenant.id), eq(clients.email, client.email)));

    if (!existingClient) {
      [existingClient] = await db
        .insert(clients)
        .values({
          tenantId: auth.tenant.id,
          fullName: client.fullName,
          email: client.email,
          phone: client.phone,
        })
        .returning();
    } 

    try {
      const booking = await createBooking({
        tenantId: auth.tenant.id,
        clientId: existingClient.id,
        serviceId,
        resourceId,
        startsAt: startDate,
        endsAt: endDate,
        priceCentsSnapshot: service.priceCents,
    });

    const manageUrl = buildManageUrl(auth.tenant.subdomain, createBookingManageToken(booking.id));

    await sendBookingConfirmationEmail({
      to: client.email,
      clientName: client.fullName,
      serviceName: service.name,
      tenantName: auth.tenant.name,
      resourceName: resource.name,
      startsAt: startDate,
      manageUrl,
      priceCents: service.priceCents,
      durationMinutes: service.durationMinutes,
    });

    return NextResponse.json(
      { booking, resourceName: resource.name, manageUrl }
    );
} catch (err) {
  if (err instanceof BookingConflictError) {
    return NextResponse.json(
      { error: 'That slot has been taken. please pick another time.' }, 
      { status: 409 }
    );
  }
 throw err;
}
}