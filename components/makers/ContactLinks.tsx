import type { makerContactLinks } from '@/lib/makerContacts';

export default function ContactLinks({ links, showWhatsApp = true }: { links: ReturnType<typeof makerContactLinks>; showWhatsApp?: boolean }) {
  const external = [
    { label: 'WhatsApp', href: showWhatsApp ? links.whatsappHref : undefined },
    { label: 'Visit website', href: links.website },
    { label: 'Buy on business website', href: links.purchase },
    { label: 'Instagram', href: links.instagram },
    { label: 'Facebook', href: links.facebook },
    { label: 'TikTok', href: links.tiktok },
  ];
  const hasLinks = external.some(link => link.href) || links.emailHref || links.phoneHref;
  return hasLinks ? <div className="flex flex-wrap gap-2" aria-label="Public contact channels">
    {external.map(link => link.href && <a key={link.label} className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-semibold text-brand-green hover:underline" href={link.href} target="_blank" rel="noopener noreferrer ugc nofollow">{link.label}</a>)}
    {links.emailHref && <a className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-semibold text-brand-green hover:underline" href={links.emailHref}>Send email</a>}
    {links.phoneHref && <a className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-semibold text-brand-green hover:underline" href={links.phoneHref}>Call business</a>}
  </div> : null;
}
