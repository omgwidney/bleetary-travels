"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { User as UserIcon, LayoutDashboard, Sparkles } from "lucide-react";

export default function NavAuthSection() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-16 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-9 w-28 bg-gray-100 rounded-full animate-pulse" />
      </div>
    );
  }

  if (user) {
    const initials = (user.displayName || user.email || "U")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="flex items-center gap-3">
        {role === "host" && (
          <Link
            href="/host/dashboard"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors"
          >
            <LayoutDashboard size={13} />
            Host Hub
          </Link>
        )}

        {role === "admin" && (
          <Link
            href="/admin"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <Sparkles size={13} />
            Admin
          </Link>
        )}

        <Link
          href="/account"
          id="nav-account-link"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:border-[#13b5b1] hover:bg-gray-50 transition-all shadow-sm group"
          title={user.email || "Account"}
        >
          <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {initials || <UserIcon size={14} />}
          </div>
          <span className="hidden sm:inline-block text-xs font-bold text-gray-800 group-hover:text-[#13b5b1]">
            {user.displayName || "Account"}
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        id="nav-login-link"
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
  );
}
