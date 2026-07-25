import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import PasswordResetForm from "@/components/auth/PasswordResetForm";

export const metadata: Metadata = {
  title: "Choose a new password — Bleetary Travels",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ oobCode?: string }>;
}) {
  const { oobCode } = await searchParams;
  return (
    <AuthCard
      title="Choose a new password"
      description="Use at least eight characters and keep this password unique to Bleetary."
    >
      <PasswordResetForm oobCode={oobCode} />
    </AuthCard>
  );
}
