import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Controller, useFormContext } from "react-hook-form";
import { PERSONAL_NAME_FIELDS } from "./ProfileForm";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUploadInput } from "./AvatarUploadInput";
import { useCurrentUser } from "@/hooks/auth/current-user";
import { resolveAvatarUrl } from "@/lib/avatar-url";
import { useSignOut } from "@/hooks/auth/useSignOut";
import { Button } from "@/components/ui/button";
import { SignOutIcon } from "@phosphor-icons/react";

const CONTACT_FIELDS = [
  {
    name: "linkedIn",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/...",
  },
  {
    name: "portfolio",
    label: "Portfolio",
    placeholder: "https://...",
  },
] as const;

const ADDRESS_FIELDS = [
  { name: "city", label: "City" },
  { name: "state", label: "State" },
  { name: "zip", label: "ZIP" },
] as const;

export interface TabGroupProps {
  isPending: boolean;
}

export const PersonalInfoInputs = ({ isPending }: TabGroupProps) => {
  const form = useFormContext();
  const currentUser = useCurrentUser();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  const initials =
    currentUser?.firstName
      ? currentUser.firstName[0].toUpperCase()
      : currentUser?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <>
      <AvatarUploadInput
        currentAvatarUrl={resolveAvatarUrl(currentUser?.avatarUrl)}
        initials={initials}
      />

      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Email</FieldLabel>
            <FieldContent>
              <Input
                placeholder="you@example.com"
                autoComplete="email"
                disabled
                {...field}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </FieldContent>
          </Field>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {PERSONAL_NAME_FIELDS.map((fieldConfig) => (
          <Controller
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{fieldConfig.label}</FieldLabel>
                <FieldContent>
                  <Input
                    placeholder={fieldConfig.placeholder}
                    disabled={isPending}
                    {...field}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </FieldContent>
              </Field>
            )}
          />
        ))}
      </div>

      {/* <div className="flex justify-end border-t pt-6">
        <Button
          type="button"
          variant="destructive"
          disabled={isSigningOut}
          onClick={() => signOut()}
        >
          <SignOutIcon size={15} />
          {isSigningOut ? "Signing out…" : "Sign out"}
        </Button>
      </div> */}
    </>
  );
};

export const ContactInfoInputs = ({ isPending }: TabGroupProps) => {
  const form = useFormContext();
  return (
    <>
      <Controller
        control={form.control}
        name="phone"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Phone</FieldLabel>
            <FieldContent>
              <Input
                placeholder="+1 555 000 0000"
                disabled={isPending}
                {...field}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </FieldContent>
          </Field>
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {CONTACT_FIELDS.map((fieldConfig) => (
          <Controller
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{fieldConfig.label}</FieldLabel>
                <FieldContent>
                  <Input
                    placeholder={fieldConfig.placeholder}
                    disabled={isPending}
                    {...field}
                  />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </FieldContent>
              </Field>
            )}
          />
        ))}
      </div>
    </>
  );
};

export const AddressInfoInputs = ({ isPending }: TabGroupProps) => {
  const form = useFormContext();
  return (
    <>
      <Controller
        control={form.control}
        name="address"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Address</FieldLabel>
            <FieldContent>
              <Input
                placeholder="Street address"
                disabled={isPending}
                {...field}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </FieldContent>
          </Field>
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        {ADDRESS_FIELDS.map((fieldConfig) => (
          <Controller
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>{fieldConfig.label}</FieldLabel>
                <FieldContent>
                  <Input disabled={isPending} {...field} />
                  <FieldError
                    errors={fieldState.error ? [fieldState.error] : []}
                  />
                </FieldContent>
              </Field>
            )}
          />
        ))}
      </div>

      <Controller
        control={form.control}
        name="country"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Country</FieldLabel>
            <FieldContent>
              <Input disabled={isPending} {...field} />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </FieldContent>
          </Field>
        )}
      />
    </>
  );
};

export const CVInputs = ({ isPending }: TabGroupProps) => {
  const form = useFormContext();
  return (
    <>
      {(
        [
          ["summary", "Summary", "A short professional summary"],
          ["skills", "Skills", "Comma-separated or free text"],
          ["experience", "Experience", "Your recent roles and impact"],
          ["education", "Education", "Degrees, courses, certificates"],
          ["achievements", "Achievements", "Awards, publications, etc."],
          ["projects", "Projects", "Notable projects, side work, or portfolio pieces"],
          ["certifications", "Certifications", "Certifications or licenses you hold"],
        ] as const
      ).map(([name, label, desc]) => (
        <Controller
          key={name}
          control={form.control}
          name={name}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>{label}</FieldLabel>
              <FieldContent>
                <Textarea
                  placeholder={desc}
                  disabled={isPending}
                  rows={4}
                  {...field}
                />
                <FieldDescription>{desc}</FieldDescription>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : []}
                />
              </FieldContent>
            </Field>
          )}
        />
      ))}
    </>
  );
};
