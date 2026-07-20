import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import { db } from "@/db/client";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import ServicesPanel from "@/components/servicePanel";

export default async function ServicesPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

  const rows = await db.select().from(services).where(eq(services.tenantId, auth.tenant.id));

  return <ServicesPanel initialServices={rows} />;
}