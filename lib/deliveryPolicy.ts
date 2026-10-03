import { SERVICE_AREAS } from '@/lib/config/site';

export class DeliveryPolicyError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
const number = (value: string | undefined, label: string, optional = false) => {
  if (optional && !value?.trim()) return null;
  const result = value?.trim() ? Number(value) : NaN;
  if (!Number.isFinite(result) || result < 0 || result > 9_999_999_999.99 || Math.abs(result * 100 - Math.round(result * 100)) > 0.0001) throw new DeliveryPolicyError(`${label} is not configured. Please contact FreshPick.`, 503);
  return result;
};
export function deliveryPolicy() {
  const fee = number(process.env.DELIVERY_FEE_LKR, 'Delivery pricing')!;
  const freeAbove = number(process.env.DELIVERY_FREE_ABOVE_LKR, 'Free-delivery threshold', true);
  const minimum = number(process.env.DELIVERY_MINIMUM_LKR || '0', 'Minimum order')!;
  const areas = (process.env.DELIVERY_AREAS || SERVICE_AREAS.join(',')).split(',').map(area => area.trim()).filter(Boolean);
  if (!areas.length) throw new DeliveryPolicyError('Delivery areas are not configured. Please contact FreshPick.', 503);
  return { fee, freeAbove, minimum, areas };
}
export function deliveryCharge(subtotal: number) {
  const { fee, freeAbove, minimum } = deliveryPolicy();
  if (subtotal < minimum) throw new DeliveryPolicyError(`The minimum order value is Rs. ${minimum.toFixed(2)}.`);
  return freeAbove !== null && subtotal > freeAbove ? 0 : fee;
}
const normalizedCity = (city: string) => city.trim().toLowerCase().replace(/^colombo\s*0?([1-9]|1[0-5])$/, 'colombo');
export function assertDeliveryArea(address: { city: string; country: string }) {
  const country = address.country.trim().toLowerCase();
  if (!['lk','lka','sri lanka'].includes(country)) throw new DeliveryPolicyError('FreshPick currently delivers within Sri Lanka.');
  if (!deliveryPolicy().areas.some(area => normalizedCity(area) === normalizedCity(address.city))) throw new DeliveryPolicyError('This city is outside our supported delivery areas. Contact FreshPick to confirm delivery.');
}
