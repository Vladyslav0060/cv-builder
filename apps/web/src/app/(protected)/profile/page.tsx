import { Container } from "@/components/ui/container";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";
import { ProfileForm } from "../../../components/feature/profile/ProfileForm";
import { CurrentPlanCard } from "@/components/feature/subscription/CurrentPlanCard";

export default function Profile() {
  return (
    <Container variant={"constrainedPadded"} paddingY={"sm"} className="gap-4">
      <PageBreadcrumbs
        items={[
          { href: ROUTES.HOME, title: "Home" },
          { href: ROUTES.PROFILE, title: "Profile" },
        ]}
      />
      <CurrentPlanCard />
      <ProfileForm />
    </Container>
  );
}
