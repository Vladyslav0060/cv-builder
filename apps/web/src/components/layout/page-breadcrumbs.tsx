"use client";

import { Crumb } from "@/lib/contexts/BreadCrumbContext";
import { useBreadcrumbs } from "@/hooks/layout/useLayout";

export function PageBreadcrumbs({ items }: { items: Crumb[] }) {
  useBreadcrumbs(items);
  return null;
}

