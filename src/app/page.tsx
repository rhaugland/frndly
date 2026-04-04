import Link from "next/link";
import { WeatherIcon } from "@/components/weather-icon";

function FrndlyLogo({ className = "" }: { className?: string }) {
  const letters = [
    { char: "f", color: "text-amber-400" },
    { char: "r", color: "text-sky-400" },
    { char: "n", color: "text-slate-400" },
    { char: "d", color: "text-blue-500" },
    { char: "l", color: "text-purple-500" },
    { char: "y", color: "text-amber-500" },
  ];

  return (
    <span className={className}>
      {letters.map((l, i) => (
        <span key={i} className={l.color}>
          {l.char}
        </span>
      ))}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-amber-50 via-sky-50 via-60% to-purple-50">
      <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
        <FrndlyLogo className="text-2xl font-bold tracking-tight" />
        <Link
          href="/login"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-20 pb-24 text-center">
        <h2 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 leading-tight">
          Your team&apos;s calendar is a mess.
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            We turned it into a weather forecast.
          </span>
        </h2>

        <p className="mb-10 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Sunny means they&apos;re free. Stormy means stay away.
          No more decoding calendar blobs — just glance and know.
        </p>

        <Link
          href="/login"
          className="inline-block rounded-xl bg-gradient-to-r from-amber-400 via-blue-500 to-purple-500 px-10 py-4 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
        >
          Get your forecast
        </Link>

        <div className="mt-16 flex justify-center items-center gap-6">
          <WeatherIcon condition="sunny" size={36} />
          <WeatherIcon condition="partly_cloudy" size={36} />
          <WeatherIcon condition="cloudy" size={36} />
          <WeatherIcon condition="rain" size={36} />
          <WeatherIcon condition="thunderstorm" size={36} />
        </div>

        <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-10 text-left">
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-6 shadow-sm">
            <WeatherIcon condition="sunny" size={24} />
            <h3 className="mt-3 font-semibold text-gray-900">Glance, don&apos;t guess</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              One look tells you who&apos;s free and who&apos;s slammed. No more opening five calendars.
            </p>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-6 shadow-sm">
            <WeatherIcon condition="partly_cloudy" size={24} />
            <h3 className="mt-3 font-semibold text-gray-900">Reach out at the right time</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              frndly suggests when someone&apos;s actually available — not just &ldquo;has a gap.&rdquo;
            </p>
          </div>
          <div className="rounded-2xl bg-white/60 backdrop-blur-sm p-6 shadow-sm">
            <WeatherIcon condition="thunderstorm" size={24} />
            <h3 className="mt-3 font-semibold text-gray-900">Respect everyone&apos;s day</h3>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              See when teammates are in a thunderstorm so you know to wait.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
