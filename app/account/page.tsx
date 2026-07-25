import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import LogoutButton from "@/components/auth/LogoutButton";
import { requireSession } from "@/lib/auth/session";

export default async function AccountPage() {
  const session = await requireSession("/account");

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#13b5b1]">
            {session.role} account
          </p>
          <h1 className="mt-2 text-4xl font-black text-gray-900">
            Welcome, {session.displayName}
          </h1>
          <p className="mt-3 text-gray-500">{session.email}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#f4f5f7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Email status
              </p>
              <p className="mt-2 font-bold text-gray-900">Verified</p>
            </div>
            <div className="rounded-2xl bg-[#f4f5f7] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Access role
              </p>
              <p className="mt-2 font-bold capitalize text-gray-900">
                {session.role}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {session.role === "host" && (
              <Link
                href="/host/dashboard"
                className="rounded-full bg-[#13b5b1] px-5 py-2.5 text-sm font-bold text-white"
              >
                Host dashboard
              </Link>
            )}
            {session.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-full bg-[#13b5b1] px-5 py-2.5 text-sm font-bold text-white"
              >
                Admin workspace
              </Link>
            )}
            <LogoutButton className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
