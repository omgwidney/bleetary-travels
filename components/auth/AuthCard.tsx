import type { ReactNode } from "react";
import Link from "next/link";
import Brand from "@/components/Brand";

export default function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <h1 className="text-3xl font-black text-gray-900">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {description}
          </p>
          {process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              Local test accounts only. Your live Bleetary account does not work in this test environment.
            </p>
          )}
          <div className="mt-7">{children}</div>
        </section>
        <p className="mt-6 text-center text-xs text-gray-500">
          <Link href="/" className="font-semibold text-[#0d9b97] hover:underline">
            ← Back to Bleetary Travels
          </Link>
        </p>
      </div>
    </main>
  );
}
