import { redirect } from "next/navigation";
import { getCurrentTenants } from "@/lib/tenant";
import { db } from "@/db/client";
import { services } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import BookingFlow from "./bookingFlow";

export default async function BookPage() {
  const tenant = await getCurrentTenants();
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

  return <BookingFlow tenantName={tenant.name} services={activeServices} />;
}