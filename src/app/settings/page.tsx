"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [privacyLevel, setPrivacyLevel] = useState("free_busy");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ privacyLevel, workingHoursStart: workStart, workingHoursEnd: workEnd }),
    });
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calendar privacy
          </label>
          <select
            value={privacyLevel}
            onChange={(e) => setPrivacyLevel(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="free_busy">Free/busy only (default)</option>
            <option value="titles">Show event titles</option>
            <option value="full_details">Show full details</option>
          </select>
          <p className="mt-1 text-xs text-gray-400">
            Controls what teammates can see about your calendar.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work starts
            </label>
            <input
              type="time"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work ends
            </label>
            <input
              type="time"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>

        <a href="/dashboard" className="block text-center text-sm text-gray-400 hover:text-gray-600">
          &larr; Back to dashboard
        </a>
      </main>
    </div>
  );
}
