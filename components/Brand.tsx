import Link from "next/link";
import { MapPin } from "lucide-react";

interface BrandProps {
  compact?: boolean;
  inverse?: boolean;
}

export default function Brand({
  compact = false,
  inverse = false,
}: BrandProps) {
  return (
    <Link
      href="/"
      aria-label="Bleetary Travels home"
      className="inline-flex items-center gap-2 shrink-0"
    >
      <span
        className={`${compact ? "w-7 h-7" : "w-8 h-8"} rounded-full bg-gradient-to-br from-[#13b5b1] to-[#0d9b97] flex items-center justify-center`}
      >
        <MapPin size={compact ? 14 : 16} className="text-white" />
      </span>
      <span
        className={`${compact ? "text-lg" : "text-xl"} font-black tracking-tight ${inverse ? "text-white" : "text-gray-900"}`}
      >
        bleetary<span className="text-[#13b5b1]">.</span>
      </span>
    </Link>
  );
}
