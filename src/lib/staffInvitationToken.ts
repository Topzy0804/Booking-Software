import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";


const EXPIRES_IN = '14d';

export function createStaffInviteToken(resourceId: string): string {
  return jwt.sign({ resourceId, purpose: 'staffInvite' }, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyStaffInviteToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, SECRET) as { resourceId: string; purpose: string };
    if (payload.purpose !== 'staffInvite' || !payload.resourceId) return null;
    return payload.resourceId;
  } catch {
    return null;
  }
}


export function buildStaffInviteUrl(subdomain: string, token: string): string {
  const rootDomain = process.env.ROOT_DOMAIN || 'modabyz.me';
  return `https://${subdomain}.${rootDomain}/staffInvite/${token}`;
}