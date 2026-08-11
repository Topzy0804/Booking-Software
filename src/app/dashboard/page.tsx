import { redirect } from "next/navigation";
import { requireTenantSession } from '@/lib/requireAuth';
import { getStaffScope } from '@/lib/staffScope';
import { db } from '@/db/client';
import { bookings, clients, services, resources } from '@/db/schema';
import { eq, count, and } from 'drizzle-orm';
import OverviewPanel from '@/components/overviewPanel';


export default async function DashboardIndexPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect('/login');

  const { canViewAll, myResourceId } = await getStaffScope(
    auth.session.userId,
    auth.tenant.id,
    auth.session.role
  );

  if (!canViewAll && !myResourceId) {
    return <OverviewPanel tenantName={auth.tenant.name} bookings={[]} clients={[]} />;
  }

  const bookingsWhere = canViewAll
    ? eq(bookings.tenantId, auth.tenant.id)
    : and(eq(bookings.tenantId, auth.tenant.id), eq(bookings.resourceId, myResourceId!));


  const bookingRows = await db
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

    const clientRows = canViewAll
      ? await db
        .select({
          id: clients.id,
          fullName: clients.fullName,
          email: clients.email,
          phone: clients.phone,
          bookingCount: count(bookings.id),
          createdAt: clients.createdAt,
        })
        .from(clients)
        .leftJoin(bookings, eq(bookings.clientId, clients.id))
        .where(eq(clients.tenantId, auth.tenant.id))
        .groupBy(clients.id, clients.fullName, clients.email, clients.phone, clients.createdAt)
        : await db
          .select({
            id: clients.id,
            fullName: clients.fullName,
            email: clients.email,
            phone: clients.phone,
            bookingCount: count(bookings.id),
            createdAt: clients.createdAt,
          })
          .from(clients)
          .innerJoin(
            bookings,
            and(eq(bookings.clientId, clients.id), eq(bookings.resourceId, myResourceId!))
          )
          .where(eq(clients.tenantId, auth.tenant.id))
          .groupBy(clients.id, clients.fullName, clients.email, clients.phone, clients.createdAt);

  const normalizedClients = clientRows
    .map((c) => ({ ...c, bookingCount: Number(c.bookingCount) }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
      <OverviewPanel
        tenantName={auth.tenant.name}
        bookings={bookingRows}
        clients={normalizedClients}
      />
    );
}