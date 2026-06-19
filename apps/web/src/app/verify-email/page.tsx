"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
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
import { ROUTES } from "@/common/routes";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { mutate: verify, isPending, isError, error } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendVerification();

  const code = digits.join("");

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  }

  function handleSubmit() {
    if (code.length < 6) return;
    verify(code, {
      onSuccess: () => {
        router.replace(ROUTES.HOME);
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorMessage = (error as any)?.response?.data?.message ?? "Invalid or expired code.";

  return (
    <Container className="flex flex-col justify-center max-w-sm">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Check your email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to your email address. Enter it below to
            verify your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-10 h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {isError && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          <Button
            className="w-full"
            disabled={code.length < 6 || isPending}
            onClick={handleSubmit}
          >
            {isPending ? "Verifying…" : "Verify email"}
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            Didn&apos;t receive a code?{" "}
            <button
              className="underline underline-offset-4 hover:no-underline disabled:opacity-50"
              disabled={isResending}
              onClick={() => resend()}
            >
              {isResending ? "Sending…" : "Resend code"}
            </button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
