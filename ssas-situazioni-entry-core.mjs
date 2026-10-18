// Read the current saved state first. Keep the previous key untouched, including
// pending changes and notes, while presenting it through the current interface.
export function readEntryState(storage,key){
 const previousKey=key.replace('bussola-ssas-sei-situazioni-v2','bussola-ssas-cinque-laboratori-v1');
 for(const candidate of [key,previousKey]){
  try{
   const raw=JSON.parse(storage.getItem(candidate));
   if(!raw||typeof raw!=='object'||Array.isArray(raw)||!raw.project||typeof raw.project!=='object'||Array.isArray(raw.project))continue;
   if(candidate!==key){
    try{const classKey=key+':classe',previousClass=storage.getItem(previousKey+':classe');if(!storage.getItem(classKey)&&previousClass)storage.setItem(classKey,previousClass);}catch{}
   }
   return raw;
  }catch{}
 }
 return null;
}
