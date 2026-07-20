import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import { db } from "@/db/client";
import { clients, bookings } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import ClientsPanel from "@/components/clientPanel";

export default async function ClientsPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

  const rows = await db
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
    .groupBy(clients.id, clients.fullName, clients.email, clients.phone);

  const normalized = rows.map((r) => ({ ...r, bookingCount: Number(r.bookingCount) }));

  return <ClientsPanel clients={normalized} />;
}