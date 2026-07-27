import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { services, serviceResources, resources } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenants } from "@/lib/tenant";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(req: NextRequest) {
  const tenant = await getCurrentTenants();
  if (!tenant) return NextResponse.json({ error: "Unknown business" }, { status: 404 });

  const serviceId = req.nextUrl.searchParams.get("serviceId");
  const dateParam = req.nextUrl.searchParams.get("date"); // "YYYY-MM-DD"
  const excludeBookingId = req.nextUrl.searchParams.get('excludeBookingId') ?? undefined;
  if (!serviceId || !dateParam) {
    return NextResponse.json({ error: "serviceId and date are required" }, { status: 400 });
  }

  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, serviceId), eq(services.tenantId, tenant.id)));
  if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const linkedResources = await db
    .select({ resourceId: serviceResources.resourceId, name: resources.name })
    .from(serviceResources)
    .innerJoin(resources, eq(resources.id, serviceResources.resourceId))
    .where(eq(serviceResources.serviceId, serviceId));

  const day = new Date(`${dateParam}T00:00:00.000Z`);

  const results = await Promise.all(
    linkedResources.map(async (r) => ({
      resourceId: r.resourceId,
      resourceName: r.name,
      slots: await getAvailableSlots({
        resourceId: r.resourceId,
        day,
        durationMinutes: service.durationMinutes,
        bufferAfterMinutes: service.bufferAfterMinutes,
        excludeBookingId,
      }),
    }))
  );

  return NextResponse.json({ availability: results });
}