"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../ui/mode-toggle";
import {
  ReadCvLogoIcon,
  FilesIcon,
  FilePlusIcon,
  TagIcon,
  SignInIcon,
} from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/common/routes";
import Link from "next/link";
import { Container } from "../ui/container";
import { useCurrentUser } from "@/hooks/auth/current-user";
import { resolveAvatarUrl } from "@/lib/avatar-url";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: ROUTES.DOCUMENTS, label: "Documents", icon: FilesIcon },
  { href: ROUTES.NEW_DOCUMENT, label: "New Document", icon: FilePlusIcon },
  { href: ROUTES.PRICING, label: "Pricing", icon: TagIcon },
];

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useCurrentUser();

  return (
    <header className="relative w-full top-0 z-50">
      <Container
        variant={"fullMobileConstrainedBreakpointPadded"}
        paddingY="none"
      >
        <div className="flex h-14 items-center gap-3 px-4 xl:px-0">
          <div className="flex flex-1 items-center gap-1">
            <ReadCvLogoIcon size={16} />
            <Link href={ROUTES.HOME} className="font-semibold">
              CV Builder
            </Link>
          </div>

          {currentUser && (
            <nav className="flex items-center gap-1 rounded-full border border-border bg-muted/40 p-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href || pathname.startsWith(`${href}/`);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex flex-1 items-center justify-end gap-2">
            <ModeToggle />

            {currentUser ? (
              <Link
                href={ROUTES.PROFILE}
                className="relative cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar size="default">
                  {resolveAvatarUrl(currentUser?.avatarUrl) && (
                    <AvatarImage
                      src={resolveAvatarUrl(currentUser?.avatarUrl)!}
                      alt="Avatar"
                    />
                  )}
                  <AvatarFallback>
                    {currentUser?.firstName
                      ? currentUser.firstName[0].toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button size="default" onClick={() => router.push(ROUTES.LOGIN)}>
                <SignInIcon size={15} />
                Sign in
              </Button>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
