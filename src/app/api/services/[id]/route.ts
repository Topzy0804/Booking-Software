import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { services } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireTenantSession } from "@/lib/requireAuth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).optional(),
  durationMinutes: z.number().int().positive().optional(),
  bufferAfterMinutes: z.number().int().min(0).optional(),
  priceCents: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

// Soft-delete only, deliberately -- bookings.serviceId references this
// row with no ON DELETE cascade, so a hard DELETE would fail outright
// (or silently orphan history) the moment a service has ever had a
// single booking against it. Setting isActive: false removes it from
// the public booking page and dashboard "add staff" service-picker
// without breaking any past booking's reference to it.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;

  const [existing] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, id), eq(services.tenantId, auth.tenant.id)));
  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const [updated] = await db
    .update(services)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(services.id, id))
    .returning();

  return NextResponse.json({ service: updated });
}