import { getCurrentTenants } from "@/lib/tenant";
import LoginForm from "./loginForm";

export default async function LoginPage() {
  const tenant = await getCurrentTenants();

  return (
    <main className="flex flex-1">
      {/* Left panel: shows the actual tenant name, since login is tenant-scoped */}
      <div className="hidden w-[42%] flex-col justify-between bg-moss px-12 py-14 text-[#F3F0E4] lg:flex">
        <div className="font-display text-xl">
          ◆ {tenant ? tenant.subdomain : "your-business"}
        </div>
        <blockquote className="font-display text-2xl font-medium leading-snug">
          Welcome back. Today&rsquo;s schedule is waiting.
        </blockquote>
        <div />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <LoginForm />
      </div>
    </main>
  );
}