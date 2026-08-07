import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { resources, workingHours, serviceResources } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireTenantSession } from "@/lib/requireAuth";
import { getCurrentTenants } from "@/lib/tenant";
import { z } from "zod";
import { createStaffInviteToken, buildStaffInviteUrl } from "@/lib/staffInvitationToken";
import { sendStaffInviteEmail } from "@/lib/email";

export async function GET() {
  const tenant = await getCurrentTenants();
  if (!tenant) return NextResponse.json({ error: "Unknown business" }, { status: 404 });

  const rows = await db.select().from(resources).where(eq(resources.tenantId, tenant.id));
  const active = rows.filter((r) => r.isActive);


  const withDetails = await Promise.all(
    active.map(async (r) => {
      const hours = await db
        .select()
        .from(workingHours)
        .where(eq(workingHours.resourceId, r.id));
      const links = await db
        .select({ serviceId: serviceResources.serviceId })
        .from(serviceResources)
        .where(eq(serviceResources.resourceId, r.id));

      return {
        ...r,
        workingHours: hours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          startTime: h.startTime,
          endTime: h.endTime,
        })),
        serviceIds: links.map((l) => l.serviceId),
      };
    })
  );

  return NextResponse.json({ resources: withDetails });
}

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  serviceIds: z.array(z.string()).default([]),
  // Simple default: same hours every weekday. Per-day customization is a v2 dashboard feature.
  workingHours: z
    .object({ startTime: z.string(), endTime: z.string(), days: z.array(z.number().min(0).max(6)) })
    .default({ startTime: "09:00", endTime: "17:00", days: [1, 2, 3, 4, 5] }),
});

export async function POST(req: NextRequest) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, email, serviceIds, workingHours: hours } = parsed.data;

  const [resource] = await db
    .insert(resources)
    .values({ tenantId: auth.tenant.id, name, email })
    .returning();

  if (hours.days.length > 0) {
    await db.insert(workingHours).values(
      hours.days.map((d) => ({
        resourceId: resource.id,
        dayOfWeek: d,
        startTime: hours.startTime,
        endTime: hours.endTime,
      }))
    );
  }

  if (serviceIds.length > 0) {
    await db
      .insert(serviceResources)
      .values(serviceIds.map((serviceId) => ({ serviceId, resourceId: resource.id })));
  }

  const createdHours = await db
    .select()
    .from(workingHours)
    .where(eq(workingHours.resourceId, resource.id));
  const createdLinks = await db
    .select({ serviceId: serviceResources.serviceId })
    .from(serviceResources)
    .where(eq(serviceResources.resourceId, resource.id));

    const inviteUrl = buildStaffInviteUrl(auth.tenant.subdomain, createStaffInviteToken(resource.id));
await sendStaffInviteEmail({
  to: email,
  staffName: name,
  tenantName: auth.tenant.name,
  inviteUrl,
});

  return NextResponse.json({
    resource: {
      ...resource,
      workingHours: createdHours.map((hour) => ({
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.startTime,
        endTime: hour.endTime,
      })),
      serviceIds: createdLinks.map((link) => link.serviceId),
    },
  });
}

