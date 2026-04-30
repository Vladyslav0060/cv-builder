// apps/web/src/app/login/LoginForm.tsx
"use client";

import { useLogin } from "@/hooks/auth/useLogin";
import {
  useForm,
  SubmitHandler,
  Controller,
  FormProvider,
} from "react-hook-form";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/hooks/auth/useRegister";
import { AuthControllerSignUpBody } from "@/api/models/auth/auth.zod";

// const registerSchema = z.object({
//   firstName: z.string().min(1),
//   lastName: z.string().min(1),
//   email: z.email().min(1),
//   password: z.string().min(1),
//   // role: z?.string(),
//   // avatarUrl: z?.string(),
// });

type RegisterDto = z.infer<typeof AuthControllerSignUpBody>;

export default function RegisterForm() {
  const { mutate: handleRegister } = useRegister();
  const methods = useForm<RegisterDto>({
    resolver: zodResolver(AuthControllerSignUpBody),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit: SubmitHandler<RegisterDto> = async (formData) => {
    handleRegister({ ...formData, role: "user", avatarUrl: "" });
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: "grid", gap: 12 }}
      >
        <Controller
          control={control}
          name="firstName"
          rules={{ required: true }}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="firstname">First Name</FieldLabel>
              <Input placeholder="First Name" {...field} />
            </Field>
          )}
        ></Controller>

        <Controller
          control={control}
          name="lastName"
          rules={{ required: true }}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input placeholder="LastName" {...field} />
            </Field>
          )}
        ></Controller>

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

        {/* <button type="submit" disabled={login.isPending}>
        {login.isPending ? "Signing in…" : "Sign in"}
      </button>

      {login.isError && (
        <p style={{ color: "crimson" }}>
          {login.error instanceof Error ? login.error.message : "Login failed"}
        </p>
      )} */}
        <Button type="submit">Login</Button>
      </form>
    </FormProvider>
  );
}
