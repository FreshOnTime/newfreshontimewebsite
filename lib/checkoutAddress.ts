type RegistrationAddress = {
  recipientName?: string | null;
  phoneNumber?: string | null;
  streetAddress?: string | null;
  streetAddress2?: string | null;
  city?: string | null;
  town?: string | null;
  state?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
};

/** Saved account addresses and order addresses use different field names. */
export function registrationAddressToOrderAddress(
  address: RegistrationAddress | null | undefined,
  fallback: { name?: string | null; phone?: string | null } = {},
) {
  if (!address) return undefined;
  return {
    name: address.recipientName || fallback.name || 'Customer',
    phone: address.phoneNumber || fallback.phone || '',
    street: [address.streetAddress, address.streetAddress2].filter(Boolean).join(', '),
    city: address.city || address.town || '',
    state: address.state || '',
    zipCode: address.postalCode || '',
    country: address.countryCode || 'LK',
  };
}

export function isCompleteOrderAddress(address: { name: string; phone: string; street: string; city: string; country: string } | undefined): boolean {
  return Boolean(address && [address.name, address.phone, address.street, address.city, address.country].every((value) => value.trim().length > 0));
}
