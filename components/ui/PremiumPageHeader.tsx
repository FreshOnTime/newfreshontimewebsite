import Image from "next/image";

interface PremiumPageHeaderProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string | null;
  backgroundColor?: string;
  count?: number;
  isLoading?: boolean;
  eyebrow?: string;
  imageLayout?: "feature" | "compact";
}

export default function PremiumPageHeader({
  title, subtitle, backgroundImage, count, isLoading, eyebrow, imageLayout = "feature",
}: PremiumPageHeaderProps) {
  return (
    <header className="page-intro">
      <div className={`page-intro-inner ${backgroundImage ? 'with-photo' : ''} ${imageLayout}`}>
        {isLoading ? <p role="status">Loading…</p> : <>
          <div>
            {eyebrow && eyebrow !== title && <p className="intro-context">{eyebrow}</p>}
            <h1 className="section-masthead">{title}</h1>
            {subtitle && <p className="intro-description">{subtitle}</p>}
            {count !== undefined && <p className="intro-count" aria-live="polite">{count} {count === 1 ? 'item' : 'items'}</p>}
          </div>
          {backgroundImage && <div className="intro-photo"><Image alt="" fill sizes="(max-width: 700px) 100vw, 40vw" src={backgroundImage} className="object-cover" /></div>}
        </>}
      </div>
    </header>
  );
}
