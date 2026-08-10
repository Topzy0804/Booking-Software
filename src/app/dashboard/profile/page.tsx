import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import { db } from "@/db/client";
import { resources, services, serviceResources, workingHours } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import StaffProfilePanel from "@/components/staffProfilePanel";

export default async function StaffProfilePage() {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

  if (auth.session.role === "owner") {
    redirect("/dashboard/staff");
  }

  const [resource] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.linkedUserId, auth.session.userId), eq(resources.tenantId, auth.tenant.id)));

  if (!resource) {
    return (
      <div className="rounded-lg border border-stone bg-paper-raised p-6 text-sm text-ink-soft">
        No staff profile is linked to your account. Contact the business owner.
      </div>
    );
  }

  const [allServices, myLinks, myHours] = await Promise.all([
    db.select().from(services).where(and(eq(services.tenantId, auth.tenant.id), eq(services.isActive, true))),
    db.select({ serviceId: serviceResources.serviceId }).from(serviceResources).where(eq(serviceResources.resourceId, resource.id)),
    db.select().from(workingHours).where(eq(workingHours.resourceId, resource.id)),
  ]);

  return (
    <StaffProfilePanel
      resource={{
        id: resource.id,
        name: resource.name,
        email: resource.email,
        title: resource.title,
        bio: resource.bio,
        phone: resource.phone,
        serviceIds: myLinks.map((l) => l.serviceId),
      }}
      services={allServices}
      workingHours={myHours.map((h) => ({ dayOfWeek: h.dayOfWeek, startTime: h.startTime, endTime: h.endTime }))}
    />
  );
}