export function needsLegacy(payload){
 return payload?.caseJourney?.format!=='ssas-sei-situazioni-2'&&payload?.labJourney?.format==='ssas-cinque-laboratori-1'&&(payload.labJourney.visited>0||payload.labJourney.step>0);
}
