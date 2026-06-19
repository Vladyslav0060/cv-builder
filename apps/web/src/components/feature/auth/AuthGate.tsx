"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/auth/useMe";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: me, isLoading } = useMe();

  useEffect(() => {
    if (isLoading || me === undefined) return;

    if (!me) {
      router.replace("/login");
      return;
    }

    if (me.emailVerified === false) {
      router.replace("/verify-email");
    }
  }, [isLoading, me, router]);

  if (isLoading || me === undefined) return null;
  if (!me) return null;
  if (me.emailVerified === false) return null;

  return <>{children}</>;
}
