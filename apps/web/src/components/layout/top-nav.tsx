"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../ui/mode-toggle";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  ReadCvLogoIcon,
  FilesIcon,
  FilePlusIcon,
  TagIcon,
  SignInIcon,
  ListIcon,
  UserIcon,
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
            <nav className="hidden items-center gap-1 rounded-full border border-border bg-muted/40 p-1 md:flex">
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
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <ListIcon size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="justify-between">
                <div>
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  {currentUser && (
                    <nav className="flex flex-col gap-1 px-4">
                      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                        const isActive =
                          pathname === href || pathname.startsWith(`${href}/`);

                        return (
                          <SheetClose asChild key={href}>
                            <Link
                              href={href}
                              className={cn(
                                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                isActive
                                  ? "bg-muted text-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                              )}
                            >
                              <Icon size={16} />
                              {label}
                            </Link>
                          </SheetClose>
                        );
                      })}
                    </nav>
                  )}
                </div>

                <SheetFooter className="gap-1 border-t">
                  <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground">
                    Theme
                    <ModeToggle />
                  </div>

                  {currentUser ? (
                    <SheetClose asChild>
                      <Link
                        href={ROUTES.PROFILE}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          pathname === ROUTES.PROFILE
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <UserIcon size={16} />
                        Profile
                      </Link>
                    </SheetClose>
                  ) : (
                    <SheetClose asChild>
                      <Link
                        href={ROUTES.LOGIN}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <SignInIcon size={16} />
                        Sign in
                      </Link>
                    </SheetClose>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>

            <div className="hidden items-center gap-2 md:flex">
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
                <Button
                  size="default"
                  onClick={() => router.push(ROUTES.LOGIN)}
                >
                  <SignInIcon size={15} />
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
