import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export function WizardStepMessage({
  title,
  description,
  continueLabel,
}: {
  title: string;
  description: string;
  continueLabel: string;
}) {
  return (
    <Card className="border-border/60 bg-card/85 shadow-sm backdrop-blur">
      <CardContent className="flex flex-col items-start gap-4 p-8">
        <div className="space-y-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="max-w-2xl text-base">
            {description}
          </CardDescription>
        </div>
        <p className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          {continueLabel}
        </p>
      </CardContent>
    </Card>
  );
}

