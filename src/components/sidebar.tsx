"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/book", label: "Bookings" },
  { href: "/dashboard/service", label: "Services" },
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/client", label: "Clients" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar({
  tenantName,
  subdomain,
}: {
  tenantName: string;
  subdomain: string;
}) {
  const pathname = usePathname();

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
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
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

      {/* Mobile bottom bar -- front-desk-on-a-phone use case */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-stone bg-paper-raised md:hidden">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 py-3 text-center text-xs font-medium ${
                active ? "text-moss" : "text-ink-soft"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex-1 py-3 text-center text-xs font-medium text-ink-soft"
        >
          Log out
        </button>
      </div>
    </>
  );
}