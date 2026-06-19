"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "../ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ReadCvLogoIcon } from "@phosphor-icons/react";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/common/routes";
import Link from "next/link";
import { Container } from "../ui/container";
import { useCurrentUser } from "@/hooks/auth/current-user";
import { resolveAvatarUrl } from "@/lib/avatar-url";
import { useState } from "react";

export function TopNav() {
  const router = useRouter();
  const { mutate: handleSignOut } = useSignOut();
  const [_, setMenuOpen] = useState(false);
  const currentUser = useCurrentUser();

  return (
    <header className="relative w-full top-0 z-50 border-b border-border">
      <Container
        variant={"fullMobileConstrainedBreakpointPadded"}
        paddingY="none"
      >
        <div className="flex h-14 items-center gap-3">
          <div className="flex gap-1 items-center">
            <ReadCvLogoIcon size={16} />
            <Link href={ROUTES.HOME} className="font-semibold">
              CV Builder
            </Link>
          </div>

          <div className="flex-1" />

          <ModeToggle />
          <DropdownMenu onOpenChange={(value) => setMenuOpen(value)}>
            <DropdownMenuTrigger asChild>
              <button className="relative cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                {currentUser ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push(ROUTES.PROFILE)}
                      className="relative"
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(ROUTES.DOCUMENTS)}
                    >
                      Documents
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push(ROUTES.NEW_DOCUMENT)}
                    >
                      New Document
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSignOut()}>
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onClick={() => router.push(ROUTES.LOGIN)}>
                    Sign In
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Container>
    </header>
  );
}
