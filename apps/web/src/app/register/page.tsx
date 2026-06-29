import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a free CV Builder account and start building polished resumes and cover letters.",
};

export default function RegisterPage() {
  return (
    <Container className="flex flex-col justify-center max-w-sm">
      <RegisterForm />
    </Container>
  );
}
