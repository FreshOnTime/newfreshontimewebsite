import { officialHttps } from './businessTypes';
import { absoluteUrl } from './config/site';
import { makerWhatsAppLink } from './makers';

type BusinessContacts = {
  makerWhatsApp?: string | null;
  businessPublicEmail?: string | null;
  businessPublicPhone?: string | null;
  businessWebsite?: string | null;
  businessInstagram?: string | null;
  businessFacebook?: string | null;
  businessTikTok?: string | null;
};
type ItemContacts = {
  contactWhatsApp?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactWebsite?: string | null;
  purchaseUrl?: string | null;
};
export function publicEmail(value?: string | null) {
  const email = value?.trim();
  return email && /^[A-Za-z0-9.!#$%&'*+/=^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email) && !/[\r\n]/.test(email) ? email : undefined;
}
export function publicPhone(value?: string | null) {
  return value && /^\+[1-9]\d{7,14}$/.test(value) ? value : undefined;
}
export function resolveMakerContacts(business: BusinessContacts, item: ItemContacts = {}) {
  return {
    whatsapp: publicPhone(item.contactWhatsApp) || publicPhone(business.makerWhatsApp),
    email: publicEmail(item.contactEmail) || publicEmail(business.businessPublicEmail),
    phone: publicPhone(item.contactPhone) || publicPhone(business.businessPublicPhone),
    website: officialHttps(item.contactWebsite) || officialHttps(business.businessWebsite),
    instagram: officialHttps(business.businessInstagram,'instagram.com'),
    facebook: officialHttps(business.businessFacebook,'facebook.com'),
    tiktok: officialHttps(business.businessTikTok,'tiktok.com'),
    purchase: officialHttps(item.purchaseUrl),
  };
}
export function makerContactLinks(business: BusinessContacts, title: string, path: string, item: ItemContacts = {}) {
  const contact = resolveMakerContacts(business, item);
  const body = `Hi! I found ${title} on FreshPick and would like to enquire.\nListing: ${absoluteUrl(path)}`;
  return {
    ...contact,
    whatsappHref: makerWhatsAppLink(contact.whatsapp ?? null, title, undefined, path),
    emailHref: contact.email ? `mailto:${encodeURIComponent(contact.email).replace('%40','@')}?subject=${encodeURIComponent('FreshPick enquiry: '+title)}&body=${encodeURIComponent(body)}` : undefined,
    phoneHref: contact.phone ? 'tel:'+contact.phone : undefined,
  };
}
