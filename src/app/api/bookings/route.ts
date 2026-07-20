import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { services, clients, bookings, resources } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenants } from "@/lib/tenant";
import { requireTenantSession } from "@/lib/requireAuth";
import { createBooking, BookingConflictError } from "@/lib/booking";
import { z } from "zod";

// Staff-facing: list this tenant's bookings, newest first.
export async function GET() {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await db
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
    })
    .from(bookings)
    .innerJoin(clients, eq(clients.id, bookings.clientId))
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(resources, eq(resources.id, bookings.resourceId))
    .where(eq(bookings.tenantId, auth.tenant.id))
    .orderBy(bookings.startsAt);

  return NextResponse.json({ bookings: rows });
}

const schema = z.object({
  serviceId: z.string(),
  resourceId: z.string(),
  startsAt: z.string(), // ISO
  client: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
});

// Public: a client books an open slot from the tenant's booking page.
export async function POST(req: NextRequest) {
  const tenant = await getCurrentTenants();
  if (!tenant) return NextResponse.json({ error: "Unknown business" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { serviceId, resourceId, startsAt, client } = parsed.data;

  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.tenantId, tenant.id)));
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const startDate = new Date(startsAt);
  const endDate = new Date(startDate.getTime() + service.durationMinutes * 60000);

  // Find-or-create the client by (tenant, email)
  let [existingClient] = await db
    .select()
    .from(clients)
    .where(and(eq(clients.tenantId, tenant.id), eq(clients.email, client.email)));

  if (!existingClient) {
    [existingClient] = await db
      .insert(clients)
      .values({ tenantId: tenant.id, fullName: client.fullName, email: client.email, phone: client.phone })
      .returning();
  }

  try {
    const booking = await createBooking({
      tenantId: tenant.id,
      clientId: existingClient.id,
      serviceId,
      resourceId,
      startsAt: startDate,
      endsAt: endDate,
      priceCentsSnapshot: service.priceCents,
    });

    return NextResponse.json({ booking });
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}