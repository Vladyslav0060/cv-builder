"use client";

import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { useForm, Controller, FormProvider, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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

const resetSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

export default function ResetPasswordForm({
  token,
  className,
  ...props
}: { token: string } & React.ComponentProps<"div">) {
  const { mutate: submit, isPending } = useResetPassword();

  const methods = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const { handleSubmit, control } = methods;

  const onSubmit: SubmitHandler<ResetFormValues> = ({ newPassword }) => {
    submit({ token, newPassword });
  };

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardContent className="pt-6 text-center text-sm">
            <p>Invalid or missing reset token.</p>
            <Link href={ROUTES.FORGOT_PASSWORD} className="mt-4 inline-block underline underline-offset-4">
              Request a new link
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Set a new password</CardTitle>
            <CardDescription>
              Choose a password with at least 6 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: "grid", gap: 12 }}
            >
              <FieldGroup>
                <Controller
                  control={control}
                  name="newPassword"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="newPassword" aria-invalid={fieldState.invalid}>
                        New password
                      </FieldLabel>
                      <Input
                        type="password"
                        placeholder="••••••"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <p className="text-destructive text-xs mt-1">{fieldState.error.message}</p>
                      )}
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="confirmPassword" aria-invalid={fieldState.invalid}>
                        Confirm password
                      </FieldLabel>
                      <Input
                        type="password"
                        placeholder="••••••"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <p className="text-destructive text-xs mt-1">{fieldState.error.message}</p>
                      )}
                    </Field>
                  )}
                />
                <Field>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Updating…" : "Update password"}
                  </Button>
                  <FieldDescription className="text-center">
                    <Link href={ROUTES.LOGIN}>Back to login</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
}
