import HostQuiz from "@/components/HostQuiz";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";

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
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#13b5b1] flex items-center justify-center">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">
            bleetary<span className="text-[#13b5b1]">.</span>
          </span>
        </Link>
      </header>

      {/* Quiz */}
      <HostQuiz />
    </div>
  );
}
