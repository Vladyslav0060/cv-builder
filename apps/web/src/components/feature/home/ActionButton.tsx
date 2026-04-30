"use client";

import { ROUTES } from "@/common/routes";
import { useMe } from "@/hooks/auth/useMe";
import Link from "next/link";

export const ActionButton = () => {
  const { data: me } = useMe();
  return me?.isAuthenticated ? (
    <Link
      href={ROUTES.NEW_DOCUMENT}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-semibold shadow-lg hover:shadow-green-500/30 transition-all duration-200 text-lg"
    >
      Get Started
    </Link>
  ) : (
    <Link
      href={ROUTES.LOGIN}
      className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-semibold shadow-lg hover:shadow-green-500/30 transition-all duration-200 text-lg"
    >
      Sign in
    </Link>
  );
};
