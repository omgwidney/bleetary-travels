import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create an account — Bleetary Travels",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Join Bleetary"
      description="Create a traveler account. Host and admin access is granted only after review."
    >
      <RegisterForm />
    </AuthCard>
  );
}
