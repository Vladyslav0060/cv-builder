"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/auth/useMe";

export function AuthGate({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();
  const { data: me, isLoading } = useMe();

  useEffect(() => {
    if (isLoading || me === undefined) return;

    if (!me) {
      router.replace("/login");
      return;
    }

    if (adminOnly && me.role !== "admin") {
      router.replace("/403");
    }
  }, [adminOnly, isLoading, me, router]);

  if (isLoading || me === undefined) return null;
  if (!me) return null;
  if (adminOnly && me.role !== "admin") return null;

  return <>{children}</>;
}
