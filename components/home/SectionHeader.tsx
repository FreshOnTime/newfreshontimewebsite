"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  ctaHref?: string;
  ctaLabel?: string;
  accent?: "green" | "orange" | "purple" | "red" | "blue";
  className?: string;
}

const accentMap: Record<NonNullable<SectionHeaderProps["accent"]>, string> = {
  green: "text-green-600 border-green-500 hover:bg-green-500 hover:text-white",
  orange: "text-orange-600 border-orange-500 hover:bg-orange-500 hover:text-white",
  purple: "text-purple-600 border-purple-500 hover:bg-purple-500 hover:text-white",
  red: "text-red-600 border-red-500 hover:bg-red-500 hover:text-white",
  blue: "text-blue-600 border-blue-500 hover:bg-blue-500 hover:text-white",
};

export default function SectionHeader({
  title,
  subtitle,
  ctaHref,
  ctaLabel = "View all",
  accent = "green",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={`flex items-center justify-between mb-10 ${className ?? ""}`}
    >
      <div>
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-gray-600 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {ctaHref && (
        <Button
          asChild
          variant="outline"
          className={`hidden md:flex border-2 ${accentMap[accent]}`}
        >
          <Link href={ctaHref}>
            {ctaLabel}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
