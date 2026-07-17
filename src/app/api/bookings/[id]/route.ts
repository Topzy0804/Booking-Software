import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { bookings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireTenantSession } from "@/lib/requireAuth";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["confirmed", "cancelled", "attended", "no_show"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireTenantSession();
  if (!auth) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(and(eq(bookings.id, id), eq(bookings.tenantId, auth.tenant.id)))
    .returning();

  if (!updated) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  return NextResponse.json({ booking: updated });
}