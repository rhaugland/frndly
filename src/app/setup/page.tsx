"use client";

import { useState } from "react";

export default function SetupPage() {
  const [status, setStatus] = useState<string>("Click the button to set up demo data.");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  async function runSetup() {
    setLoading(true);
    setStatus("Running setup...");
    try {
      const res = await fetch("/api/setup-demo", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
        setStatus("Done! Redirecting to dashboard...");
        setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
      } else {
        setStatus(`Error: ${data.error || res.statusText}`);
      }
    } catch (e: any) {
      setStatus(`Error: ${e.message}`);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-violet-50">
      <div className="w-full max-w-md rounded-2xl bg-white/50 backdrop-blur-sm p-8 shadow-md border border-sky-100">
        <h1 className="mb-4 text-xl font-bold text-slate-800">Setup Demo Data</h1>
        <p className="mb-6 text-sm text-slate-600">{status}</p>
        {results.length > 0 && (
          <ul className="mb-6 space-y-1 text-sm text-slate-600">
            {results.map((r, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-green-500">✓</span> {r}
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={runSetup}
          disabled={loading}
          className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500 transition-colors disabled:opacity-50"
        >
          {loading ? "Setting up..." : "Set Up Demo Data"}
        </button>
      </div>
    </div>
  );
}
