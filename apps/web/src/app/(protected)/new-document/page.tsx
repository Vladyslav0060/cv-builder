import { Container } from "@/components/ui/container";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";
import { NewDocumentForm } from "../../../components/feature/document/NewDocumentForm";

export default function Page() {
  return (
    <Container variant="fullMobileConstrainedBreakpointPadded" paddingY="sm">
      <div className="flex size-full justify-center">
        <NewDocumentForm />
      </div>
    </Container>
  );
}
