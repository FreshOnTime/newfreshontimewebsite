import { ReactNode } from "react";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function AnimatedSection({
  children,
  className = "",
  delay: _delay = 0,
}: AnimatedSectionProps) {
  return (
    <div className={className}>
      {children}
    </div>
    );
}

interface AnimatedProductGridProps {
    children: ReactNode;
    className?: string;
}

export function AnimatedProductGrid({
  children,
  className = "",
}: AnimatedProductGridProps) {
  return (
    <div className={className}>
      {children}
    </div>
    );
}

interface AnimatedProductItemProps {
    children: ReactNode;
    index: number;
}

export function AnimatedProductItem({
  children,
  index: _index,
}: AnimatedProductItemProps) {
  return (
    <div>
      {children}
    </div>
  );
}
