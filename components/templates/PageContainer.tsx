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
    <main className="min-h-screen bg-background text-foreground">
      <div
        className={cn(
          !disablePadding && "px-4 py-8 md:py-10",
          !fullWidth && "max-w-7xl mx-auto",
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}
