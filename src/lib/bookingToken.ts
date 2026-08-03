import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'ev-secret-change-in-production';

const EXPIRES_IN = '180d';

export function createBookingManageToken(bookingId: string): string {
  return jwt.sign({ bookingId, purpose: 'manage-booking' }, SECRET, { expiresIn: EXPIRES_IN });
}
export function verifyBookingToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, SECRET) as { bookingId: string; purpose: string };
    if (payload.purpose !== 'manage-booking' || !payload.bookingId) return null;
    return payload.bookingId;
  } catch {
    return null;
  }
}

export function buildManageUrl(subdomain: string, token: string): string {
  const rootDomain = process.env.ROOT_DOMAIN || 'modabyz.me';
  return `https://${subdomain}.${rootDomain}/manage/${token}`;
}