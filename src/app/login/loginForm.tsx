'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import PasswordInput from '@/components/passwordInput';
import { Button } from '@/components/ui/button';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      toast.success("Signed in successfully");
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 700);
    }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <h1 className="font-display text-2xl font-semibold text-ink">Sign in</h1>

      {error && (
        <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>
      )}

      <label className="block">
        <span className="text-[13px] font-semibold text-ink">Email</span>
        <input
          required
          type="email"
          className="input"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>

      <label className="block">
        <span className="text-[13px] font-semibold text-ink">Password</span>
        <PasswordInput
          required
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
        />
      </label>

      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-moss px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-xs text-ink-soft">
        Sign in from your business&rsquo;s own address, e.g.{" "}
        <code className="rounded bg-stone-soft px-1 py-0.5">
          acme.modabyz.me/login
        </code>{" "}
        (whatever port your terminal shows).
      </p>
      <p className='text-xs text-moss'>Don&apos;t have an account? <a href="/signup" className="text-moss text-xs hover:underline">Sign up</a></p>
    </form>
  );
}
