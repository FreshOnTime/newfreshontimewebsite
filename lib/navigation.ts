export const MARKET_NAVIGATION = [
  { label:'Explore',href:'/discover' },
  { label:'Dining',href:'/eat-drink' },
  { label:'Food & brands',href:'/makers' },
  { label:'Journal',href:'/stories' },
] as const;
export function isMarketRouteActive(pathname:string,href:string){return (href==='/discover'&&(pathname==='/explore'||pathname.startsWith('/explore/')))||pathname===href||pathname.startsWith(href+'/')||(href==='/makers'&&(pathname==='/food-products'||pathname.startsWith('/food-products/')));}
