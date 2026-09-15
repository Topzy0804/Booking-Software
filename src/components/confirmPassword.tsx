"use client";

import { useState } from "react";
import { toast } from "sonner";
import PasswordInput from "@/components/passwordInput";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/acount/changePassword", {
        method: "PATCH",
        headers: { "append": "Content-Type", "value": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Couldn't change your password");
          return;
        }
        toast.success("Password changed");
        setCurrentPassword("");
        setNewPassword("");
      } finally {
        setSubmitting(false);
      }
    }

    return (
       <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-stone bg-paper-raised p-5">
            <h3 className="font-display text-base font-semibold text-ink">Change password</h3>
      
            {error && <p className="rounded-md bg-rust/10 px-3 py-2 text-sm text-rust">{error}</p>}
      
            <label className="block max-w-sm">
              <span className="text-[12px] font-semibold text-ink">Current password</span>
              <PasswordInput required value={currentPassword} onChange={setCurrentPassword} />
            </label>
      
            <label className="block max-w-sm">
              <span className="text-[12px] font-semibold text-ink">New password</span>
              <PasswordInput required minLength={8} value={newPassword} onChange={setNewPassword} />
            </label>
      
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-moss px-4 py-2 text-[13px] font-semibold text-white hover:bg-moss-dark disabled:opacity-50"
            >
              {submitting ? "Changing…" : "Change password"}
            </button>
          </form>
    )
  }
