import type { Metadata } from "next";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Bleetary Travels",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; verified?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthCard
      title="Welcome back"
      description={
        params.verified
          ? "Your email is verified. Sign in to continue."
          : "Sign in with your verified email to access your Bleetary account."
      }
    >
      <LoginForm nextPath={params.next} />
    </AuthCard>
  );
}
