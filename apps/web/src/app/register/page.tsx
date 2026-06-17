"use client";
import { Container } from "@/components/ui/container";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <Container className="flex flex-col justify-center max-w-sm">
      <RegisterForm />
    </Container>
  );
}
