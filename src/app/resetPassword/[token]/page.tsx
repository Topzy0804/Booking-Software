"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import PasswordInput from "@/components/passwordInput";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/auth/resetPassword/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      toast.success("password updated");
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Password updated</h1>
          <p className="mt-2 text-sm text-ink-soft">You can now sign in with your new password.</p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-dark"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">Choose a new password</h1>
            </div>
    
            {error && <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>}
    
            <label className="block">
              <span className="text-[13px] font-semibold text-ink">New password</span>
              <PasswordInput required minLength={8} value={password} onChange={setPassword} />
            </label>
    
            <Button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
            >
              {submitting ? "Updating…" : "Update password"}
            </Button>
          </form>
        </main>
  )
}