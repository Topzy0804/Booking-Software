import { NextRequest, NextResponse } from "next/server";

// Resolves which tenant a request belongs to, based on subdomain.
// Local dev: modern browsers/OSes resolve *.localhost to 127.0.0.1,
// so "glow-salon.localhost:3000" works out of the box for testing
// subdomain routing without any DNS setup. In production this reads
// the real subdomain of yourapp.com (or a mapped custom domain).
//
// The resolved subdomain is passed downstream via the
// "x-tenant-subdomain" request header, which server components/route
// handlers read to scope every query to the right tenant.

const ROOT_DOMAINS = ["localhost:3000", "localhost", process.env.ROOT_DOMAIN].filter(
  Boolean
) as string[];

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";

  let subdomain: string | null = null;

  for (const root of ROOT_DOMAINS) {
    if (host === root) {
      // Request to the bare root domain (marketing site / tenant signup)
      subdomain = null;
      break;
    }
    if (host.endsWith(`.${root}`)) {
      subdomain = host.slice(0, host.length - root.length - 1);
      break;
    }
  }

  const requestHeaders = new Headers(req.headers);
  if (subdomain) {
    requestHeaders.set("x-tenant-subdomain", subdomain);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};