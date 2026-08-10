import { db } from '@/db/client';
import { resources, memberships } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getStaffScope(
  userId: string,
  tenantId: string,
  role: 'owner' | 'staff'
): Promise<{ canViewAll: boolean; myResourceId: string | null }> {
  if (role === 'owner') {
    return { canViewAll: true, myResourceId: null };
  }

  const [membership] = await db
    .select({ canViewBookings: memberships.canViewAllBookings })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.tenantId, tenantId)));

    const [resource] = await db
      .select({ id: resources.id })
      .from(resources)
      .where(and(eq(resources.linkedUserId, userId), eq(resources.tenantId, tenantId)));

    return {
      canViewAll: membership?.canViewBookings ?? false,
      myResourceId: resource?.id ?? null,
    };
}