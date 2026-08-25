import type { Metadata } from "next";
import Brand from "@/components/Brand";
import HostApplicationWizard from "@/components/host/HostApplicationWizard";
import HostApplicationStatusCard from "@/components/host/HostApplicationStatusCard";
import { getCurrentSession } from "@/lib/auth/session";
import { getHostApplication } from "@/lib/db/hosts";
import { getPublishedDestinations } from "@/lib/db/destinations";

export const metadata: Metadata = {
  title: "Become a Host — Bleetary Travels",
  description:
    "Lead your community on unforgettable trips. Earn income and build deeper connection while Bleetary handles all operations, logistics, and payments.",
};

export default async function BecomeAHostPage() {
  const session = await getCurrentSession();

  let existingApplication = null;
  if (session?.uid) {
    existingApplication = await getHostApplication(session.uid);
  }

  const destinations = await getPublishedDestinations();

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col">
      {/* Minimal Header */}
      <header className="border-b border-gray-100 bg-white py-4 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <Brand compact />
        {session ? (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500 hidden sm:inline">Signed in as</span>
            <span className="font-bold text-gray-900">{session.displayName}</span>
          </div>
        ) : null}
      </header>

      {/* Main Content: Dynamic Status or Application Wizard */}
      <main className="flex-1 flex flex-col justify-center py-6 sm:py-12">
        {existingApplication ? (
          <HostApplicationStatusCard
            application={existingApplication}
            userDisplayName={session?.displayName || "Host"}
          />
        ) : (
          <HostApplicationWizard
            initialUser={
              session
                ? {
                    uid: session.uid,
                    email: session.email,
                    displayName: session.displayName,
                  }
                : null
            }
            availableDestinations={destinations.map((d) => ({
              id: d.id,
              name: d.name,
              country: d.country,
              region: d.region,
            }))}
          />
        )}
      </main>
    </div>
  );
}
