import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/requireAuth";
import Sidebar from "@/components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = await requireTenantSession();
  if (!auth) redirect("/login");

  return (
    <div className="flex flex-1">
      <Sidebar tenantName={auth.tenant.name} subdomain={auth.tenant.subdomain} />
      <div className="flex-1 px-6 py-8 pb-20 sm:px-10 md:pb-8">{children}</div>
    </div>
  );
}