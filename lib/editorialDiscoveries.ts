// Editorial references to public business websites, not supplier accounts or reviewed directory records.
// Facts checked against the linked official pages on 2026-11-27. No copied imagery, ratings or availability.
export const editorialDiscoveries = [
 {id:'dept-coffee',group:'dining',name:'Department of Coffee',area:'Colombo',category:'Specialty coffee',description:'Explore its specialty coffee offering and find a café location.',url:'https://deptofcoffee.lk/locations/'},
 {id:'cafe-kumbuk',group:'dining',name:'Café Kumbuk',area:'Colombo 7',category:'Café dining',description:'A café with a seasonal menu and Sri Lankan-grown coffee.',url:'https://www.cafekumbuk.com/menu'},
 {id:'ministry-crab',group:'dining',name:'Ministry of Crab',area:'Colombo Fort',category:'Seafood',description:'A crab-focused restaurant in the Old Dutch Hospital complex.',url:'https://www.ministryofcrab.com/colombo/'},
 {id:'la-chocolata',group:'gifting',name:'La Chocolata',area:'Colombo',category:'Artisan chocolate',description:'Small-batch chocolates and personalised gifts for individuals and businesses.',url:'https://lachocolatasl.com/'},
 {id:'cocolate',group:'gifting',name:'Cocolate',area:'Gampaha',category:'Chocolate gifts',description:'Gift boxes, wedding chocolates and corporate gift enquiries.',url:'https://www.cocolate.lk/contact-us'},
 {id:'spice-haven',group:'gifting',name:'Ceylon Spice Haven Artisans',area:'Sri Lanka',category:'Corporate gifting',description:'Artisan spice gift boxes and corporate gift enquiries.',url:'https://ceylonspicehaven.lk/corporate-gifting'},
 {id:'wishful-wrap',group:'gifting',name:'Wishful Wrap',area:'Sri Lanka',category:'Curated hampers',description:'Custom gifts and corporate hampers that can include food and artisan treats.',url:'https://www.wishfulwrap.lk/'},
] as const;
export type EditorialGroup='dining'|'gifting';
export function editorialMatches(group:EditorialGroup,q='',area=''){
 const norm=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 return editorialDiscoveries.filter(p=>p.group===group&&(!q||norm([p.name,p.category,p.description].join(' ')).includes(norm(q)))&&(!area||norm(p.area).includes(norm(area))));
}
