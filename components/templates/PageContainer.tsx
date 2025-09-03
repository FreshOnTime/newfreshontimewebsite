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
    <main className="min-h-screen">
      <div
        className={cn(
          !disablePadding && "px-4 py-8",
          !fullWidth && " max-w-screen-xl mx-auto",
          className
        )}
      >
        {children}
      </div>
    </main>
  );
}
