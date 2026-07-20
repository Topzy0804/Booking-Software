// Intended path: app/api/resources/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { resources, workingHours, serviceResources } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireTenantSession } from "@/lib/requireAuth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).optional(),
  serviceIds: z.array(z.string()).optional(),
  // Same shape as POST /api/resources. Omit to leave hours untouched; pass days: []
  // to clear them (e.g. someone going fully unavailable without deactivating them).
  workingHours: z
    .object({ startTime: z.string(), endTime: z.string(), days: z.array(z.number().min(0).max(6)) })
    .optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const [existing] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.id, params.id), eq(resources.tenantId, auth.tenant.id)));
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
      .where(eq(resources.id, params.id));
  }

  if (hours !== undefined) {
    await db.delete(workingHours).where(eq(workingHours.resourceId, params.id));
    if (hours.days.length > 0) {
      await db.insert(workingHours).values(
        hours.days.map((d) => ({
          resourceId: params.id,
          dayOfWeek: d,
          startTime: hours.startTime,
          endTime: hours.endTime,
        }))
      );
    }
  }

  if (serviceIds !== undefined) {
    await db.delete(serviceResources).where(eq(serviceResources.resourceId, params.id));
    if (serviceIds.length > 0) {
      await db
        .insert(serviceResources)
        .values(serviceIds.map((serviceId) => ({ serviceId, resourceId: params.id })));
    }
  }

  const [updated] = await db.select().from(resources).where(eq(resources.id, params.id));
  const updatedHours = await db
    .select()
    .from(workingHours)
    .where(eq(workingHours.resourceId, params.id));
  const updatedLinks = await db
    .select({ serviceId: serviceResources.serviceId })
    .from(serviceResources)
    .where(eq(serviceResources.resourceId, params.id));

  return NextResponse.json({
    resource: {
      ...updated,
      workingHours: updatedHours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        startTime: h.startTime,
        endTime: h.endTime,
      })),
      serviceIds: updatedLinks.map((l) => l.serviceId),
    },
  });
}