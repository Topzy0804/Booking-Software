import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { tenants, users, memberships } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  businessName: z.string().min(2),
  subdomain: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { businessName, subdomain, ownerName, email, password } = parsed.data;

  const existingTenant = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
  if (existingTenant.length > 0) {
    return NextResponse.json({ error: 'That subdomain is already taken' }, { status: 409 });
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) {
    return NextResponse.json({ error: 'An account with that email already exists' }, { status: 409 });
  }

  const passwordHash =await hashPassword(password);

  const [tenant] = await db.insert(tenants).values({ name: businessName, subdomain }).returning();
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash, fullName: ownerName })
    .returning();
  await db.insert(memberships).values({ tenantId: tenant.id, userId: user.id, role: 'owner' });

  await setSessionCookie({ userId: user.id, tenantId: tenant.id, role: 'owner' });

  return NextResponse.json({ tenant, redirectSubdomain: subdomain  });
}