import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import Brand from "@/components/Brand";
import { requireRole } from "@/lib/auth/session";
import { COLLECTIONS } from "@/lib/data-model";

export default async function AdminPage() {
  const session = await requireRole(["admin"], "/admin");
  const collections = Object.values(COLLECTIONS);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="rounded-xl bg-white px-4 py-2">
            <Brand compact />
          </div>
          <LogoutButton className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/10" />
        </header>

        <section className="mt-12">
          <p className="text-sm font-bold uppercase tracking-widest text-teal-300">
            Protected admin workspace
          </p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">
            Core data foundation
          </h1>
          <p className="mt-3 max-w-2xl text-slate-300">
            Signed in as {session.email}. Privileged mutations are available only
            through authenticated server endpoints and are recorded in auditEvents.
          </p>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <div
              key={collection}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <p className="font-mono text-sm text-teal-200">{collection}</p>
              <p className="mt-2 text-xs text-slate-400">
                Rules and typed contracts configured
              </p>
            </div>
          ))}
        </section>

        <Link
          href="/account"
          className="mt-10 inline-flex text-sm font-bold text-teal-300 hover:underline"
        >
          View my account →
        </Link>
      </div>
    </main>
  );
}
