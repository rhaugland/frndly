"use client";

export function AuthButton({ provider, label, callbackUrl = "/dashboard" }: { provider: string; label: string; callbackUrl?: string }) {
  return (
    <a
      href={`/api/auth/signin-redirect/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`}
      className="block w-full rounded-xl border border-sky-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-sky-50 transition-colors text-center"
    >
      {label}
    </a>
  );
}
