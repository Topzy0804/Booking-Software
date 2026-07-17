import { db } from '@/db/client';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

export async function getCurrentTenants() {
  const h = await headers();
  const subdomain = h.get('x-tenant-subdomain');
  if (!subdomain) return null;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain));
  return tenant ?? null;
}