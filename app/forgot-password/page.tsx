import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import PasswordResetForm from "@/components/auth/PasswordResetForm";

export const metadata: Metadata = {
  title: "Reset password — Bleetary Travels",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your account email and Firebase will send a secure reset link."
    >
      <PasswordResetForm />
    </AuthCard>
  );
}
