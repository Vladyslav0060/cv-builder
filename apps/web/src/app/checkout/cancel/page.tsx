import { XCircle } from "lucide-react";

import { ROUTES } from "@/common/routes";
import { CheckoutStatusSection } from "@/components/feature/subscription/CheckoutStatusSection";

export default function Page() {
  return (
    <CheckoutStatusSection
      icon={XCircle}
      iconClassName="bg-destructive/10 text-destructive"
      title="Checkout canceled"
      description="No worries — you haven't been charged. You can pick a plan whenever you're ready."
      primaryHref={ROUTES.PRICING}
      primaryLabel="Back to pricing"
      secondaryHref={ROUTES.DASHBOARD}
      secondaryLabel="Go to dashboard"
    />
  );
}
