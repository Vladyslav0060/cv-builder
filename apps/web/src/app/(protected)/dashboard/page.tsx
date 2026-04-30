import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";

export default function Page() {
  return (
    <>
      <PageBreadcrumbs
        items={[
          { href: ROUTES.HOME, title: "Home" },
          { href: ROUTES.DASHBOARD, title: "Dashboard" },
        ]}
      />
      <div>test</div>
    </>
  );
}
