import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { users, memberships } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentTenants } from "@/lib/tenant";
import { createPasswordResetToken, buildPasswordResetUrl } from "@/lib/passwordResetToken"
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

const GENERIC_MESSAGE = "If an account exists with that email, we have sent a password reset link.";

export async function POST(req: NextRequest) {
  const tenant = await getCurrentTenants();

  if (!tenant) return NextResponse.json({ error: "Unknown business" }, { status: 404 });

  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email));

  if (user) {
    const [membership] = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.userId, user.id), eq(memberships.tenantId, tenant.id)));

      if (membership) {
        const token = createPasswordResetToken(user.id);
        const resetUrl = buildPasswordResetUrl(tenant.subdomain, token);
        await sendPasswordResetEmail({ to: user.email, fullName: user.fullName, resetUrl });
      }
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}