"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyEmail } from "@/hooks/auth/useVerifyEmail";
import { useResendVerification } from "@/hooks/auth/useResendVerification";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ROUTES } from "@/common/routes";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { mutate: verify, isPending, isSuccess, isError } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendVerification();

  useEffect(() => {
    if (token) {
      verify(token);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Container className="flex flex-col justify-center max-w-sm">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Email verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-sm">
          {!token && (
            <CardDescription>
              No verification token found. Please click the link in your email.
            </CardDescription>
          )}
          {token && isPending && (
            <CardDescription>Verifying your email…</CardDescription>
          )}
          {isSuccess && (
            <>
              <p className="font-medium text-base">Email verified!</p>
              <p className="text-muted-foreground mt-1">
                Your email address has been confirmed.
              </p>
              <Link
                href={ROUTES.LOGIN}
                className="mt-4 inline-block underline underline-offset-4"
              >
                Go to login
              </Link>
            </>
          )}
          {isError && (
            <>
              <p className="font-medium text-base text-destructive">
                Verification failed
              </p>
              <p className="text-muted-foreground mt-1">
                The link may have expired or already been used.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                disabled={isResending}
                onClick={() => resend()}
              >
                {isResending ? "Sending…" : "Resend verification email"}
              </Button>
              <p className="text-muted-foreground text-xs mt-2">
                (Requires being logged in)
              </p>
              <Link
                href={ROUTES.LOGIN}
                className="mt-3 inline-block underline underline-offset-4"
              >
                Back to login
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
