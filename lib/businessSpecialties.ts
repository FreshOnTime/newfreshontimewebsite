export const businessSpecialties = [
  'cakes-desserts','bread-pastries','chocolate-confectionery','tea-coffee','drinks',
  'pantry-specialities','fresh-produce','prepared-meals','event-catering',
  'food-hampers','corporate-gifts','wedding-favours','custom-food-gifts',
] as const;
export type BusinessSpecialty = typeof businessSpecialties[number];
export const specialtyLabels: Record<BusinessSpecialty,string> = {
  'cakes-desserts':'Cakes & desserts','bread-pastries':'Bread & pastries','chocolate-confectionery':'Chocolate & confectionery',
  'tea-coffee':'Tea & coffee','drinks':'Drinks','pantry-specialities':'Pantry & speciality foods',
  'fresh-produce':'Fresh produce','prepared-meals':'Prepared meals','event-catering':'Event catering',
  'food-hampers':'Food hampers','corporate-gifts':'Corporate gifts','wedding-favours':'Wedding favours','custom-food-gifts':'Custom food gifts',
};
export const giftSpecialties: BusinessSpecialty[] = ['food-hampers','corporate-gifts','wedding-favours','custom-food-gifts'];
export function specialtyLabel(value:string){return specialtyLabels[value as BusinessSpecialty]||value;}
export function matchSpecialties(query:string){const q=query.trim().toLowerCase();return q?businessSpecialties.filter(s=>s.includes(q)||specialtyLabels[s].toLowerCase().includes(q)):[];}

export const businessArticleTopics = ['Behind the business','Recipes & serving ideas','Products & menus','Seasonal collections','Food gifting','Events & announcements'] as const;
