import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import { db } from "@/db/client";
import { resources, services, workingHours, serviceResources } from "@/db/schema";
import { eq } from "drizzle-orm";
import StaffPanel from "@/components/staffPanel";

export default async function StaffPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

  const [resourceRows, serviceRows] = await Promise.all([
    db.select().from(resources).where(eq(resources.tenantId, auth.tenant.id)),
    db.select().from(services).where(eq(services.tenantId, auth.tenant.id)),
  ]);

  const detailedResources = await Promise.all(
    resourceRows
      .filter((resource) => resource.isActive)
      .map(async (resource) => {
        const hours = await db
          .select()
          .from(workingHours)
          .where(eq(workingHours.resourceId, resource.id));
        const links = await db
          .select({ serviceId: serviceResources.serviceId })
          .from(serviceResources)
          .where(eq(serviceResources.resourceId, resource.id));

        return {
          ...resource,
          email: resource.email || undefined,
          workingHours: hours.map((hour) => ({
            dayOfWeek: hour.dayOfWeek,
            startTime: hour.startTime,
            endTime: hour.endTime,
          })),
          serviceIds: links.map((link) => link.serviceId),
        };
      })
  );

  return <StaffPanel initialResources={detailedResources} services={serviceRows} />;
}