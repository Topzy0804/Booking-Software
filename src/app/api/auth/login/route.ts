import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/db/client';
import { users, memberships } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import { getCurrentTenants } from '@/lib/tenant';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email and password' }, { status: 400 });
  }
  const { email, password } = parsed.data;
  
  const tenant = await getCurrentTenants();
  if (!tenant) {
    return NextResponse.json({ error: 'No business found at this address' }, { status: 404 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
  }


  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, user.id), eq(memberships.tenantId, tenant.id)));

    if (!membership) {
      return NextResponse.json(
        { error: "This account doesn't have access to this business" },
        { status: 403 }
      );
    }
    

    await setSessionCookie({
      userId: user.id,
      tenantId: tenant.id,
      role: membership.role as 'owner' | 'staff',
    });

    return NextResponse.json({ ok: true });
}