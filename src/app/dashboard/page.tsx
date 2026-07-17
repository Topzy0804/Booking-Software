import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import { db } from "@/db/client";
import { services, resources, bookings, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import DashboardClient from "./dashboardClient";

export default async function DashboardPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

  const [serviceRows, resourceRows, bookingRows] = await Promise.all([
    db.select().from(services).where(eq(services.tenantId, auth.tenant.id)),
    db.select().from(resources).where(eq(resources.tenantId, auth.tenant.id)),
    db
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
      .orderBy(bookings.startsAt),
  ]);

  return (
    <DashboardClient
      tenantName={auth.tenant.name}
      subdomain={auth.tenant.subdomain}
      initialServices={serviceRows}
      initialResources={resourceRows}
      initialBookings={bookingRows}
    />
  );
}