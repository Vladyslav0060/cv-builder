import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";

export function WizardStepMessage({
  title,
  description,
  footer,
}: {
  title: string;
  description: string;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="border-border/60 bg-card/85 shadow-sm backdrop-blur">
      <CardContent className="flex flex-col items-start gap-4 p-5 sm:p-8">
        <div className="space-y-2">
          <CardTitle className="text-xl leading-tight sm:text-2xl">
            {title}
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm sm:text-base">
            {description}
          </CardDescription>
        </div>
      </CardContent>
      {footer ? (
        <CardFooter className="flex-col-reverse justify-between gap-3 sm:flex-row [&>button]:w-full sm:[&>button]:w-auto">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  );
}
