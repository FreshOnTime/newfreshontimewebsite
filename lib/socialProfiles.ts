const domains = {instagram:['instagram.com'],facebook:['facebook.com'],x:['x.com','twitter.com'],linkedin:['linkedin.com'],bluesky:['bsky.app']} as const;
export type SocialPlatform=keyof typeof domains;
export const SOCIAL_LABELS:Record<SocialPlatform,string>={instagram:'Instagram',facebook:'Facebook',x:'X (Twitter)',linkedin:'LinkedIn',bluesky:'Bluesky'};
/** Only official-platform HTTPS profile links; account ownership must be confirmed by the operator. */
export function socialProfileUrl(platform:SocialPlatform,value:string|undefined):string {
 if(!value?.trim())return '';
 try{
  const u=new URL(value.trim());
  if(u.protocol!=='https:'||u.username||u.password||u.port||u.pathname==='/'||!domains[platform].some(host=>u.hostname===host||u.hostname.endsWith('.'+host)))return '';
  if(platform==='bluesky'&&!/^\/profile\/[^/]+\/?$/.test(u.pathname))return '';
  return u.href;
 }catch{return '';}
}
