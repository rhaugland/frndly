import Link from "next/link";
import { WeatherIcon } from "@/components/weather-icon";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-sky-50 to-purple-50">
      <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Forecast</h1>
        <Link
          href="/login"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="mb-8 flex justify-center gap-4">
          <WeatherIcon condition="sunny" size={48} />
          <WeatherIcon condition="partly_cloudy" size={48} />
          <WeatherIcon condition="cloudy" size={48} />
          <WeatherIcon condition="rain" size={48} />
          <WeatherIcon condition="thunderstorm" size={48} />
        </div>

        <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900">
          See your team&apos;s week as weather
        </h2>
        <p className="mb-8 text-lg text-gray-500 max-w-xl mx-auto">
          Connect your calendar. Sunny means open, thunderstorm means
          back-to-back. Know when to reach out — and when to wait.
        </p>

        <Link
          href="/login"
          className="inline-block rounded-xl bg-gray-900 px-8 py-4 text-base font-medium text-white hover:bg-gray-800 shadow-lg transition-all hover:shadow-xl"
        >
          Create a team
        </Link>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Connect</h3>
            <p className="text-sm text-gray-500">
              Plug in Google or Microsoft calendar. Read-only — we never touch your events.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Forecast</h3>
            <p className="text-sm text-gray-500">
              See everyone&apos;s day as weather. Sunny, cloudy, rainy, or thunderstorm at a glance.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Reach out</h3>
            <p className="text-sm text-gray-500">
              AI suggestions tell you the best time to ping someone — and when to wait.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
