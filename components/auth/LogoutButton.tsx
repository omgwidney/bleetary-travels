"use client";

import { useState } from "react";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";

export default function LogoutButton({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await signOut(auth).catch(() => undefined);
    } finally {
      window.location.assign("/login");
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={pending}
      className={className}
    >
      {!compact && <LogOut size={18} aria-hidden="true" />}
      {pending ? "Signing out…" : "Log out"}
    </button>
  );
}
