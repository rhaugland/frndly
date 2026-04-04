"use client";

import { useState } from "react";

export default function TeamSettingsPage() {
  const [inviteLink, setInviteLink] = useState("");
  const [regenerating, setRegenerating] = useState(false);

  async function regenerateInvite() {
    setRegenerating(true);
    const res = await fetch("/api/team/invite", { method: "POST" });
    const data = await res.json();
    setInviteLink(`${window.location.origin}/join/${data.inviteCode}`);
    setRegenerating(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Team Settings</h1>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Invite link
          </label>
          {inviteLink ? (
            <div className="flex gap-2">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
              <button
                onClick={() => navigator.clipboard.writeText(inviteLink)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
              >
                Copy
              </button>
            </div>
          ) : (
            <button
              onClick={regenerateInvite}
              disabled={regenerating}
              className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {regenerating ? "Generating..." : "Generate invite link"}
            </button>
          )}
          <p className="mt-1 text-xs text-gray-400">
            Generating a new link revokes the previous one.
          </p>
        </div>

        <a href="/dashboard" className="block text-center text-sm text-gray-400 hover:text-gray-600">
          &larr; Back to dashboard
        </a>
      </main>
    </div>
  );
}
