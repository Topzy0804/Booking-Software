import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireTenantSession } from "@/lib/requireAuth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(0),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireTenantSession();

  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, auth.session.userId));

  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);

  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const hashedPassword = await hashPassword(parsed.data.newPassword);

  await db.update(users).set({ passwordHash: hashedPassword }).where(eq(users.id, user.id));

  return NextResponse.json({ ok: true });
}