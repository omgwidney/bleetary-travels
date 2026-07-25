import Link from "next/link";
import Brand from "@/components/Brand";
import { getCurrentSession } from "@/lib/auth/session";
import { roleHome } from "@/lib/auth/roles";

export default async function UnauthorizedPage() {
  const session = await getCurrentSession();
  const home = session ? roleHome(session.role) : "/login";

  return (
    <main className="min-h-screen bg-[#f4f5f7] px-4 py-16">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mb-8 flex justify-center">
          <Brand />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#f05c40]">
          Access restricted
        </p>
        <h1 className="mt-3 text-3xl font-black text-gray-900">
          This area needs a different role
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Your account is signed in, but it does not have permission to open this
          workspace.
        </p>
        <Link
          href={home}
          className="mt-7 inline-flex rounded-full bg-[#13b5b1] px-6 py-3 text-sm font-bold text-white"
        >
          Go to my account
        </Link>
      </div>
    </main>
  );
}
