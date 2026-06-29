import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import LoginForm from "../../components/feature/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your CV Builder account to manage your resumes and cover letters.",
};

export default function LoginPage() {
  return (
    <Container className="flex flex-col justify-center max-w-sm">
      <LoginForm />
    </Container>
  );
}
