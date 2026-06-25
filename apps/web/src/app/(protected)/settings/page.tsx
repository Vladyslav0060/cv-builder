import { Container } from "@/components/ui/container";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";
import { CurrentPlanCard } from "@/components/feature/subscription/CurrentPlanCard";

export default function Settings() {
  return (
    <Container variant="constrainedPadded" paddingY="sm">
      <PageBreadcrumbs
        items={[
          { href: ROUTES.HOME, title: "Home" },
          { href: ROUTES.SETTINGS, title: "Settings" },
        ]}
      />
      <div className="mt-6 max-w-xl">
        <CurrentPlanCard />
      </div>
    </Container>
  );
}
