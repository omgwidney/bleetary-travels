import Link from "next/link";
import { LayoutDashboard, LogOut, Settings, User, Users } from "lucide-react";
import Brand from "@/components/Brand";

const navigation = [
  {
    label: "Dashboard",
    href: "/host/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Profile",
    href: "/coming-soon",
    icon: User,
    active: false,
  },
  {
    label: "Account",
    href: "/coming-soon",
    icon: Settings,
    active: false,
  },
  {
    label: "Refer a Host",
    href: "/coming-soon",
    icon: Users,
    active: false,
  },
  {
    label: "Log Out",
    href: "/coming-soon",
    icon: LogOut,
    active: false,
  },
];

export function HostSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white border-r border-gray-100 min-h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-gray-100">
        <Brand compact />
      </div>

      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#13b5b1] to-[#0d9b97] flex items-center justify-center text-white font-bold text-sm">
            WN
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Widney N.</p>
            <p className="text-xs text-[#13b5b1] font-semibold">
              Host · Account Created 🎉
            </p>
          </div>
        </div>
      </div>

      <nav aria-label="Host navigation" className="flex-1 py-4 px-3 space-y-1">
        {navigation.map(({ label, href, icon: Icon, active }) => (
          <Link
            key={label}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
              active
                ? "bg-[#13b5b1]/10 text-[#0d9b97] font-semibold"
                : label === "Log Out"
                  ? "text-red-500 hover:bg-red-50"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Icon
              size={18}
              className={`shrink-0 transition-colors ${
                active
                  ? "text-[#13b5b1]"
                  : label === "Log Out"
                    ? "text-red-400"
                    : "text-gray-400 group-hover:text-gray-600"
              }`}
            />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-6">
        <div className="bg-[#f4f5f7] rounded-2xl p-4">
          <p className="text-xs font-bold text-gray-700 mb-1">Need help?</p>
          <p className="text-xs text-gray-500 mb-3">
            Our host team is here Monday–Friday, 9 am–6 pm EST.
          </p>
          <Link
            href="/coming-soon"
            className="inline-flex text-xs font-semibold text-[#13b5b1] hover:text-[#0d9b97] transition-colors"
          >
            Visit Help Center →
          </Link>
        </div>
      </div>
    </aside>
  );
}

const mobileNavigation = [
  { label: "Home", href: "/host/dashboard" },
  { label: "My Trips", href: "/coming-soon" },
  { label: "Email List", href: "/coming-soon" },
  { label: "Itineraries", href: "/coming-soon" },
];

export function HostMobileNavigation() {
  return (
    <header className="lg:hidden bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 h-14">
        <Brand compact />
        <div className="flex items-center gap-2">
          <Link
            href="/coming-soon"
            className="text-xs font-bold border border-[#13b5b1] text-[#13b5b1] px-3 py-1.5 rounded-full hover:bg-[#13b5b1] hover:text-white transition-all"
          >
            Refer a Host
          </Link>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#13b5b1] to-[#0d9b97] flex items-center justify-center text-white text-xs font-bold">
            WN
          </div>
        </div>
      </div>
      <nav
        aria-label="Host mobile navigation"
        className="flex gap-0 border-t border-gray-100 overflow-x-auto"
      >
        {mobileNavigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="shrink-0 px-5 py-3 text-xs font-semibold text-gray-500 hover:text-[#13b5b1] border-b-2 border-transparent hover:border-[#13b5b1] transition-all whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
