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
      </CardContent>
    </Card>
  );
}

