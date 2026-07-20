import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import { db } from "@/db/client";
import { bookings, clients, services, resources } from "@/db/schema";
import { eq } from "drizzle-orm";
import BookingsPanel from "@/components/bookingPanel";

export default async function BookingsPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

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

  return <BookingsPanel initialBookings={rows} />;
}