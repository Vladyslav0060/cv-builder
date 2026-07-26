"use client";

import { memo } from "react";
import type { Control } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

import { NewDocumentWizardValues } from "./wizard-step-schemas";
import { WizardStep } from "./wizard-steps";
import { WizardStepField } from "./wizard-step-field";
import { WizardStepMessage } from "./wizard-step-message";

export const WizardStepPanel = memo(function WizardStepPanel({
  step,
  control,
  disabled,
  footer,
}: {
  step: WizardStep;
  control: Control<NewDocumentWizardValues>;
  disabled: boolean;
  footer?: React.ReactNode;
}) {
  if (step.kind === "message") {
    return (
      <WizardStepMessage
        title={step.title}
        description={step.description}
        footer={footer}
      />
    );
  }

  return (
    <Card className="border-border/60 bg-card/85 shadow-sm backdrop-blur">
      <CardHeader className="border-b border-border/60 pb-5">
        <CardTitle className="text-xl leading-tight sm:text-2xl">
          {step.title}
        </CardTitle>
        <CardDescription className="max-w-2xl text-sm sm:text-base">
          {step.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">
            {step.fields.map((field) => (
              <WizardStepField
                key={field.name}
                config={field}
                control={control}
                disabled={disabled}
              />
            ))}
          </div>
        </FieldGroup>
      </CardContent>
      {footer ? (
        <CardFooter className="flex-col-reverse justify-between gap-3 sm:flex-row [&>button]:w-full sm:[&>button]:w-auto">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
});
