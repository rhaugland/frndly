import { AuthButton } from "@/components/auth-button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-sky-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Forecast</h1>
        <p className="mb-8 text-sm text-gray-500">
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
