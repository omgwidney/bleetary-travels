import Link from "next/link";
import { MapPinOff } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f4f5f7] flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#f05c40]/10 text-[#f05c40] flex items-center justify-center mx-auto mb-6">
          <MapPinOff size={30} />
        </div>
        <p className="text-sm font-black tracking-widest text-[#13b5b1] uppercase">
          404
        </p>
        <h1 className="text-4xl font-black text-gray-900 mt-2">
          This route is off the map
        </h1>
        <p className="text-gray-500 mt-4">
          The page may have moved, or it has not joined the Bleetary itinerary
          yet.
        </p>
        <Link
          href="/"
          className="inline-flex mt-8 bg-[#f05c40] hover:bg-[#d94e34] text-white font-bold px-7 py-3 rounded-full"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
