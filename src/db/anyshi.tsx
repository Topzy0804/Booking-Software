import { redirect } from "next/navigation";
import { getCurrentTenant } from "@/lib/tenant";
import { db } from "@/db/client";
import { services } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import BookingFlow from "@/components/book/bookingFlow";

export default async function BookPage() {
  const tenant = await getCurrentTenant();
  if (!tenant) redirect("/");

  const activeServices = await db
    .select({
      id: services.id,
      name: services.name,
      durationMinutes: services.durationMinutes,
      priceCents: services.priceCents,
    })
    .from(services)
    .where(and(eq(services.tenantId, tenant.id), eq(services.isActive, true)));

  return (
    <BookingFlow
      tenantName={tenant.name}
      timezone={tenant.timezone}
      services={activeServices}
    />
  );
}