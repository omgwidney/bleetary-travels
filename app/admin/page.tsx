import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import LogoutButton from "@/components/auth/LogoutButton";
import AdminPortal from "@/components/admin/AdminPortal";
import { requireRole } from "@/lib/auth/session";
import {
  getAdminOverviewMetrics,
  getAllHostApplicationsAdmin,
  getAllTripsAdmin,
  getRecentAuditEvents,
} from "@/lib/db/admin";
import { ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await requireRole(["admin"], "/login?next=/admin");

  const [metrics, applications, trips, auditEvents] = await Promise.all([
    getAdminOverviewMetrics(),
    getAllHostApplicationsAdmin(),
    getAllTripsAdmin(),
    getRecentAuditEvents(50),
  ]);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col justify-between">
      <Nav />
      <main className="mx-auto max-w-7xl w-full px-4 py-8 sm:py-10 sm:px-6 space-y-8 flex-1">
        {/* Admin Header Banner */}
        <section className="rounded-3xl border border-gray-100 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-teal-300 text-xs font-black uppercase tracking-wider mb-2">
                <ShieldCheck size={13} />
                Administrator Workspace
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Bleetary Operations & Control Center
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Logged in as <span className="font-semibold text-gray-800">{session.email}</span> ({session.displayName})
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href="/account"
                className="rounded-xl border border-gray-200 hover:bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 transition-colors"
              >
                My Account
              </Link>
              <LogoutButton className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors" />
            </div>
          </div>
        </section>

        {/* Master Operations Portal */}
        <AdminPortal
          metrics={metrics}
          applications={applications}
          trips={trips}
          auditEvents={auditEvents}
        />
      </main>
      <Footer />
    </div>
  );
}
