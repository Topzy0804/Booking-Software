'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AnalyticsStrip from '@/components/analyticStrip';
import type { Booking, Client } from '@/types/dashboard';

const STATUS_CLASS: Record<Booking['status'], string> = {
  confirmed: 'bg-[#E1E9E2] text-moss-dark',
  attended: 'bg-[#ECE4D3] text-gold',
  cancelled: 'bg-[#F5E4DF] text-rust',
  no_show: 'bg-[#EFEBE0] text-ink-soft',
};

export default function OverviewPanel({
  tenantName,
  bookings,
  clients,
}: {
  tenantName: string;
  bookings: Booking[];
  clients: Client[];
}) {
  const chartData = useMemo(() => buildDailyVolume(bookings, 14), [bookings]);

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
        .slice(0, 5),
    [bookings]
  );

  const recentClients = clients.slice(0, 5);

  return (
    <div>
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Welcome back, {tenantName}
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">Here&rsquo;s how things are looking.</p>
          </div>
    
          <AnalyticsStrip bookings={bookings} />
    
          <div className="mb-6 rounded-lg border border-stone bg-paper-raised p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-base font-semibold text-ink">Booking volume</h3>
              <span className="font-mono text-[11px] text-ink-soft">Last 14 days</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3E5C46" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3E5C46" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ECE8DC" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#55594E", fontFamily: "var(--font-mono)" }}
                    axisLine={{ stroke: "#DDD6C5" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#55594E", fontFamily: "var(--font-mono)" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#FFFFFF",
                      border: "1px solid #DDD6C5",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "#22261F", fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Bookings"
                    stroke="#3E5C46"
                    strokeWidth={2}
                    fill="url(#volumeFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
    
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Recent bookings */}
            <div className="rounded-lg border border-stone bg-paper-raised p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-ink">Recent bookings</h3>
                <Link href="/dashboard/book" className="text-[12px] font-medium text-moss hover:underline">
                  View all
                </Link>
              </div>
              {recentBookings.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-ink-soft">No bookings yet.</p>
              ) : (
                <div className="divide-y divide-stone-soft">
                  {recentBookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink">{b.clientName}</div>
                        <div className="truncate text-[12px] text-ink-soft">{b.serviceName}</div>
                      </div>
                      <div className="flex flex-shrink-0 flex-col items-end gap-1">
                        <span className="font-mono text-[11px] text-ink-soft">
                          {new Date(b.startsAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[b.status]}`}
                        >
                          {b.status.replace("_", "-")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
    
            {/* Recent clients */}
            <div className="rounded-lg border border-stone bg-paper-raised p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-base font-semibold text-ink">Recent clients</h3>
                <Link href="/dashboard/client" className="text-[12px] font-medium text-moss hover:underline">
                  View all
                </Link>
              </div>
              {recentClients.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-ink-soft">No clients yet.</p>
              ) : (
                <div className="divide-y divide-stone-soft">
                  {recentClients.map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-ink">{c.fullName}</div>
                        <div className="truncate text-[12px] text-ink-soft">{c.email}</div>
                      </div>
                      <span className="flex-shrink-0 font-mono text-[12px] text-ink-soft">
                        {c.bookingCount} {c.bookingCount === 1 ? "booking" : "bookings"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
  );
}

function buildDailyVolume(bookings: Booking[], days: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today.getTime() - (days - 1) * 86400000);

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    counts.set(d.toDateString(), 0);
  }

  for (const b of bookings) {
    if (b.status === 'cancelled') continue;
    const key = new Date(b.startsAt).toDateString();
    if (counts.has(key)) {
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  return [...counts.entries()].map(([key, count]) => ({
    label: new Date(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    count,
  }));
}