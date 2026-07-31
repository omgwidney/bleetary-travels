import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import VerifyEmailPanel from "@/components/auth/VerifyEmailPanel";

export const metadata: Metadata = {
  title: "Verify email — Bleetary Travels",
};

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; oobCode?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard
      title="Verify your email"
      description="Email verification is required before Bleetary creates a secure server session."
    >
      <VerifyEmailPanel email={params.email} oobCode={params.oobCode} />
    </AuthCard>
  );
}
