import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { resources, users, memberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyStaffInviteToken } from "@/lib/staffInvitationToken";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  password: z.string().min(8),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const resourceId = verifyStaffInviteToken(token);
  if (!resourceId) {
    return NextResponse.json({ error: "This invite link is invalid or has expired." }, { status: 401 });
  }


  const [resource] = await db.select().from(resources).where(eq(resources.id, resourceId));
  if (!resource) {
    return NextResponse.json({ error: "Staff record not found." }, { status: 404 });
  }
  if (resource.linkedUserId) {
    return NextResponse.json({ error: "This invite has already been used." }, { status: 409 });
  }
  if (!resource.email) {
    return NextResponse.json({ error: "No email on file for this invite." }, { status: 400 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  let [user] = await db.select().from(users).where(eq(users.email, resource.email));
  if (!user) {
    const passwordHash = await hashPassword(parsed.data.password);
    [user] = await db
      .insert(users)
      .values({ email: resource.email, passwordHash, fullName: resource.name })
      .returning();
  }

  const [existingMembership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.tenantId, resource.tenantId)));
    if (!existingMembership) {
    await db.insert(memberships).values({
      tenantId: resource.tenantId,
      userId: user.id,
      role: "staff",
    });
  }

  await db.update(resources).set({ linkedUserId: user.id }).where(eq(resources.id, resourceId));

  await setSessionCookie({userId: user.id, tenantId: resource.tenantId, role: 'staff' });

  return NextResponse.json({ ok: true  }); 
}