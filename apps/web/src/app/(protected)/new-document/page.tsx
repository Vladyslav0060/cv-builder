import { Container } from "@/components/ui/container";
import { PageBreadcrumbs } from "@/components/layout/page-breadcrumbs";
import { ROUTES } from "@/common/routes";
import { NewDocumentForm } from "../../../components/feature/document/NewDocumentForm";

export default function Page() {
  return (
    <Container variant="narrowConstrainedPadded">
      <PageBreadcrumbs
        items={[
          { href: ROUTES.HOME, title: "Home" },
          { href: ROUTES.DOCUMENTS, title: "Documents" },
          { href: ROUTES.NEW_DOCUMENT, title: "New Document" },
        ]}
      />
      <div className="flex size-full justify-center">
        <NewDocumentForm />
      </div>
    </Container>
  );
}
