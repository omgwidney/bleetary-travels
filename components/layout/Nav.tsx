import Link from "next/link";
import Brand from "@/components/Brand";
import NavAuthSection from "@/components/layout/NavAuthSection";

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

        <NavAuthSection />
      </nav>
    </header>
  );
}

