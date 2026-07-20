import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import { db } from "@/db/client";
import { resources, services } from "@/db/schema";
import { eq } from "drizzle-orm";
import StaffPanel from "@/components/staffPanel";

export default async function StaffPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

  const [resourceRows, serviceRows] = await Promise.all([
    db.select().from(resources).where(eq(resources.tenantId, auth.tenant.id)),
    db.select().from(services).where(eq(services.tenantId, auth.tenant.id)),
  ]);

  return <StaffPanel initialResources={resourceRows} services={serviceRows} />;
}