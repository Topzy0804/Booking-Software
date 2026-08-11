import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import { getStaffScope } from "@/lib/staffScope";
import { db } from "@/db/client";
import { clients, bookings } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import ClientsPanel from "@/components/clientPanel";

export default async function ClientsPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

  const { canViewAll, myResourceId } = await getStaffScope(
    auth.session.userId,
    auth.tenant.id,
    auth.session.role
  );

  if (!canViewAll && !myResourceId) {
    return <ClientsPanel clients={[]} />;
  }

  const rows = canViewAll
    ? await db
        .select({
          id: clients.id,
          fullName: clients.fullName,
          email: clients.email,
          phone: clients.phone,
      bookingCount: count(bookings.id),
    })
    .from(clients)
    .leftJoin(bookings, eq(bookings.clientId, clients.id))
    .where(eq(clients.tenantId, auth.tenant.id))
    .groupBy(clients.id, clients.fullName, clients.email, clients.phone)
    : await db
      .select({
        id: clients.id,
        fullName: clients.fullName,
        email: clients.email,
        phone: clients.phone,
        bookingCount: count(bookings.id),
      })
      .from(clients)
      .innerJoin(
        bookings,
        and(eq(bookings.clientId, clients.id), eq(bookings.resourceId, myResourceId!))
      )
      .where(eq(clients.tenantId, auth.tenant.id))
      .groupBy(clients.id, clients.fullName, clients.email, clients.phone);


  const normalized = rows.map((r) => ({ ...r, bookingCount: Number(r.bookingCount) }));

  return <ClientsPanel clients={normalized} />;
}