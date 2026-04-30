"use client";

import { AuthGate } from "@/components/feature/auth/AuthGate";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate>{children}</AuthGate>;
}
