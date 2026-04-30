import { Container } from "@/components/ui/container";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";
import { ProfileForm } from "../../../components/feature/profile/ProfileForm";

export default function Profile() {
  return (
    <Container variant={"fullMobileConstrainedPadded"} paddingY={"sm"}>
      <PageBreadcrumbs
        items={[
          { href: ROUTES.HOME, title: "Home" },
          { href: ROUTES.PROFILE, title: "Profile" },
        ]}
      />
      <ProfileForm />
    </Container>
  );
}
