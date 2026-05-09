"use client";

import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CreateDocumentDtoCreationMode,
  DocumentType,
} from "@/api/generated.schemas";

import { NewDocumentWizardValues } from "./wizard-step-schemas";
import { WizardFieldConfig } from "./wizard-steps";

export function WizardStepField({
  config,
  control,
  disabled,
}: {
  config: WizardFieldConfig;
  control: Control<NewDocumentWizardValues>;
  disabled: boolean;
}) {
  if (config.name === "creationMode") {
    return (
      <Controller
        control={control}
        name="creationMode"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{config.label}</FieldLabel>
            <FieldContent>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={config.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CreateDocumentDtoCreationMode.ACCOUNT}>
                    Use account data
                  </SelectItem>
                  <SelectItem value={CreateDocumentDtoCreationMode.SCRATCH}>
                    Write from scratch
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </FieldContent>
          </Field>
        )}
      />
    );
  }

  if (config.name === "type") {
    return (
      <Controller
        control={control}
        name="type"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>{config.label}</FieldLabel>
            <FieldContent>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={config.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DocumentType.COVER_LETTER}>
                    Cover Letter
                  </SelectItem>
                  <SelectItem value={DocumentType.RESUME}>Resume</SelectItem>
                </SelectContent>
              </Select>
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </FieldContent>
          </Field>
        )}
      />
    );
  }

  return (
    <Controller
      control={control}
      name={config.name}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className={config.multiline ? "md:col-span-2" : undefined}
        >
          <FieldLabel>{config.label}</FieldLabel>
          <FieldContent>
            {config.multiline ? (
              <Textarea
                placeholder={config.placeholder}
                className="min-h-28"
                disabled={disabled}
                {...field}
              />
            ) : (
              <Input
                placeholder={config.placeholder}
                disabled={disabled}
                {...field}
              />
            )}
            {config.description ? (
              <p className="text-xs text-muted-foreground">
                {config.description}
              </p>
            ) : null}
            <FieldError errors={fieldState.error ? [fieldState.error] : []} />
          </FieldContent>
        </Field>
      )}
    />
  );
}
