import Link from "next/link";
import { MapPinOff, ArrowLeft, Search } from "lucide-react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-xl w-full bg-white rounded-3xl border border-gray-100 shadow-[0_12px_45px_rgba(0,0,0,0.08)] p-8 sm:p-12 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[#f05c40]/10 text-[#f05c40] flex items-center justify-center mx-auto mb-6">
            <MapPinOff size={40} />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#13b5b1] mb-2">
            404 — Page Not Found
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
            Looks like you&apos;ve wandered off the trail
          </h1>
          <p className="text-gray-500 leading-relaxed mt-4 text-base">
            The page or trip you&apos;re looking for doesn&apos;t exist or has moved. Explore our active community group trips or head back home.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#f05c40] hover:bg-[#d94e34] text-white font-bold px-6 py-3.5 rounded-full text-sm transition-all duration-200 shadow-md"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
            <Link
              href="/trips"
              className="inline-flex items-center justify-center gap-2 border border-[#13b5b1] text-[#0d9b97] hover:bg-[#13b5b1] hover:text-white font-bold px-6 py-3.5 rounded-full text-sm transition-all duration-200"
            >
              <Search size={16} /> Browse Group Trips
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
