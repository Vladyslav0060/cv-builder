"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CurrentUserProvider, useSetCurrentUser } from "@/hooks/auth/current-user";
import { useEnrichedUser } from "@/hooks/user/useEnrichedUser";
import { useMe } from "@/hooks/auth/useMe";
import { BreadcrumbsProvider } from "@/lib/contexts/BreadCrumbContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";

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

function GoogleLoginToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const auth = searchParams.get("auth");

  useEffect(() => {
    if (auth !== "google") return;

    toast.success("Logged in successfully");
    router.replace(pathname);
  }, [auth, pathname, router]);

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
              <GoogleLoginToast />
            </Suspense>
            <BreadcrumbsProvider>{children}</BreadcrumbsProvider>
          </CurrentUserProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
