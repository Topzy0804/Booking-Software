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

const PRODUCTION_FALLBACK = "modabyz.me"; 

const ROOT_DOMAINS = ["localhost:3000", "localhost", process.env.ROOT_DOMAIN?.split(":")[0] || PRODUCTION_FALLBACK,].filter(
  Boolean
) as string[];

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];

  let subdomain: string | null = null;

  for (const root of ROOT_DOMAINS) {
    if (hostname === root || hostname === `www.${root}`) {
      // Request to the bare root domain (marketing site / tenant signup)
      subdomain = null;
      break;
    }
    if (hostname.endsWith(`.${root}`)) {
      const candidate = hostname.slice(0, hostname.length - root.length - 1);

      if (!candidate.includes(".")) {
        subdomain = candidate;
      }
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