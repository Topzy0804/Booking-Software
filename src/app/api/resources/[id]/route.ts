import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { resources, workingHours, serviceResources } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireTenantSession } from "@/lib/requireAuth";
import { z } from "zod";


function buildResourceDetails(
  resource: typeof resources.$inferSelect,
  hours: Array<typeof workingHours.$inferSelect>,
  links: Array<{ serviceId: string }>
) {
  return {
    ...resource,
    workingHours: hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      startTime: h.startTime,
      endTime: h.endTime,
    })),
    serviceIds: links.map((l) => l.serviceId),
  };
}

const schema = z.object({
  name: z.string().min(1).optional(),
  serviceIds: z.array(z.string()).optional(),

  workingHours: z
    .object({ startTime: z.string(), endTime: z.string(), days: z.array(z.number().min(0).max(6)) })
    .optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.id, id), eq(resources.tenantId, auth.tenant.id)));
  if (!existing) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, serviceIds, workingHours: hours, isActive } = parsed.data;

  if (name !== undefined || isActive !== undefined) {
    await db
      .update(resources)
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      })
      .where(eq(resources.id, id));
  }

  if (hours !== undefined) {
    await db.delete(workingHours).where(eq(workingHours.resourceId, id));
    if (hours.days.length > 0) {
      await db.insert(workingHours).values(
        hours.days.map((d) => ({
          resourceId: id,
          dayOfWeek: d,
          startTime: hours.startTime,
          endTime: hours.endTime,
        }))
      );
    }
  }

  if (serviceIds !== undefined) {
    await db.delete(serviceResources).where(eq(serviceResources.resourceId, id));
    if (serviceIds.length > 0) {
      await db
        .insert(serviceResources)
        .values(serviceIds.map((serviceId) => ({ serviceId, resourceId: id })));
    }
  }

  const [updated] = await db.select().from(resources).where(eq(resources.id, id));
  const updatedHours = await db
    .select()
    .from(workingHours)
    .where(eq(workingHours.resourceId, id));
  const updatedLinks = await db
    .select({ serviceId: serviceResources.serviceId })
    .from(serviceResources)
    .where(eq(serviceResources.resourceId, id));

  return NextResponse.json({
    resource: buildResourceDetails(updated, updatedHours, updatedLinks),
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;

  const [resource] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.id, id), eq(resources.tenantId, auth.tenant.id)));
  if (!resource) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  const hours = await db
    .select()
    .from(workingHours)
    .where(eq(workingHours.resourceId, id));
  const links = await db
    .select({ serviceId: serviceResources.serviceId })
    .from(serviceResources)
    .where(eq(serviceResources.resourceId, id));

  return NextResponse.json({
    resource: buildResourceDetails(resource, hours, links),
  });
}