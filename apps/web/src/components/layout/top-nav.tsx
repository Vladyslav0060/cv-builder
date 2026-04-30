"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModeToggle } from "../ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/common/routes";
import Link from "next/link";
import { Container } from "../ui/container";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/auth/current-user";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function TopNav() {
  const router = useRouter();
  const { mutate: handleSignOut } = useSignOut();
  const [menuOpen, setMenuOpen] = useState(false);
  const currentUser = useCurrentUser();
  const profileNotFilled =
    currentUser?.profileFilledPercentage &&
    currentUser?.profileFilledPercentage < 40;

  return (
    <header className="relative w-full top-0 z-50 border-b bg-background/60 backdrop-blur">
      <Container
        variant={"fullMobileConstrainedBreakpointPadded"}
        paddingY="none"
      >
        <div className="flex h-14 items-center gap-3">
          <Link href={ROUTES.HOME} className="font-semibold">
            CV Assistant
          </Link>

          <div className="flex-1" />

          <ModeToggle />
          <DropdownMenu onOpenChange={(value) => setMenuOpen(value)}>
            <DropdownMenuTrigger>
              <Avatar className="h-8 w-8 cursor-pointer relative">
                <AvatarFallback>
                  {currentUser?.firstName
                    ? currentUser.firstName[0].toLocaleUpperCase()
                    : "U"}
                </AvatarFallback>
                <div
                  className={cn(
                    "top-0 right-0 h-2 w-2 rounded-full bg-amber-300",
                    profileNotFilled && !menuOpen ? "absolute" : "hidden",
                  )}
                />
              </Avatar>
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
                      <div className="flex items-center gap-2">
                        <p>Profile</p>
                        <motion.div
                          className={cn(
                            "h-2 w-2 rounded-full bg-amber-300",
                            profileNotFilled && menuOpen ? "flex" : "hidden",
                          )}
                          animate={{ opacity: [1, 0.25, 1] }}
                          transition={{
                            duration: 1.1,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      </div>
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
