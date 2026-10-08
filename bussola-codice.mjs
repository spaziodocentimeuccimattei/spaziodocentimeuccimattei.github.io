const LEGACY=/^[A-Za-z0-9_-]{43}$/;
const SHORT=/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/;
export function classCode(value){
 if(typeof value!=='string')return '';
 let raw=value.trim();
 try{if(/^https?:\/\//i.test(raw))raw=new URLSearchParams(new URL(raw).hash.slice(1)).get('classe')||'';}catch{return '';}
 if(LEGACY.test(raw))return raw;
 raw=raw.replace(/[\s-]/g,'').toUpperCase();
 return SHORT.test(raw)?raw:'';
}
export function isShortCode(value){return SHORT.test(value);}
