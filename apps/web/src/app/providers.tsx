"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrentUserProvider, useSetCurrentUser } from "@/hooks/auth/current-user";
import { useEnrichedUser } from "@/hooks/user/useEnrichedUser";
import { useMe } from "@/hooks/auth/useMe";
import { BreadcrumbsProvider } from "@/lib/contexts/BreadCrumbContext";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

function CurrentUserHydrator() {
  const { data: me } = useMe();
  const { data: enrichedUser } = useEnrichedUser(me?.id);
  const setCurrentUser = useSetCurrentUser();

  useEffect(() => {
    if (me === undefined) return;

    if (!me) {
      setCurrentUser(null);
      return;
    }

    if (enrichedUser === undefined) {
      setCurrentUser(undefined);
      return;
    }

    setCurrentUser(enrichedUser ?? null);
  }, [me, enrichedUser, setCurrentUser]);

  return null;
}

function GoogleLoginHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const transferToken = searchParams.get("transfer_token");
  const didRun = useRef(false);

  useEffect(() => {
    if (!transferToken || didRun.current) return;
    didRun.current = true;

    axios
      .post(
        "/api-backend/auth/transfer-session",
        { token: transferToken },
        { withCredentials: true },
      )
      .then(() => {
        queryClient.invalidateQueries();
        toast.success("Logged in successfully");
        router.replace(pathname);
      })
      .catch(() => {
        toast.error("Login failed. Please try again.");
        router.replace(pathname);
      });
  }, [transferToken, pathname, queryClient, router]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <QueryClientProvider client={client}>
          <CurrentUserProvider value={undefined}>
            <CurrentUserHydrator />
            <Suspense fallback={null}>
              <GoogleLoginHandler />
            </Suspense>
            <BreadcrumbsProvider>{children}</BreadcrumbsProvider>
          </CurrentUserProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
