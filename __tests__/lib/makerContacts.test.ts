import { makerContactLinks, resolveMakerContacts, publicEmail, publicPhone } from '@/lib/makerContacts';
import { absoluteUrl } from '@/lib/config/site';

const business = {
  makerWhatsApp: '+94771234567',
  businessPublicEmail: 'hello@example.com',
  businessPublicPhone: '+94112345678',
  businessWebsite: 'https://example.com/',
  businessInstagram: 'https://www.instagram.com/example/',
  businessFacebook: 'https://www.facebook.com/example/',
  businessTikTok: 'https://www.tiktok.com/@example',
};

describe('public maker contact channels', () => {
  it('inherits public business details for existing and new offerings', () => {
    expect(resolveMakerContacts(business)).toMatchObject({
      whatsapp: business.makerWhatsApp, email: business.businessPublicEmail,
      phone: business.businessPublicPhone, website: business.businessWebsite,
      facebook: business.businessFacebook, tiktok: business.businessTikTok,
    });
  });
  it('overrides individual fields and retains other business contacts', () => {
    expect(resolveMakerContacts(business, {
      contactWhatsApp: '+94779876543', contactEmail: 'cake@example.com',
      contactPhone: null, contactWebsite: 'https://example.com/cake',
      purchaseUrl: 'https://example.com/buy',
    })).toMatchObject({ whatsapp: '+94779876543', email: 'cake@example.com',
      phone: business.businessPublicPhone, website: 'https://example.com/cake',
      purchase: 'https://example.com/buy' });
  });
  it('never uses private account email or telephone as a public fallback', () => {
    const privateBusiness = { makerWhatsApp: null, email: 'private@example.com', phone: '+94771234567' };
    const links = makerContactLinks(privateBusiness, 'Cake', '/makers/demo/items/cake');
    expect(links.emailHref).toBeUndefined();
    expect(links.phoneHref).toBeUndefined();
    expect(links.whatsappHref).toBeUndefined();
  });
  it('prefills product name and canonical listing URL in enquiries', () => {
    const path = '/makers/demo/items/cake';
    const links = makerContactLinks(business, 'Chocolate & vanilla cake', path);
    expect(links.whatsappHref).toContain('https://wa.me/94771234567?text=');
    expect(decodeURIComponent(links.whatsappHref!)).toContain(absoluteUrl(path));
    expect(decodeURIComponent(links.emailHref!)).toContain('Chocolate & vanilla cake');
    expect(decodeURIComponent(links.emailHref!)).toContain(absoluteUrl(path));
    expect(links.phoneHref).toBe('tel:+94112345678');
  });
  it('filters unsafe links, malformed phones and email header injection', () => {
    expect(publicEmail('hello@example.com\r\nBcc: attacker@example.com')).toBeUndefined();
    expect(publicPhone('javascript:alert(1)')).toBeUndefined();
    const links = resolveMakerContacts({ businessFacebook: 'https://facebook.com.evil.example/', businessWebsite:'javascript:alert(1)' }, {purchaseUrl:'http://example.com', contactWebsite:'https://user:password@example.com'});
    expect(links.facebook).toBeUndefined();
    expect(links.website).toBeUndefined();
    expect(links.purchase).toBeUndefined();
  });
});
