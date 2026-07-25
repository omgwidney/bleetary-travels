import Link from "next/link";
import Brand from "@/components/Brand";

const footerColumns = [
  {
    heading: "Travel",
    links: [
      { label: "Find a Trip", href: "/trips" },
      { label: "Destinations", href: "/trips" },
      { label: "Reviews", href: "/coming-soon" },
      { label: "Blog", href: "/coming-soon" },
    ],
  },
  {
    heading: "Host",
    links: [
      { label: "Become a Host", href: "/become-a-host" },
      { label: "Host Dashboard", href: "/host/dashboard" },
      { label: "Refer a Host", href: "/coming-soon" },
      { label: "Resources", href: "/coming-soon" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/coming-soon" },
      { label: "Careers", href: "/coming-soon" },
      { label: "Press", href: "/coming-soon" },
      { label: "Help Center", href: "/coming-soon" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-10">
          <div className="sm:col-span-1">
            <Brand compact inverse />
            <p className="text-sm text-gray-500 leading-relaxed mt-3">
              Group travel for every community. Find your adventure.
            </p>
          </div>
          {footerColumns.map((column) => (
            <div key={column.heading}>
              <h2 className="text-white font-bold text-sm mb-3">
                {column.heading}
              </h2>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-[#13b5b1] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Bleetary Travels. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-600">
            {["Privacy", "Terms", "Cookies"].map((label) => (
              <Link
                key={label}
                href="/coming-soon"
                className="hover:text-gray-400 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
