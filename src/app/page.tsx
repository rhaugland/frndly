import Link from "next/link";
import { WeatherIcon } from "@/components/weather-icon";

function FrndlyLogo({ className = "" }: { className?: string }) {
  const letters = [
    { char: "f", color: "text-amber-400" },
    { char: "r", color: "text-sky-400" },
    { char: "n", color: "text-blue-300" },
    { char: "d", color: "text-indigo-300" },
    { char: "l", color: "text-violet-300" },
    { char: "y", color: "text-slate-400" },
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-violet-50">
      <header className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
        <FrndlyLogo className="text-2xl font-bold tracking-tight" />
        <Link
          href="/login"
          className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 transition-colors"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pt-20 pb-24 text-center">
        <h2 className="mb-6 text-5xl font-bold tracking-tight text-slate-800 leading-tight">
          Your team&apos;s calendar is a mess.
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
            We turned it into a weather forecast.
          </span>
        </h2>

        <p className="mb-10 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Sunny means they&apos;re free. Stormy means stay away.
          No more decoding calendar blobs — just glance and know.
        </p>

        <Link
          href="/login"
          className="inline-block rounded-xl bg-gradient-to-r from-amber-300 via-sky-400 to-violet-400 px-10 py-4 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
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
          <div className="rounded-2xl bg-white/50 backdrop-blur-sm p-6 shadow-sm border border-sky-100">
            <WeatherIcon condition="sunny" size={24} />
            <h3 className="mt-3 font-semibold text-slate-800">Glance, don&apos;t guess</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              One look tells you who&apos;s free and who&apos;s slammed. No more opening five calendars.
            </p>
          </div>
          <div className="rounded-2xl bg-white/50 backdrop-blur-sm p-6 shadow-sm border border-sky-100">
            <WeatherIcon condition="partly_cloudy" size={24} />
            <h3 className="mt-3 font-semibold text-slate-800">Reach out at the right time</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              frndly suggests when someone&apos;s actually available — not just &ldquo;has a gap.&rdquo;
            </p>
          </div>
          <div className="rounded-2xl bg-white/50 backdrop-blur-sm p-6 shadow-sm border border-sky-100">
            <WeatherIcon condition="thunderstorm" size={24} />
            <h3 className="mt-3 font-semibold text-slate-800">Respect everyone&apos;s day</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              See when teammates are in a thunderstorm so you know to wait.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
