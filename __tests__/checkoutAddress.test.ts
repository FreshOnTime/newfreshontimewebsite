import { isCompleteOrderAddress, registrationAddressToOrderAddress } from '@/lib/checkoutAddress';
import { orderAddressSchema } from '@/lib/orderAddress';

const saved = { recipientName: 'Market Customer', phoneNumber: '0771234567', streetAddress: '12 Market Road', streetAddress2: 'Floor 2', city: 'Colombo', state: 'Western', postalCode: '00100', countryCode: 'LK' };

it('converts a saved account address to the subscription/checkout API contract', () => {
  const address = registrationAddressToOrderAddress(saved);
  expect(orderAddressSchema.parse(address)).toEqual({ name: 'Market Customer', phone: '0771234567', street: '12 Market Road, Floor 2', city: 'Colombo', state: 'Western', zipCode: '00100', country: 'LK' });
});
it('uses town and account contact details when optional address fields are absent', () => {
  expect(registrationAddressToOrderAddress({ streetAddress: 'Market Road', town: 'Colombo' }, { name: 'Customer', phone: '0771234567' })).toMatchObject({ name: 'Customer', phone: '0771234567', city: 'Colombo', country: 'LK' });
});
it('does not block a complete address without an optional postcode', () => {
  const address = registrationAddressToOrderAddress({ ...saved, postalCode: '' });
  expect(orderAddressSchema.safeParse(address).success).toBe(true);
  expect(isCompleteOrderAddress(address)).toBe(true);
});
it.each([undefined, { ...saved, streetAddress: '  ', streetAddress2: '' }, { ...saved, phoneNumber: '' }])('blocks incomplete saved addresses before submission', (savedAddress) => {
  expect(isCompleteOrderAddress(registrationAddressToOrderAddress(savedAddress))).toBe(false);
});
