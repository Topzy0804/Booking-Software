import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPasswordResetToken } from "@/lib/passwordResetToken";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({ password: z.string().min(8) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const userId = verifyPasswordResetToken(token);

  if (!userId) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message
    }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

  return NextResponse.json({ ok: true });
}
