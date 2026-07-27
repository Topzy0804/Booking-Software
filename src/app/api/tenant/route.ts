import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("subdomain") ?? "";
  const subdomain = raw.trim().toLowerCase();

  if (!subdomain) {
    return NextResponse.json({ error: "subdomain is required" }, { status: 400 });
  }

  const [tenant] = await db
    .select({ name: tenants.name, subdomain: tenants.subdomain })
    .from(tenants)
    .where(eq(tenants.subdomain, subdomain));

  if (!tenant) {
    return NextResponse.json({ exists: false }, { status: 404 });
  }

  return NextResponse.json({ exists: true, name: tenant.name, subdomain: tenant.subdomain });
}