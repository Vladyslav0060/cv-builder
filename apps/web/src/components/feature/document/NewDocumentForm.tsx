"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

import {
  CreateDocumentDto,
  CreateDocumentDtoCreationMode,
} from "@/api/generated.schemas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/auth/current-user";
import { useCreateDocument } from "@/hooks/document/useCreateDocument";
import { useEnrichedUser } from "@/hooks/user/useEnrichedUser";

import {
  trimOrUndefined,
  wizardDefaultValues,
} from "./new-document/wizard-schema";
import { buildApplicantInfoPayload } from "./new-document/wizard-applicant-info";
import {
  NewDocumentWizardValues,
  wizardResolverSchema,
} from "./new-document/wizard-step-schemas";
import { WizardStepPanel } from "./new-document/wizard-step-panel";
import { DocumentAiLoader } from "./new-document/document-ai-loader";
import { buildWizardSteps } from "./new-document/wizard-steps";

function toErrorPath(path: Array<string | number | symbol>) {
  const first = path[0];
  return typeof first === "string" ? first : null;
}

function applyZodErrors(
  form: UseFormReturn<NewDocumentWizardValues>,
  error: z.ZodError,
) {
  error.issues.forEach((issue) => {
    const fieldPath = toErrorPath(issue.path);
    if (!fieldPath) return;

    form.setError(fieldPath as keyof NewDocumentWizardValues, {
      type: "manual",
      message: issue.message,
    });
  });
}

function buildDocumentPayload(
  values: NewDocumentWizardValues,
): CreateDocumentDto {
  const applicantInfo = buildApplicantInfoPayload(values);

  return {
    company: trimOrUndefined(values.company) ?? "",
    applicantInfo,
    creationMode: values.creationMode,
    description: trimOrUndefined(values.description) ?? "",
    jobTitle: trimOrUndefined(values.jobTitle) ?? "",
    type: values.type,
  };
}

type DocumentWizardContentProps = {
  creationMode: NewDocumentWizardValues["creationMode"];
  createDocument: ReturnType<typeof useCreateDocument>["mutateAsync"];
  form: ReturnType<typeof useForm<NewDocumentWizardValues>>;
  isCreating: boolean;
};

function DocumentWizardContent({
  creationMode,
  createDocument,
  form,
  isCreating,
}: DocumentWizardContentProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = useMemo(() => buildWizardSteps(creationMode), [creationMode]);
  const activeStep = steps[stepIndex];
  const isBusy = isCreating;
  const isFinalFormStep =
    activeStep.kind === "form" && stepIndex === steps.length - 1;

  const goNext = async () => {
    if (activeStep.kind === "form") {
      const result = activeStep.schema.safeParse(form.getValues());
      if (!result.success) {
        applyZodErrors(form, result.error);
        return;
      }

      form.clearErrors(activeStep.fields.map((field) => field.name));
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setStepIndex((current) => Math.max(current - 1, 0));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const finalResult = wizardResolverSchema.safeParse(values);
    if (!finalResult.success) {
      applyZodErrors(form, finalResult.error);
      return;
    }

    await createDocument(buildDocumentPayload(values));
  });

  return (
    <div className="relative flex w-full min-w-0 max-w-3xl flex-col gap-4">
      <Card className="border-border/60 bg-card/85 shadow-sm backdrop-blur">
        <CardHeader className="space-y-3 border-b border-border/60 pb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-2xl">New document</CardTitle>
              <CardDescription className="max-w-2xl text-sm sm:text-base">
                {creationMode === CreateDocumentDtoCreationMode.SCRATCH
                  ? "Fill in your own details step by step, then let AI draft the content for you."
                  : "Fill in your profile details first, then generate a document from the saved account data."}
              </CardDescription>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-2 text-right text-xs text-muted-foreground">
              Step {stepIndex + 1} of {steps.length}
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-400 to-amber-300 transition-[width] duration-300 ease-out"
              style={{
                width: `${Math.max(8, ((stepIndex + 1) / steps.length) * 100)}%`,
              }}
            />
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={onSubmit} className="space-y-4">
        <WizardStepPanel
          step={activeStep}
          control={form.control}
          disabled={isBusy}
        />

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={stepIndex === 0 || isBusy}
          >
            Back
          </Button>

          {isFinalFormStep ? (
            <Button type="submit" disabled={isBusy}>
              {activeStep.kind === "form" && activeStep.submitLabel
                ? activeStep.submitLabel
                : "Continue"}
            </Button>
          ) : (
            <Button type="button" onClick={goNext} disabled={isBusy}>
              {activeStep.kind === "message"
                ? activeStep.continueLabel
                : (activeStep.submitLabel ?? "Continue")}
            </Button>
          )}
        </div>
      </form>

      {isCreating ? <DocumentAiLoader mode={creationMode} /> : null}
    </div>
  );
}

export const NewDocumentForm = () => {
  const currentUser = useCurrentUser();
  const { data: user } = useEnrichedUser(currentUser?.id);
  const { mutateAsync: createDocument, isPending: isCreating } =
    useCreateDocument();

  const form = useForm<NewDocumentWizardValues>({
    resolver: zodResolver(wizardResolverSchema),
    defaultValues: wizardDefaultValues,
    mode: "onChange",
  });

  const creationMode = useWatch({
    control: form.control,
    name: "creationMode",
  });

  useEffect(() => {
    if (creationMode === CreateDocumentDtoCreationMode.ACCOUNT && user) {
      form.reset({
        ...wizardDefaultValues,
        address: user?.address ?? "",
        achievements: user?.achievements ?? "",
        avatarUrl: user?.avatarUrl ?? "",
        city: user?.city ?? "",
        country: user?.country ?? "",
        education: user?.education ?? "",
        email: user?.email ?? "",
        experience: user?.experience ?? "",
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        linkedIn: user?.linkedIn ?? "",
        phone: user?.phone ?? "",
        portfolio: user?.portfolio ?? "",
        skills: user?.skills ?? "",
        state: user?.state ?? "",
        summary: user?.summary ?? "",
        zip: user?.zip ?? "",
      });
    }
  }, [creationMode, form, user]);

  useEffect(() => {
    if (creationMode !== CreateDocumentDtoCreationMode.SCRATCH) {
      return;
    }

    form.reset({
      ...wizardDefaultValues,
      creationMode: CreateDocumentDtoCreationMode.SCRATCH,
    });
  }, [creationMode, form]);

  return (
    <DocumentWizardContent
      key={creationMode}
      creationMode={creationMode}
      createDocument={createDocument}
      form={form}
      isCreating={isCreating}
    />
  );
};
