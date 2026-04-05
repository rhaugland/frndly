import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuthButton } from "@/components/auth-button";
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

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-violet-50">
      <div className="w-full max-w-sm rounded-2xl bg-white/50 backdrop-blur-sm p-8 shadow-md border border-sky-100">
        <div className="mb-4 flex justify-center gap-2">
          <WeatherIcon condition="sunny" size={20} />
          <WeatherIcon condition="partly_cloudy" size={20} />
          <WeatherIcon condition="cloudy" size={20} />
          <WeatherIcon condition="rain" size={20} />
          <WeatherIcon condition="thunderstorm" size={20} />
        </div>
        <FrndlyLogo className="mb-1 block text-center text-2xl font-bold tracking-tight" />
        <p className="mb-8 text-center text-sm text-sky-400">
          See your team&apos;s week as weather
        </p>
        <div className="space-y-3">
          <AuthButton provider="google" label="Sign in with Google" />
          <AuthButton provider="azure-ad" label="Sign in with Microsoft" />
        </div>
      </div>
    </div>
  );
}
