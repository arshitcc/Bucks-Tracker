import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";

function OAuthCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-white px-10 py-12 shadow-xl">
        {/* Spinner */}
        <div className="flex items-center justify-center rounded-full bg-indigo-100 p-4">
          <Loader2Icon className="h-8 w-8 animate-spin text-indigo-600" />
        </div>

        {/* Text */}
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Signing you in
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            We’re securely connecting your account. Please wait…
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-full animate-pulse bg-indigo-500" />
        </div>
      </div>
      <AuthenticateWithRedirectCallback />
      <div id="clerk-captcha" />
    </div>
  );
}

export default OAuthCallback;
