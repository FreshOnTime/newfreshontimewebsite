const normalizeUrl = (value: string) => value.trim().replace(/\/+$/, "");

export const SITE_URL = normalizeUrl(
  process.env.NEXT_PUBLIC_SITE_URL || "https://freshpick.lk"
);

export const SITE_NAME = "FreshPick";
export const SITE_NAME_LONG = "FreshPick Sri Lanka";

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "concierge@freshpick.lk";

export const PARTNERSHIP_EMAIL =
  process.env.NEXT_PUBLIC_PARTNERSHIP_EMAIL || SUPPORT_EMAIL;

export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
).replace(/\D/g, "");

export const SOCIAL_LINKS = {
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL || "",
  x: process.env.NEXT_PUBLIC_X_URL || "",
} as const;

export const SERVICE_AREAS = [
  "Colombo",
  "Rajagiriya",
  "Battaramulla",
  "Nawala",
  "Nugegoda",
  "Dehiwala",
  "Mount Lavinia",
  "Kollupitiya",
  "Bambalapitiya",
  "Cinnamon Gardens",
  "Havelock Town",
] as const;

export function absoluteUrl(path = "") {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return new URL(path).href;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
