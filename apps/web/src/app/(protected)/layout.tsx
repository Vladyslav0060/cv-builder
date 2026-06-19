"use client";

import { AuthGate } from "@/components/feature/auth/AuthGate";
import { useMe } from "@/hooks/auth/useMe";
import { useResendVerification } from "@/hooks/auth/useResendVerification";

function UnverifiedBanner() {
  const { data: me } = useMe();
  const { mutate: resend, isPending } = useResendVerification();

  if (!me || me.emailVerified !== false) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm px-4 py-2 flex items-center gap-2">
      <span>Please verify your email address.</span>
      <button
        onClick={() => resend()}
        disabled={isPending}
        className="underline underline-offset-4 hover:no-underline disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Resend verification email"}
      </button>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <UnverifiedBanner />
      {children}
    </AuthGate>
  );
}
