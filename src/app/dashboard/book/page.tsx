import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import { getStaffScope } from "@/lib/staffScope";
import { db } from "@/db/client";
import { bookings, clients, services, resources } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import BookingsPanel from "@/components/bookingPanel";

export default async function BookingsPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

  const { canViewAll, myResourceId } = await getStaffScope(
    auth.session.userId,
    auth.tenant.id,
    auth.session.role
  );

  const allServices = await db
    .select()
    .from(services)
    .where(eq(services.tenantId, auth.tenant.id));

  if (!canViewAll && !myResourceId) {
    return (
      <BookingsPanel initialBookings={[]} services={allServices} canCreateBookings={false} />
    );
  }

  const bookingsWhere = canViewAll
    ? eq(bookings.tenantId, auth.tenant.id)
    : and(eq(bookings.tenantId, auth.tenant.id), eq(bookings.resourceId, myResourceId!));

  const rows = await db
    .select({
      id: bookings.id,
      serviceId: bookings.serviceId,
      resourceId: bookings.resourceId,
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
    .where(bookingsWhere)
    .orderBy(bookings.startsAt);

  return (
    <BookingsPanel
      initialBookings={rows}
      services={allServices}
      canCreateBookings={canViewAll}
    />
  );
}