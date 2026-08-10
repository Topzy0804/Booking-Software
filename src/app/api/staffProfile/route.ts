import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { resources, serviceResources } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireTenantSession } from "@/lib/requireAuth";
import { z } from "zod";

const schema = z.object({
  title: z.string().max(120).optional(),
  bio: z.string().max(600).optional(),
  phone: z.string().max(30).optional(),
  serviceIds: z.array(z.string()).optional(),
});


export async function PATCH(req: NextRequest) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: 'not signed in' }, { status: 401 });

  const [resource] = await db
    .select()
    .from(resources)
    .where(and(eq(resources.linkedUserId, auth.session.userId), eq(resources.tenantId, auth.tenant.id)));
    if (!resource) {
      return NextResponse.json({ error: 'no staff profile linked to this account' }, { status: 404 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { serviceIds, ...fields } = parsed.data;

    if (Object.keys(fields).length > 0) {
      await db.update(resources).set({ ...fields, updatedAt: new Date() }).where(eq(resources.id, resource.id));
    }

    if (serviceIds !== undefined) {
      await db.delete(serviceResources).where(eq(serviceResources.resourceId, resource.id));
      if (serviceIds.length > 0) {
        await db.insert(serviceResources).values(serviceIds.map((serviceId) => ({ serviceId, resourceId: resource.id })));
      }
    }

    return NextResponse.json({ ok: true });
}