"use client";

import { DocumentType } from "@/api/generated.schemas";
import { DocumentControllerCreateDocumentBody } from "@/api/models/document/document.zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateDocument } from "@/hooks/document/useCreateDocument";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

type NewDocumentFormValues = z.infer<
  typeof DocumentControllerCreateDocumentBody
>;

export const NewDocumentForm = () => {
  const { mutate: handleCreateDocument, isPending } = useCreateDocument();
  const form = useForm<NewDocumentFormValues>({
    defaultValues: {
      company: "",
      content: "",
      description: "",
      jobTitle: "",
      type: "COVER_LETTER",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (values: NewDocumentFormValues) => {
    console.log({ values });
    const res = await handleCreateDocument(values);
    console.log("res: ", res);
  };
  return (
    <div className="flex w-full min-w-0 flex-col gap-1 max-w-lg">
      <Card className="w-full h-fit">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FieldGroup>
              <Controller
                control={form.control}
                name="company"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Company</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="Your Company"
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

              <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Description</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="description"
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

              <Controller
                control={form.control}
                name="jobTitle"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Job Title</FieldLabel>
                    <FieldContent>
                      <Input
                        placeholder="Job Title"
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

              <Controller
                control={form.control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Type</FieldLabel>
                    <FieldContent>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={DocumentType.COVER_LETTER}>
                            Cover Letter
                          </SelectItem>
                          <SelectItem value={DocumentType.RESUME}>
                            Resume
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={fieldState.error ? [fieldState.error] : []}
                      />
                    </FieldContent>
                  </Field>
                )}
              />
              <Field orientation="horizontal" className="flex justify-end">
                <Button type="submit">Generate</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
