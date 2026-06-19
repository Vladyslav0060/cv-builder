import { Container } from "@/components/ui/container";
import ResetPasswordForm from "./ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <Container className="flex flex-col justify-center max-w-sm">
      <ResetPasswordForm token={token ?? ""} />
    </Container>
  );
}
