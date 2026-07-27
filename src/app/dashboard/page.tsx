import { redirect } from "next/navigation";
import { requireTenantSession } from '@/lib/requireAuth';
import { db } from '@/db/client';
import { bookings, clients, services, resources } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import OverviewPanel from '@/components/overviewPanel';


export default async function DashboardIndexPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect('/login');

  const [bookingRows, clientRows] = await Promise.all([
    db
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
      .where(eq(bookings.tenantId, auth.tenant.id))
      .orderBy(bookings.startsAt),

      db
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
        .orderBy(clients.createdAt),
  ]);

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