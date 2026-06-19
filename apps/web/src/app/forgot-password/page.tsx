"use client";
import { Container } from "@/components/ui/container";
import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Container className="flex flex-col justify-center max-w-sm">
      <ForgotPasswordForm />
    </Container>
  );
}
