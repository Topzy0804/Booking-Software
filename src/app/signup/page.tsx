"use client";

import { useState } from "react";
import { toast } from "sonner";
import PasswordInput from "@/components/passwordInput";

export default function SignupPage() {
  const [form, setForm] = useState({
    businessName: "",
    subdomain: "",
    ownerName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }
    toast.success("Business created successfully");
    setTimeout(() => {
      // Strip a leading "www." before building the tenant URL --
      // without this, signing up while on www.modabyz.me would
      // produce "acme.www.modabyz.me" (two subdomain levels), which
      // the *.modabyz.me wildcard does NOT cover and would 404.
      const rootHost = window.location.host.replace(/^www\./, "");
      window.location.href = `${window.location.protocol}//${data.redirectSubdomain}.${rootHost}/dashboard`;
    }, 700);
  }

  return (
    <main className="flex flex-1">
      <div className="hidden w-[42%] flex-col justify-between bg-moss px-12 py-14 text-[#F3F0E4] lg:flex">
        <div className="font-display text-xl">◆ Ledger</div>
        <blockquote className="font-display text-2xl font-medium leading-snug">
          &ldquo;Set up took less time than my morning coffee. Clients started
          booking themselves the same afternoon.&rdquo;
          <cite className="mt-4 block font-body text-sm not-italic opacity-75">
            — Owner, independent studio
          </cite>
        </blockquote>
        <div />
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              Create your business
            </h1>
            <p className="mt-1 text-sm text-ink-soft">Takes about a minute.</p>
          </div>

          {error && (
            <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>
          )}

          <Field label="Business name">
            <input
              required
              className="input"
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
            />
          </Field>

          <Field label="Booking page address" hint="letters, numbers, hyphens only">
            <div className="flex items-center">
              <input
                required
                pattern="[a-z0-9-]+"
                className="input rounded-r-none"
                value={form.subdomain}
                onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase() })}
              />
              <span className="mt-1 whitespace-nowrap rounded-r-md border border-l-0 border-stone bg-stone-soft px-3 py-2 font-mono text-[13px] text-ink-soft">
                .
                {typeof window !== "undefined"
                  ? window.location.host.replace(/^www\./, "")
                  : "localhost:3000"}
              </span>
            </div>
          </Field>

          <Field label="Your name">
            <input
              required
              className="input"
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />
          </Field>

          <Field label="Email">
            <input
              required
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <Field label="Password" hint="at least 8 characters">
            <PasswordInput
              required
              minLength={8}
              value={form.password}
              onChange={(value) => setForm({ ...form, password: value })}
            />
          </Field>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create business"}
          </button>
          <div className='text-xs text-moss'>
            <p>Already have an account? <a href="/login" className="text-moss text-xs hover:underline">Sign in</a></p>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-ink-soft">{hint}</span>}
    </label>
  );
}