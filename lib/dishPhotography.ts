// Original photographs, with linked credits and CC BY-SA 3.0 license. Displayed with CSS cropping; no false venue attribution.
export const dishPhotography:Record<string,{url:string;alt:string;credit:string;source:string}>={
 kottu:{url:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Kottu_Roti.jpg/960px-Kottu_Roti.jpg',alt:'Sri Lankan chopped roti kottu',credit:'Chamal N',source:'https://commons.wikimedia.org/wiki/File:Kottu_Roti.jpg'},
 hoppers:{url:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Sri_Lanka-Egg_hoppers.jpg/960px-Sri_Lanka-Egg_hoppers.jpg',alt:'Sri Lankan egg hopper',credit:'Ji-Elle',source:'https://commons.wikimedia.org/wiki/File:Sri_Lanka-Egg_hoppers.jpg'},
 'string-hoppers':{url:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Sri_Lanka-String_hoppers.jpg/960px-Sri_Lanka-String_hoppers.jpg',alt:'Sri Lankan steamed string hoppers',credit:'Ji-Elle',source:'https://commons.wikimedia.org/wiki/File:Sri_Lanka-String_hoppers.jpg'}
};
export const dishPhotoLicense='https://creativecommons.org/licenses/by-sa/3.0/';
export const dishShortName=(name:string)=>name.replace(/\s*\([^()]*\)\s*$/,'').trim();
