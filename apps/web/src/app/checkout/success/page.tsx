import { CheckCircle2 } from "lucide-react";

import { ROUTES } from "@/common/routes";
import { CheckoutStatusSection } from "@/components/feature/subscription/CheckoutStatusSection";

export default function Page() {
  return (
    <CheckoutStatusSection
      icon={CheckCircle2}
      iconClassName="bg-primary/10 text-primary"
      title="Payment successful"
      description="Your subscription is being activated. It can take a few seconds to show up — refresh your dashboard if it's not there yet."
      primaryHref={ROUTES.DASHBOARD}
      primaryLabel="Go to dashboard"
      secondaryHref={ROUTES.PRICING}
      secondaryLabel="View plans"
    />
  );
}
