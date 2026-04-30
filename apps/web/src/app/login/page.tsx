"use client";
import { Container } from "@/components/ui/container";
import LoginForm from "../../components/feature/auth/LoginForm";

export default function LoginPage() {
  return (
    <Container className="flex flex-col justify-center max-w-sm">
      <LoginForm />
    </Container>
  );
}
