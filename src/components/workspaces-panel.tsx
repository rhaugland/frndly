"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Workspace {
  id: string;
  name: string;
  inviteCode: string;
  isActive: boolean;
  isOwner: boolean;
  memberCount: number;
}

export function WorkspacesPanel({ workspaces, currentTeamId }: { workspaces: Workspace[]; currentTeamId: string }) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    if (!newName.trim()) return;
    setLoading(true);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      setCreating(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleSwitch(teamId: string) {
    if (teamId === currentTeamId) return;
    setSwitching(teamId);
    const res = await fetch("/api/team/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    if (res.ok) {
      router.refresh();
    }
    setSwitching(null);
  }

  function handleCopy(inviteCode: string) {
    const url = `${window.location.origin}/join/${inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(inviteCode);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {workspaces.map((w) => (
          <div
            key={w.id}
            className={`rounded-2xl border bg-white/50 backdrop-blur-sm p-5 transition-all ${
              w.isActive ? "border-sky-300 ring-2 ring-sky-200" : "border-sky-100"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800">{w.name}</h3>
                  {w.isActive && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                      Active
                    </span>
                  )}
                  {w.isOwner && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                      Owner
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {w.memberCount} member{w.memberCount !== 1 ? "s" : ""}
                </p>
              </div>
              {!w.isActive && (
                <button
                  onClick={() => handleSwitch(w.id)}
                  disabled={switching === w.id}
                  className="rounded-lg bg-sky-400 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 transition-colors disabled:opacity-50"
                >
                  {switching === w.id ? "Switching..." : "Switch"}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/join/${w.inviteCode}`}
                className="flex-1 rounded-lg border border-sky-200 bg-white/70 px-3 py-1.5 text-xs text-slate-600 truncate"
              />
              <button
                onClick={() => handleCopy(w.inviteCode)}
                className="shrink-0 rounded-lg border border-sky-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-sky-50 transition-colors"
              >
                {copied === w.inviteCode ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {creating ? (
        <div className="rounded-2xl border border-sky-100 bg-white/50 backdrop-blur-sm p-5 space-y-3">
          <input
            type="text"
            placeholder="Workspace name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="w-full rounded-xl border border-sky-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            autoFocus
            maxLength={100}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={loading || !newName.trim()}
              className="flex-1 rounded-xl bg-sky-400 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create workspace"}
            </button>
            <button
              onClick={() => { setCreating(false); setNewName(""); }}
              className="rounded-xl border border-sky-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-sky-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="w-full rounded-xl border-2 border-dashed border-sky-200 px-4 py-4 text-sm font-medium text-sky-400 hover:border-sky-300 hover:text-sky-500 hover:bg-white/30 transition-colors"
        >
          + New workspace
        </button>
      )}
    </div>
  );
}
