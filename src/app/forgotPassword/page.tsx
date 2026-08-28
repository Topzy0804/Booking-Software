"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgotPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      setMessage(data.message ?? "if an account exist with that email, we've sent a reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-2xl font-semibold text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Enter your email and we&rsquo;ll send you a reset link.
        </p>

        {message ? (
          <p className="mt-5 rounded-md bg-stone-soft px-3 py-2.5 text-sm text-ink">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block">
              <span className="text-[13px] font-semibold text-ink">Email</span>
              <input
                required
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-4 block text-center text-xs text-ink-soft">
          ← Back to sign in
        </Link>
      </div>
    </main>
  )
}