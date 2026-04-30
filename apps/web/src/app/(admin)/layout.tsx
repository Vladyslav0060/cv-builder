"use client";

import { AuthGate } from "@/components/feature/auth/AuthGate";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGate adminOnly>{children}</AuthGate>;
}
