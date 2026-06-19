"use client";

import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { useForm, Controller, FormProvider, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthControllerForgotPasswordBody } from "@/api/models/auth/auth.zod";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ROUTES } from "@/common/routes";

type ForgotPasswordDto = z.infer<typeof AuthControllerForgotPasswordBody>;

export default function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutate: submit, isPending, isSuccess } = useForgotPassword();

  const methods = useForm<ForgotPasswordDto>({
    resolver: zodResolver(AuthControllerForgotPasswordBody),
    defaultValues: { email: "" },
  });
  const { handleSubmit, control } = methods;

  const onSubmit: SubmitHandler<ForgotPasswordDto> = (data) => {
    submit(data);
  };

  return (
    <FormProvider {...methods}>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center text-sm py-4">
                <p className="font-medium">Check your inbox</p>
                <p className="text-muted-foreground mt-1">
                  If an account exists for that email, you&apos;ll receive a password reset link shortly.
                </p>
                <Link
                  href={ROUTES.LOGIN}
                  className="mt-4 inline-block underline underline-offset-4 text-sm"
                >
                  Back to login
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                style={{ display: "grid", gap: 12 }}
              >
                <FieldGroup>
                  <Controller
                    control={control}
                    name="email"
                    rules={{ required: true }}
                    render={({ field, fieldState }) => (
                      <Field>
                        <FieldLabel htmlFor="email" aria-invalid={fieldState.invalid}>
                          Email
                        </FieldLabel>
                        <Input
                          placeholder="john.doe@example.com"
                          type="email"
                          {...field}
                          aria-invalid={fieldState.invalid}
                        />
                      </Field>
                    )}
                  />
                  <Field>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Sending…" : "Send reset link"}
                    </Button>
                    <FieldDescription className="text-center">
                      Remember your password?{" "}
                      <Link href={ROUTES.LOGIN}>Log in</Link>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
