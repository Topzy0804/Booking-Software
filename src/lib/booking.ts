import { db } from '@/db/client';
import { bookings } from '@/db/schema';

export class BookingConflictError extends Error {
  constructor() {
    super('This slot was just taken. Please pick another time.');
    this.name = 'BookingConflictError';
  }
}

const EXCLUSION_VIOLATION = '23P01';

export async function createBooking(input: {
  tenantId: string;
  clientId: string;
  serviceId: string;
  resourceId: string;
  startsAt: Date;
  endsAt: Date;
  priceCentsSnapshot: number;
}) {
  try {
    const [created] = await db.insert(bookings).values({
      tenantId: input.tenantId,
      clientId: input.clientId,
      serviceId: input.serviceId,
      resourceId: input.resourceId,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      priceCentsSnapshot: input.priceCentsSnapshot,
      status: 'confirmed',
    })
    .returning();

    return created;
  } catch (err: unknown) {
    if (isExclusionViolation(err)) {
      throw new BookingConflictError();
    }
    throw err;
  }
}

function isExclusionViolation(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: string }).code === EXCLUSION_VIOLATION
  );
}
