import { cn } from "@/lib/utils";

interface PageTemplateProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  disablePadding?: boolean;
}

export function PageContainer({
  children,
  className,
  fullWidth = false,
  disablePadding = false,
}: PageTemplateProps) {
  return (
    <main className="min-h-screen bg-[#ffffff] text-[#09090b]">
      <div
        className={cn(
          !disablePadding && "px-4 py-16 md:py-24",
          !fullWidth && " max-w-7xl mx-auto",
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}
