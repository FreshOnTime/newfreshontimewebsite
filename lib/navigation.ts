export const MARKET_NAVIGATION = [
  { label:'Explore',href:'/discover' },
  { label:'Dining',href:'/eat-drink' },
  { label:'Food & brands',href:'/makers' },
  { label:'Journal',href:'/stories' },
] as const;
export const journalRoutes=['/stories','/blog','/guides','/food-atlas','/traditions','/experiences'] as const;
export function isJournalRoute(pathname:string){return journalRoutes.some(path=>pathname===path||pathname.startsWith(path+'/'));}
export function isMarketRouteActive(pathname:string,href:string){return (href==='/discover'&&(pathname==='/explore'||pathname.startsWith('/explore/')))||pathname===href||pathname.startsWith(href+'/')||(href==='/makers'&&(pathname==='/food-products'||pathname.startsWith('/food-products/')));}
