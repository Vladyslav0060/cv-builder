"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import * as _ from "lodash";
import { usePathname } from "next/navigation";

export type Crumb = { title: string; href: string };

type BreadcrumbState = {
  pathname: string;
  items: Crumb[];
} | null;

type BreadcrumbsContextValue = {
  breadcrumbs: BreadcrumbState;
  setBreadcrumbs: (next: Crumb[]) => void;
};

const BreadcrumbsContext = createContext<BreadcrumbsContextValue | undefined>(
  undefined,
);

export function BreadcrumbsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbState>(null);

  const setBreadcrumbs = useCallback(
    (next: Crumb[]) => {
      setBreadcrumbsState((prev) =>
        prev && prev.pathname === pathname && _.isEqual(prev.items, next)
          ? prev
          : { pathname, items: next },
      );
    },
    [pathname],
  );

  const value = useMemo(() => ({ breadcrumbs, setBreadcrumbs }), [breadcrumbs, setBreadcrumbs]);

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  );
}

export function useBreadcrumbsContext() {
  const ctx = useContext(BreadcrumbsContext);
  if (!ctx)
    throw new Error(
      "useBreadcrumbsContext must be used within BreadcrumbsProvider",
    );
  return ctx;
}
