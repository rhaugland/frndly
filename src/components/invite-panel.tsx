"use client";

import { useState } from "react";

export function InvitePanel({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join/${inviteCode}`;

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-sky-100 bg-white/50 backdrop-blur-sm p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-2">Invite teammates</h3>
      <p className="text-xs text-slate-500 mb-3">
        Share this link so teammates can join your team.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={inviteUrl}
          className="flex-1 rounded-lg border border-sky-200 bg-white/70 px-3 py-2 text-xs text-slate-600 truncate"
        />
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-lg bg-sky-400 px-3 py-2 text-xs font-medium text-white hover:bg-sky-500 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="mt-3">
        <p className="text-xs text-slate-400">
          Or share the code: <span className="font-mono font-medium text-slate-600">{inviteCode}</span>
        </p>
      </div>
    </div>
  );
}
