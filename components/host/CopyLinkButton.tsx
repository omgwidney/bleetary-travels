"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyLinkButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export default function CopyLinkButton({
  value,
  label = "Copy",
  className = "",
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      aria-label={`${label} link`}
      className={className}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied" : label}
    </button>
  );
}
