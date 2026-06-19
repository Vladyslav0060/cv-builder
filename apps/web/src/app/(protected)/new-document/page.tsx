import { Container } from "@/components/ui/container";
import { NewDocumentForm } from "../../../components/feature/document/NewDocumentForm";

export default function Page() {
  return (
    <Container variant="constrainedBreakpointPadded" paddingY="sm">
      <div className="flex size-full justify-center">
        <NewDocumentForm />
      </div>
    </Container>
  );
}
