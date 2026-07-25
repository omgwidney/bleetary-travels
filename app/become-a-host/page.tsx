import HostQuiz from "@/components/HostQuiz";
import Brand from "@/components/Brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Host — Bleetary Travels",
  description:
    "Lead your community on the trip of a lifetime. Earn $1,000+ per trip while Bleetary Travels handles the logistics.",
};

export default function BecomeAHostPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-gray-100 py-4 px-6">
        <Brand compact />
      </header>

      {/* Quiz */}
      <HostQuiz />
    </div>
  );
}
