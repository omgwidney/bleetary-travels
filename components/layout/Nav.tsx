import Link from "next/link";
import Brand from "@/components/Brand";

export interface NavProps {
  activeHref?: string;
}

const navigation = [
  { label: "Travel", href: "/trips" },
  { label: "Host", href: "/become-a-host" },
  { label: "About", href: "/coming-soon" },
  { label: "Blog", href: "/coming-soon" },
];

export default function Nav({ activeHref }: NavProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <nav
        aria-label="Primary navigation"
        className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between"
      >
        <Brand />

        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`text-sm font-medium transition-colors ${
                activeHref === item.href
                  ? "text-[#13b5b1] font-semibold"
                  : "text-gray-700 hover:text-[#13b5b1]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/become-a-host"
            id="nav-become-host-cta"
            className="inline-flex items-center gap-1.5 bg-[#f05c40] hover:bg-[#d94e34] text-white text-sm font-semibold px-4 py-2 rounded-full transition-all duration-200 shadow-[0_4px_14px_rgba(240,92,64,0.35)] hover:shadow-[0_6px_20px_rgba(240,92,64,0.45)] hover:-translate-y-0.5"
          >
            Become a Host
          </Link>
        </div>
      </nav>
    </header>
  );
}
