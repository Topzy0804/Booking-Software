import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ---------------------------------------------------------------------
// MVP schema, targeting Postgres (Supabase). Mirrors booking_saas_schema.sql
// from the design doc, trimmed to MVP scope (no rooms/equipment, no
// waitlist, no multi-channel notifications, no analytics rollups yet).
//
// Note on double-booking prevention: the EXCLUDE constraint that makes
// overlapping bookings physically impossible to insert is NOT expressed
// here -- Drizzle's schema builder doesn't support Postgres EXCLUDE
// constraints. It's added via a raw SQL migration instead -- see
// drizzle/0001_booking_exclusion_constraint.sql. Don't skip that file;
// it's the real safety net, not just an app-level nicety.
// ---------------------------------------------------------------------

const id = () => uuid("id").primaryKey().default(sql`gen_random_uuid()`);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
};

export const tenants = pgTable(
  "tenants",
  {
    id: id(),
    name: text("name").notNull(),
    subdomain: text("subdomain").notNull(),
    timezone: text("timezone").notNull().default("UTC"),
    ...timestamps,
  },
  (t) => [uniqueIndex("tenants_subdomain_idx").on(t.subdomain)]
);

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

export const memberships = pgTable(
  "memberships",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "staff"] }).notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("memberships_tenant_user_idx").on(t.tenantId, t.userId),
    index("memberships_tenant_idx").on(t.tenantId),
  ]
);

export const resources = pgTable(
  "resources",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    linkedUserId: uuid("linked_user_id").references(() => users.id),
    name: text("name").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("resources_tenant_idx").on(t.tenantId)]
);

export const workingHours = pgTable(
  "working_hours",
  {
    id: id(),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday .. 6 = Saturday
    startTime: text("start_time").notNull(), // "09:00"
    endTime: text("end_time").notNull(), // "17:00"
  },
  (t) => [index("working_hours_resource_idx").on(t.resourceId)]
);

export const availabilityExceptions = pgTable(
  "availability_exceptions",
  {
    id: id(),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true, mode: "date" }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true, mode: "date" }).notNull(),
    kind: text("kind", { enum: ["time_off", "holiday"] }).notNull(),
    note: text("note"),
  },
  (t) => [index("availability_exceptions_resource_idx").on(t.resourceId)]
);

export const services = pgTable(
  "services",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    bufferAfterMinutes: integer("buffer_after_minutes").notNull().default(0),
    priceCents: integer("price_cents").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps,
  },
  (t) => [index("services_tenant_idx").on(t.tenantId)]
);

export const serviceResources = pgTable(
  "service_resources",
  {
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id, { onDelete: "cascade" }),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("service_resources_pk").on(t.serviceId, t.resourceId)]
);

export const clients = pgTable(
  "clients",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    ...timestamps,
  },
  (t) => [
    index("clients_tenant_idx").on(t.tenantId),
    uniqueIndex("clients_tenant_email_idx").on(t.tenantId, t.email),
  ]
);

export const bookings = pgTable(
  "bookings",
  {
    id: id(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => services.id),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id),
    startsAt: timestamp("starts_at", { withTimezone: true, mode: "date" }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true, mode: "date" }).notNull(),
    status: text("status", {
      enum: ["confirmed", "cancelled", "attended", "no_show"],
    })
      .notNull()
      .default("confirmed"),
    priceCentsSnapshot: integer("price_cents_snapshot").notNull(),
    cancellationReason: text("cancellation_reason"),
    ...timestamps,
  },
  (t) => [
    index("bookings_tenant_range_idx").on(t.tenantId, t.startsAt),
    index("bookings_resource_range_idx").on(t.resourceId, t.startsAt, t.endsAt),
  ]
);