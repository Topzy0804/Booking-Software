import { NextRequest, NextResponse } from "next/server";
import { db } from '@/db/client';
import { services } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireTenantSession } from '@/lib/requireAuth';
import { getCurrentTenants } from '@/lib/tenant';
import { z } from 'zod';

export async function GET() {
  const tenant = await getCurrentTenants();
  if (!tenant) return NextResponse.json({ error: 'Unknown business' }, { status: 404 });

  const rows = await db.select().from(services).where(eq(services.tenantId, tenant.id));

  return NextResponse.json({ services: rows.filter((s) => s.isActive) });
}

const schema = z.object({
  name: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  bufferAfterMinutes: z.number().int().min(0).default(0),
  priceCents: z.number().int().min(0).default(0),
});

export async function POST(req: NextRequest) {
  const auth = await requireTenantSession();
  if(!auth) return NextResponse.json({ error: 'Not signed in'}, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message  }, { status: 400 });
  }

  const [created] = await db.insert(services).values({ tenantId: auth.tenant.id, ...parsed.data }).returning();

  return NextResponse.json({ service: created });
}