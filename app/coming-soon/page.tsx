import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Nav from "@/components/layout/Nav";

export const metadata: Metadata = {
  title: "Coming Soon — Bleetary Travels",
  description: "This Bleetary Travels feature is on the product roadmap.",
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-gray-100 shadow-[0_12px_45px_rgba(0,0,0,0.08)] p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#13b5b1]/10 text-[#0d9b97] flex items-center justify-center mx-auto mb-6">
            <Compass size={30} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#13b5b1] mb-3">
            On the roadmap
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
            This experience is coming soon
          </h1>
          <p className="text-gray-500 leading-relaxed mt-4">
            The link is ready, but the operational workflow belongs to a later
            MVP phase. You can still explore the current trip catalog or apply
            to become a host.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/trips"
              className="bg-[#f05c40] text-white font-bold px-6 py-3 rounded-full"
            >
              Explore trips
            </Link>
            <Link
              href="/become-a-host"
              className="border border-[#13b5b1] text-[#0d9b97] font-bold px-6 py-3 rounded-full"
            >
              Become a host
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
