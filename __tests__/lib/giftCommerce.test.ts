import { businessTypes, selectableBusinessTypes, businessTypeDetails, businessTypeLabels } from '@/lib/businessTypes';
import { giftSpecialties } from '@/lib/businessSpecialties';
import { makerKinds, makerWhatsAppLink } from '@/lib/makers';
import { absoluteUrl } from '@/lib/config/site';

it('keeps legacy classifications readable without offering gift creator to new businesses',()=>{
  expect(businessTypes).toContain('gift_creator');
  expect(selectableBusinessTypes).not.toContain('gift_creator');
  expect(selectableBusinessTypes).toContain('restaurant');
  expect(makerKinds).toContain('Food gifts');
  expect(giftSpecialties).toContain('food-hampers');
});

it('addresses the official seller number and carries the exact item listing',()=>{
  const path='/makers/example/items/coffee-box';
  const link=makerWhatsAppLink('+94771234567','Coffee box from Example',undefined,path);
  const url=new URL(link!);
  expect(url.origin).toBe('https://wa.me');
  expect(url.pathname).toBe('/94771234567');
  expect(url.searchParams.get('text')).toContain('Coffee box from Example');
  expect(url.searchParams.get('text')).toContain(absoluteUrl(path));
  expect(makerWhatsAppLink('invalid','Coffee box',undefined,path)).toBeUndefined();
});

it('provides a label and explanatory examples for every selectable business type',()=>{
 expect(selectableBusinessTypes).toHaveLength(10);
 expect(selectableBusinessTypes).toEqual(expect.arrayContaining(['grocery','farm','mobile_food']));
 for(const type of selectableBusinessTypes){expect(businessTypeLabels[type]).toBeTruthy();expect(businessTypeDetails[type].description).toBeTruthy();expect(businessTypeDetails[type].examples).toBeTruthy();}
});
