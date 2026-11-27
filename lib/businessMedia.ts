import {makerImageSrc} from './makers';
/** Only approved static editorial assets, existing local upload paths or HTTPS media. */
export function businessMediaSource(value:unknown):string|undefined{
 if(typeof value!=='string'||value.length>2048)return undefined;
 if(/^\/images\/editorial\/[a-z0-9_-]+\.webp$/i.test(value))return value;
 return makerImageSrc(value);
}
export function readArticleCover(value:unknown):{url:string;alt:string}|undefined{
 if(!value||typeof value!=='object'||Array.isArray(value))return undefined;
 const cover=value as Record<string,unknown>;const url=businessMediaSource(cover.url);
 if(!url)return undefined;
 return {url,alt:typeof cover.alt==='string'?cover.alt.trim().slice(0,200):''};
}
