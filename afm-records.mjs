import {FORMAT,LABS,OFFERS,OBSTACLES,AGREEMENTS,AMENDMENTS,TONES,QUESTIONS,TASKS,find,offer,feature,question,economics,cashflow,posterTitle,ready,validProject} from './afm-core.mjs?v=20261010-all';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function restore(value){
 try{
  if(!validProject(value)||value.version!==1||!uuid.test(value.id)||typeof value.started!=='boolean'||!Array.isArray(value.interests)||value.interests.some(id=>!LABS.some(l=>l.id===id))||new Set(value.interests).size!==value.interests.length)return null;
  const c=value.choices;
  for(const [key,list] of [['offer',OFFERS],['obstacle',OBSTACLES],['agreement',AGREEMENTS],['amendment',AMENDMENTS],['tone',TONES],['question',QUESTIONS]])if(c[key]!=null&&!find(list,c[key]))return null;
  if(c.feature!=null&&!feature(value)||c.response!=null&&!find(question(value)?.responses||[],c.response)||c.payment!=null&&!['anticipo','dopo'].includes(c.payment)||c.headline!=null&&(typeof c.headline!=='string'||c.headline.length>72))return null;
  if(value.notes.some(n=>!n||!uuid.test(n.id)||typeof n.text!=='string'||typeof n.label!=='string'))return null;
  const p=JSON.parse(JSON.stringify(value));p.done=p.done.filter(s=>ready(p,s));return p;
 }catch{return null;}
}
export function remoteProject(value){const p=restore(value);if(!p)return null;p.notes=[];p.identity=null;return p;}
export function summaryItems(value){
 const p=restore(value);if(!p)throw new Error('Progetto AFM non valido.');
 const c=p.choices,o=offer(p),f=feature(p),e=economics(p),q=question(p);
 return [
 {title:LABS[0].label,text:`${o?.name||'Proposta da scegliere'}: ${f?.text||o?.title||'da completare'}.`},
 {title:LABS[1].label,text:c.order.map(id=>find(TASKS,id).name).join(' → ')+`. Imprevisto: ${find(OBSTACLES,c.obstacle)?.title||'da affrontare'}.`},
 {title:LABS[2].label,text:`Ipotesi: ${e.quantity} kit a ${e.price} euro. Ricavi ${e.revenue}, costi del modello ${e.cost}, differenza ${e.difference} euro. ${c.payment==='anticipo'?'Anticipo concordato':'Scadenza concordata'}; disponibilità di oggi: ${cashflow(p).todayBalance} euro.`},
 {title:LABS[3].label,text:`${find(AGREEMENTS,c.agreement)?.delivery||'Consegna da definire'} ${find(AMENDMENTS,c.amendment)?.clause||''}`},
 {title:LABS[4].label,text:`«${posterTitle(p)}». ${q?.en||''} ${find(q?.responses||[],c.response)?.en||''}`}
 ];
}
