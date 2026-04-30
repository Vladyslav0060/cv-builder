// apps/web/src/app/login/LoginForm.tsx
"use client";

import { useLogin } from "@/hooks/auth/useLogin";
import {
  useForm,
  SubmitHandler,
  Controller,
  FormProvider,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthControllerLoginBody } from "@/api/models/auth/auth.zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAuthControllerGoogleAuthUrl } from "@/api/generated";
import Link from "next/link";
import { ROUTES } from "@/common/routes";

type LoginDto = z.infer<typeof AuthControllerLoginBody>;

export default function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { mutate: handleLogin } = useLogin();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5050";
  const googleAuthPath = getAuthControllerGoogleAuthUrl().replace(
    /^https?:\/\/[^/]+/,
    "",
  );
  const googleAuthUrl = `${apiBaseUrl}${googleAuthPath}`;

  const methods = useForm<LoginDto>({
    resolver: zodResolver(AuthControllerLoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { handleSubmit, control } = methods;

  const onSubmit: SubmitHandler<LoginDto> = async (formData: LoginDto) => {
    handleLogin(formData);
  };

  return (
    <FormProvider {...methods}>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription>
              Login with your Apple or Google account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: "grid", gap: 12 }}
            >
              <FieldGroup>
                <Field>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      window.location.href = googleAuthUrl;
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    Login with Google
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or continue with
                </FieldSeparator>
                <Controller
                  control={control}
                  name="email"
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel
                        htmlFor="email"
                        aria-invalid={fieldState.invalid}
                      >
                        Email
                      </FieldLabel>
                      <Input
                        placeholder="Email"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                    </Field>
                  )}
                />
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: true }}
                  render={({ field, fieldState }) => (
                    <Field>
                      <div className="flex items-center">
                        <FieldLabel
                          htmlFor="password"
                          aria-invalid={fieldState.invalid}
                        >
                          Password
                        </FieldLabel>
                        <a
                          href="#"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Forgot your password?
                        </a>
                      </div>
                      <Input
                        placeholder="Password"
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                    </Field>
                  )}
                ></Controller>
                {/* <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input id="password" type="password" required />
                </Field> */}
                <Field>
                  <Button type="submit">Login</Button>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{" "}
                    <Link href={ROUTES.REGISTER}>Sign up</Link>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
        <FieldDescription className="px-6 text-center">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </FormProvider>
  );
}

{
  /* <form onSubmit={handleSubmit(onSubmit)} style={{ display: "grid", gap: 12 }}>
  <Controller
    control={control}
    name="email"
    rules={{ required: true }}
    render={({ field }) => (
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input placeholder="Email" {...field} />
      </Field>
    )}
  ></Controller>

  <Controller
    control={control}
    name="password"
    rules={{ required: true }}
    render={({ field }) => (
      <Field>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input placeholder="Password" {...field} />
      </Field>
    )}
  ></Controller>
  <Button type="submit">Login</Button>
</form>; */
}
