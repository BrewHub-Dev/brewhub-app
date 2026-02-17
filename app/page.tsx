"use client";
import LoginForm from "@/features/auth/ui/LoginForm";
import AuthGuard from "@/features/auth/ui/AuthGuard";

export default function Home() {
  return (
    <AuthGuard mode="public">
      <LoginForm />
    </AuthGuard>
  );
}
