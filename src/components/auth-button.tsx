"use client";

import { signIn } from "next-auth/react";

export function AuthButton({ provider, label }: { provider: string; label: string }) {
  return (
    <button
      onClick={() => signIn(provider, { callbackUrl: "/dashboard" })}
      className="w-full rounded-xl border border-sky-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-sky-50 transition-colors"
    >
      {label}
    </button>
  );
}
