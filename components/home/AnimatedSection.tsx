import type { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/** Progressive scroll-reveal; content remains visible when unsupported or JS is disabled. */
export function AnimatedSection({ children, className = "", delay = 0 }: AnimatedSectionProps) {
  return <div className={"scroll-reveal " + className} style={{ animationDelay: delay + "ms" }}>{children}</div>;
}

export function AnimatedProductGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function AnimatedProductItem({ children, index }: { children: ReactNode; index: number }) {
  return <div className="scroll-reveal" style={{ animationDelay: Math.min(index, 8) * 60 + "ms" }}>{children}</div>;
}
