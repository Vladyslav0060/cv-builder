"use client";

import { useBreadcrumbsContext } from "@/lib/contexts/BreadCrumbContext";
import { useEffect } from "react";

export const useBreadcrumbs = (next?: { title: string; href: string }[]) => {
  const { breadcrumbs, setBreadcrumbs } = useBreadcrumbsContext();

  useEffect(() => {
    if (!next) return;
    setBreadcrumbs(next);
  }, [next, setBreadcrumbs]);

  return [breadcrumbs?.items ?? [], setBreadcrumbs] as const;
};
