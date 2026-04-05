"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut } from "lucide-react";
import { WeatherIcon } from "./weather-icon";

type WeatherType = "sunny" | "partly_cloudy" | "cloudy" | "rain" | "thunderstorm";

interface Workspace {
  id: string;
  name: string;
  isActive: boolean;
}

interface TopBarProps {
  teamName: string;
  userName: string;
  userWeather?: WeatherType;
  workspaces: Workspace[];
}

export function TopBar({ teamName, userName, userWeather, workspaces }: TopBarProps) {
  const [wsOpen, setWsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const wsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) {
        setWsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSwitch(teamId: string) {
    setSwitching(teamId);
    setWsOpen(false);
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

  return (
    <header className="sticky top-0 z-[100] flex items-center justify-between border-b border-sky-100/50 bg-white/80 backdrop-blur-md px-6 py-4">
      {/* Workspace switcher (left) */}
      <div className="relative" ref={wsRef}>
        <button
          onClick={() => { setWsOpen(!wsOpen); setUserOpen(false); }}
          className="flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 hover:bg-white/50 transition-colors"
        >
          <h1 className="text-xl font-bold text-slate-800">
            {switching ? "Switching..." : teamName}
          </h1>
          {workspaces.length > 1 && (
            <ChevronDown
              size={18}
              className={`text-slate-400 transition-transform ${wsOpen ? "rotate-180" : ""}`}
            />
          )}
        </button>

        {wsOpen && workspaces.length > 1 && (
          <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-sky-100 bg-white shadow-lg py-1 z-[200]">
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => !w.isActive && handleSwitch(w.id)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  w.isActive
                    ? "bg-sky-50 text-sky-600 font-medium"
                    : "text-slate-700 hover:bg-sky-50/50"
                }`}
              >
                {w.name}
                {w.isActive && (
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User menu (right) */}
      <div className="relative" ref={userRef}>
        <button
          onClick={() => { setUserOpen(!userOpen); setWsOpen(false); }}
          className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/50 transition-colors"
        >
          {userWeather && <WeatherIcon condition={userWeather} size={28} />}
          <span className="text-sm font-medium text-slate-700">{userName}</span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${userOpen ? "rotate-180" : ""}`}
          />
        </button>

        {userOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 rounded-xl border border-sky-100 bg-white shadow-lg py-1 z-[200]">
            <div className="px-4 py-2 border-b border-sky-100/50">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Workspaces</p>
            </div>
            {workspaces.map((w) => (
              <button
                key={w.id}
                onClick={() => { if (!w.isActive) handleSwitch(w.id); setUserOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  w.isActive
                    ? "bg-sky-50 text-sky-600 font-medium"
                    : "text-slate-700 hover:bg-sky-50/50"
                }`}
              >
                {w.name}
                {w.isActive && (
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-600">
                    Active
                  </span>
                )}
              </button>
            ))}
            <div className="border-t border-sky-100/50 mt-1 pt-1">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
