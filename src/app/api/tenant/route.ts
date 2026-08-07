import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireTenantSession } from "@/lib/requireAuth";
import { z } from "zod";


// get public business lockup from the for client marketing page.

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


// PATCH -- owner only setting update

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  timezone: z
    .string()
    .refine((tz) => {
      try {
        new Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, "Not a recognized timezone")
     .optional(),
});

export async function PATCH(req: NextRequest) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  if (auth.session.role !== "owner") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }


  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const [updated] = await db
    .update(tenants)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(tenants.id, auth.tenant.id))
    .returning();

    return NextResponse.json({ tenant: updated });
}
