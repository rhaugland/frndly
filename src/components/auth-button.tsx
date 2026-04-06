"use client";

import { useRef } from "react";

export function AuthButton({ provider, label, callbackUrl = "/dashboard" }: { provider: string; label: string; callbackUrl?: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleClick() {
    const res = await fetch("/api/auth/csrf");
    const { csrfToken } = await res.json();
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("csrfToken") as HTMLInputElement).value = csrfToken;
    form.submit();
  }

  return (
    <form ref={formRef} method="POST" action={`/api/auth/signin/${provider}`}>
      <input type="hidden" name="csrfToken" value="" />
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <button
        type="button"
        onClick={handleClick}
        className="block w-full rounded-xl border border-sky-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-sky-50 transition-colors text-center"
      >
        {label}
      </button>
    </form>
  );
}
