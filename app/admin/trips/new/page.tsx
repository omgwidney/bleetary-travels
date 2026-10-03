import Link from "next/link";
import { requireRole } from "@/lib/auth/session";
import { getAdminDb } from "@/lib/firebase-admin";
import TripEditor from "@/components/admin/TripEditor";

export default async function NewTripPage() {
  await requireRole(["admin"], "/admin/trips/new");
  const db = getAdminDb();
  const [hosts, destinations] = await Promise.all([
    db.collection("hostProfiles").where("status", "==", "published").get(),
    db.collection("destinations").get(),
  ]);
  return <main className="min-h-screen bg-slate-50 px-4 py-10"><div className="mx-auto max-w-5xl space-y-6">
    <Link href="/admin" className="text-sm font-semibold text-teal-700">← Admin workspace</Link>
    <div><h1 className="text-3xl font-black text-slate-900">Add a trip</h1><p className="mt-2 text-slate-600">Build the itinerary, assign a host and upload original photography.</p></div>
    <TripEditor hosts={hosts.docs.map(doc => ({ id: doc.id, name: String(doc.data().displayName ?? doc.id) }))} destinations={destinations.docs.map(doc => ({ id: doc.id, name: `${doc.data().name}, ${doc.data().country}`, status: String(doc.data().status) }))} />
  </div></main>;
}
