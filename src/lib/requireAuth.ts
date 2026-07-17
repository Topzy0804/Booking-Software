import { getSession } from '@/lib/auth';
import { getCurrentTenants } from '@/lib/tenant';

export async function requireTenantSession() {
  const [session, tenant] = await Promise.all([getSession(), getCurrentTenants()]);
  if (!session || !tenant || session.tenantId !== tenant.id) {
    return null;
  }

  return { session, tenant };
}