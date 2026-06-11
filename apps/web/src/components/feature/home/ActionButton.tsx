"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/common/routes";
import { Button } from "@/components/ui/button";
import { useMe } from "@/hooks/auth/useMe";

export const ActionButton = () => {
  const { data: me } = useMe();
  const href = me?.isAuthenticated ? ROUTES.NEW_DOCUMENT : ROUTES.LOGIN;
  const label = me?.isAuthenticated ? "Create your resume" : "Get started free";

  return (
    <Button asChild size="lg" className="h-11 rounded-full px-6 text-base">
      <Link href={href}>
        {label}
        <ArrowRight className="size-4" />
      </Link>
    </Button>
  );
};
