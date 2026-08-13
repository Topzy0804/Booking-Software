"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Home,
  MoreHorizontal,
  Scissors,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";

const OWNER_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/book", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/service", label: "Services", icon: Scissors },
  { href: "/dashboard/staff", label: "Staff", icon: Users },
  { href: "/dashboard/client", label: "Clients", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const STAFF_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/book", label: "Bookings", icon: CalendarDays },
  { href: "/dashboard/profile", label: "My Profile", icon: UserRound },
];

export default function Sidebar({
  tenantName,
  subdomain,
  role,
}: {
  tenantName: string;
  subdomain: string;
  role: 'owner' | 'staff';
}) {
  const pathname = usePathname();
  const [openMore, setOpenMore] = useState(false);
  const navItems = role === 'owner' ? OWNER_NAV : STAFF_NAV;

  const mobilePrimary =
    role === 'owner'
      ? navItems.filter((item) => ['/dashboard', '/dashboard/book', '/dashboard/client'].includes(item.href)) : navItems;

      const moreItems = 
        role === 'owner'
          ? navItems.filter((item) => ['/dashboard/service', '/dashboard/staff', '/dashboard/settings'].includes(item.href)) : [];

      function isActive(href: string) {
        return href === '/dashboard' 
          ? pathname === '/dashboard' 
          : pathname.startsWith(href);
      }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Full navigation (not router.push) so the session cookie change
    // is respected immediately and no stale client state lingers.
    window.location.href = "/login";
  }

  return (
    <>
      {/* Desktop/tablet rail */}
      <div className="hidden w-[220px] shrink-0 flex-col border-r border-stone bg-paper-raised py-6 md:flex">
        <div className="mb-3.5 border-b border-stone-soft px-5 pb-5">
          <div className="font-display text-base font-semibold text-ink">{tenantName}</div>
          <div className="mt-0.5 font-mono text-[11px] text-ink-soft">{subdomain}.app.com</div>
        </div>

        <div className="flex flex-1 flex-col">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-l-[3px] px-5 py-2.5 text-left text-[13px] font-medium ${
                  active
                    ? "border-moss bg-stone-soft text-ink"
                    : "border-transparent text-ink-soft hover:bg-stone-soft/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="border-t border-stone-soft px-5 pt-4">
          <Button
            onClick={handleLogout}
            className="text-[13px] font-medium text-ink-soft hover:text-rust"
          >
            Log out
          </Button>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone bg-paper-raised/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(34,38,31,0.06)] backdrop-blur md:hidden"
      >
        <div className="mx-auto flex h-16 max-w-md items-center justify-center">
          {mobilePrimary.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition ${
                  active ? "text-moss" : "text-ink-soft"
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={active ? 2.2 : 1.8}
                  aria-hidden="true"
                />
                <span>{item.label === "Dashboard" ? "Home" : item.label}</span>
              </Link>
            );
          })}

          <Button
            type="button"
            onClick={() => setOpenMore(true)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium transition ${
              openMore ? "text-moss" : "text-ink-soft"
            }`}
          >
            <MoreHorizontal
              size={19}
              strokeWidth={openMore ? 2.2 : 1.8}
              aria-hidden="true"
            />
            <span>More</span>
          </Button>
        </div>
      </nav>


      {/* Mobile More Options  */}
      {openMore && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="More navigation">
            <Button
              onClick={() => setOpenMore(false)}
              aria-label="close more menu"
              className="absolute inset-0 bg-ink/25"
            />

            <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-stone bg-paper-raised px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3 shadow-[0_-10px_30px_rgba(34,38,31,0.12)]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-stone" />

            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">
                More
              </h2>
              <Button
                type="button"
                onClick={() => setOpenMore(false)}
                aria-label="Close"
                className="rounded-full p-2 text-ink-soft hover:bg-stone-soft hover:text-ink"
              >
                <X size={18} />
              </Button>
          </div>

          <div className="space-y-1">
              {moreItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpenMore(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-stone-soft text-moss"
                        : "text-ink hover:bg-stone-soft/60"
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.9} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {role === "staff" && (
                <Link
                  href="/dashboard/profile"
                  onClick={() => setOpenMore(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-ink hover:bg-stone-soft/60"
                >
                  <UserRound size={19} strokeWidth={1.9} />
                  <span>My Profile</span>
                </Link>
              )}

              <div className="my-2 border-t border-stone-soft" />

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-ink-soft transition hover:bg-stone-soft/60 hover:text-rust"
              >
                <span aria-hidden="true">↪</span>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

