import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

const EXPIRES_IN = "1h";

export function createPasswordResetToken(userId: string): string {
  return jwt.sign({ userId, purpose: "password-reset" }, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyPasswordResetToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, SECRET) as { userId: string; purpose: string };

    if (payload.purpose !== "password-reset" || !payload.userId)
      return null;
    return payload.userId;
  } catch {
    return null;
  }
}

export function buildPasswordResetUrl(subdomain: string, token: string): string {
  const rootDomain = process.env.ROOT_DOMAIN || "modabyz.me";
  return `https://${subdomain}.${rootDomain}/resetPassword/${token}`;
}