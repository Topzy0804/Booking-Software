'use client';

import { useMemo } from 'react';
import type { Booking } from '@/types/dashboard';
import { Card, CardHeader, CardContent } from '@/components/ui/card'

export default function AnalysticsStrip({ bookings }: { bookings: Booking[] }) {
  const stats = useMemo(() => computeStats(bookings), [bookings]);

  return (
    <div className="mb-6 grid grid-cols-3 bg-paper-raised overflow-hidden">
      <Stat number={stats.upcoming} label="Upcoming bookings" />
      <Stat number={stats.thisWeek} label="This week" />
      <Stat number={stats.noShows} label="No-shows" />
    </div>
  );
}

function Stat({ number, label }: { number: number; label: string }) {
  return (
    <div className="px-5 py-4 text-center">
      <Card className="bg-paper-raised border-stone-soft border shadow-xl">
        <CardHeader className='text-2xl font-semibold text-moss'>{number}</CardHeader>
        <CardContent className='mt-0.5 text-xs text-ink-soft'>{label}</CardContent>
      </Card>
    </div>
  );
}

function computeStats(bookings: Booking[]) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);
const upcoming = bookings.filter(
    (b) => b.status === 'confirmed' && new Date(b.startsAt) >= now
  ).length;

  const thisWeek = bookings.filter((b) => {
    const start = new Date(b.startsAt);
    return b.status !== 'cancelled' && start >= weekStart && start < weekEnd;
  }).length;

  const noShows = bookings.filter((b) => b.status === 'no_show').length;

  return { upcoming, thisWeek, noShows };
}

export function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}
