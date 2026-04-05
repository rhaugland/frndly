"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WeatherIcon } from "./weather-icon";

export function OnboardingScreen({ userName }: { userName: string }) {
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCreate() {
    if (!teamName.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName.trim() }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/team/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: inviteCode.trim() }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Invalid invite code");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-violet-50">
      <div className="w-full max-w-md rounded-2xl bg-white/50 backdrop-blur-sm p-8 shadow-md border border-sky-100">
        <div className="mb-6 flex justify-center gap-3">
          <WeatherIcon condition="sunny" size={28} />
          <WeatherIcon condition="partly_cloudy" size={28} />
          <WeatherIcon condition="thunderstorm" size={28} />
        </div>

        <h1 className="mb-1 text-center text-2xl font-bold text-slate-800">
          Welcome, {userName.split(" ")[0]}!
        </h1>
        <p className="mb-8 text-center text-sm text-sky-400">
          Create a team or join one with an invite code.
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        {mode === "choose" && (
          <div className="space-y-3">
            <button
              onClick={() => setMode("create")}
              className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
            >
              Create a new team
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full rounded-xl border border-sky-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-sky-50 transition-colors"
            >
              Join with invite code
            </button>
          </div>
        )}

        {mode === "create" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full rounded-xl border border-sky-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              autoFocus
              maxLength={100}
            />
            <button
              onClick={handleCreate}
              disabled={loading || !teamName.trim()}
              className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create team"}
            </button>
            <button
              onClick={() => { setMode("choose"); setError(""); }}
              className="w-full text-sm text-sky-400 hover:text-sky-600"
            >
              Back
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Paste invite code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              className="w-full rounded-xl border border-sky-200 px-4 py-3 text-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
              autoFocus
            />
            <button
              onClick={handleJoin}
              disabled={loading || !inviteCode.trim()}
              className="w-full rounded-xl bg-sky-400 px-4 py-3 text-sm font-medium text-white hover:bg-sky-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join team"}
            </button>
            <button
              onClick={() => { setMode("choose"); setError(""); }}
              className="w-full text-sm text-sky-400 hover:text-sky-600"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
