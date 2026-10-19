// A participant capability is carried only between the site's own Bussola pages.
// Explicit personal links always win; existing projects keep their original owner.
const TOKEN=/^[A-Za-z0-9_-]{43}$/;
const local=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).get('prova');
const KEY='bussola-partecipante'+(local?':prova:'+local:'');
export function sharedParticipant(){
 const explicit=new URLSearchParams(location.hash.slice(1)).get('alunno');if(TOKEN.test(explicit||''))return explicit;
 try{const p=JSON.parse(localStorage.getItem(KEY));const requested=new URLSearchParams(location.hash.slice(1)).get('classe');if(requested&&p?.classe&&requested!==p.classe)return '';return TOKEN.test(p?.token||'')?p.token:'';}catch{return '';}
}
export function rememberParticipant(token,classe=''){
 if(!TOKEN.test(token||''))return;
 try{const old=JSON.parse(localStorage.getItem(KEY)||'null');localStorage.setItem(KEY,JSON.stringify({token,classe:classe||(old?.token===token?old.classe:'')||''}));}catch{}
 for(const a of document.querySelectorAll('nav a[href*="missioni.html"]'))a.href=personalDestination(a.href,token);
}
export function personalDestination(href,token=sharedParticipant()){
 const url=new URL(href,location.href);if(url.origin!==location.origin||!/(?:bussola(?:-(?:ssas|afm|sia|turismo|cat))?|missioni)\.html$/.test(url.pathname)||!TOKEN.test(token||''))return url.href;
 const params=new URLSearchParams(url.hash.includes('=')?url.hash.slice(1):'');
 if(!params.has('alunno'))params.set('alunno',token);
 url.hash=params.toString();return url.href;
}
document.addEventListener('bussola-progetto-nuovo',()=>{try{localStorage.removeItem(KEY);}catch{}});
