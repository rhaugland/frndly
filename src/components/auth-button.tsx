"use client";

import { signIn } from "next-auth/react";

export function AuthButton({ provider, label }: { provider: string; label: string }) {
  return (
    <button
      onClick={() => signIn(provider)}
      className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
    >
      {label}
    </button>
  );
}
