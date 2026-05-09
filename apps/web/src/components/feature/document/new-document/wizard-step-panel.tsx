"use client";

import type { Control } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";

import { NewDocumentWizardValues } from "./wizard-step-schemas";
import { WizardStep } from "./wizard-steps";
import { WizardStepField } from "./wizard-step-field";
import { WizardStepMessage } from "./wizard-step-message";

export function WizardStepPanel({
  step,
  control,
  disabled,
}: {
  step: WizardStep;
  control: Control<NewDocumentWizardValues>;
  disabled: boolean;
}) {
  if (step.kind === "message") {
    return (
      <WizardStepMessage
        title={step.title}
        description={step.description}
        continueLabel={step.continueLabel}
      />
    );
  }

  return (
    <Card className="border-border/60 bg-card/85 shadow-sm backdrop-blur">
      <CardHeader className="border-b border-border/60 pb-5">
        <CardTitle className="text-2xl">{step.title}</CardTitle>
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
    </Card>
  );
}
