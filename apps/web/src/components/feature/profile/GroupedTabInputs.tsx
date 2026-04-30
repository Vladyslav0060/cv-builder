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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateUserDtoRole } from "@/api/generated.schemas";
import { Textarea } from "@/components/ui/textarea";

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
  return (
    <>
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

      <Controller
        control={form.control}
        name="avatarUrl"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Avatar URL</FieldLabel>
            <FieldContent>
              <Input
                placeholder="https://..."
                disabled={isPending}
                {...field}
              />
              <FieldDescription>Optional. Public image URL.</FieldDescription>
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="role"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Role</FieldLabel>
            <FieldContent>
              <Select
                value={field.value ?? ""}
                onValueChange={(v) =>
                  field.onChange(v ? (v as UpdateUserDtoRole) : undefined)
                }
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UpdateUserDtoRole.user}>User</SelectItem>
                  <SelectItem value={UpdateUserDtoRole.admin}>Admin</SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>
                If your backend ignores this for non-admins, it’s safe to leave.
              </FieldDescription>
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </FieldContent>
          </Field>
        )}
      />
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
