"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/common/routes";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  type Crumb,
  useBreadcrumbsContext,
} from "@/lib/contexts/BreadCrumbContext";

const STATIC_BREADCRUMBS: Record<string, Crumb[]> = {
  [ROUTES.DASHBOARD]: [
    { href: ROUTES.HOME, title: "Home" },
    { href: ROUTES.DASHBOARD, title: "Dashboard" },
  ],
  [ROUTES.PROFILE]: [
    { href: ROUTES.HOME, title: "Home" },
    { href: ROUTES.PROFILE, title: "Profile" },
  ],
  [ROUTES.DOCUMENTS]: [
    { href: ROUTES.HOME, title: "Home" },
    { href: ROUTES.DOCUMENTS, title: "Documents" },
  ],
  [ROUTES.NEW_DOCUMENT]: [
    { href: ROUTES.HOME, title: "Home" },
    { href: ROUTES.DOCUMENTS, title: "Documents" },
    { href: ROUTES.NEW_DOCUMENT, title: "New Document" },
  ],
};

const HIDDEN_PATHS = new Set([
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  "/403",
]);

function getFallbackBreadcrumbs(pathname: string) {
  if (HIDDEN_PATHS.has(pathname)) return [];

  if (pathname.startsWith(`${ROUTES.DOCUMENTS}/`)) {
    return [
      { href: ROUTES.HOME, title: "Home" },
      { href: ROUTES.DOCUMENTS, title: "Documents" },
      { href: pathname, title: "Details" },
    ];
  }

  return STATIC_BREADCRUMBS[pathname] ?? [];
}

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const { breadcrumbs } = useBreadcrumbsContext();

  const items =
    breadcrumbs?.pathname === pathname
      ? breadcrumbs.items
      : getFallbackBreadcrumbs(pathname);

  if (!items.length) return null;

  return (
    <div
      suppressHydrationWarning
      className="bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <div
        suppressHydrationWarning
        className="mx-auto flex h-12 max-w-7xl items-center px-4 sm:px-6 lg:px-8"
      >
        <Breadcrumb className="w-full">
          <BreadcrumbList className="flex-nowrap overflow-x-auto whitespace-nowrap">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <React.Fragment key={`${item.href}-${item.title}`}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="max-w-[60vw] truncate">
                        {item.title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild className="max-w-[60vw] truncate">
                        <Link href={item.href}>{item.title}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast ? <BreadcrumbSeparator /> : null}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
