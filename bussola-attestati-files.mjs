import {safeName,csvCell} from './bussola-records-core.mjs?v=20261010-all';
const encoder=new TextEncoder();
const join=chunks=>{const bytes=new Uint8Array(chunks.reduce((n,b)=>n+b.length,0));let offset=0;for(const b of chunks){bytes.set(b,offset);offset+=b.length;}return bytes;};
// One image per A4 page; names are rendered with the browser's Unicode fonts.
export function pagesPDF(images){
 if(!images.length)throw new Error('Nessun attestato da esportare.');
 const chunks=[],offsets=[0];let position=0;const append=b=>{b=typeof b==='string'?encoder.encode(b):b;chunks.push(b);position+=b.length;};
 const object=(i,content)=>{offsets[i]=position;append(`${i} 0 obj\n`);if(Array.isArray(content))content.forEach(append);else append(content);append('\nendobj\n');};
 append('%PDF-1.4\n%');append(new Uint8Array([226,227,207,211]));append('\n');
 object(1,'<< /Type /Catalog /Pages 2 0 R >>');
 object(2,`<< /Type /Pages /Count ${images.length} /Kids [${images.map((_,i)=>`${3+i*3} 0 R`).join(' ')}] >>`);
 images.forEach((img,i)=>{const page=3+i*3,stream=page+1,image=page+2;const command=encoder.encode('q 595.28 0 0 841.89 0 0 cm /Im0 Do Q');
  object(page,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 ${image} 0 R >> >> /Contents ${stream} 0 R >>`);
  object(stream,[`<< /Length ${command.length} >>\nstream\n`,command,'\nendstream']);
  object(image,[`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`,img.bytes,'\nendstream']);
 });
 const start=position;append(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);for(const o of offsets.slice(1))append(`${String(o).padStart(10,'0')} 00000 n \n`);
 append(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF\n`);return join(chunks);
}
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function crc32(bytes){let crc=0xffffffff;for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
export function zipFiles(files){
 const chunks=[],central=[];let offset=0;const seen=new Set();
 for(const file of files){if(seen.has(file.name)||file.name.includes('..')||file.name.startsWith('/'))throw new Error('Nome file non valido o duplicato.');seen.add(file.name);const name=encoder.encode(file.name),bytes=file.bytes,crc=crc32(bytes);
  const local=new Uint8Array(30),v=new DataView(local.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);
  const record=new Uint8Array(46),r=new DataView(record.buffer);r.setUint32(0,0x02014b50,true);r.setUint16(4,20,true);r.setUint16(6,20,true);r.setUint16(8,0x800,true);r.setUint32(16,crc,true);r.setUint32(20,bytes.length,true);r.setUint32(24,bytes.length,true);r.setUint16(28,name.length,true);r.setUint32(42,offset,true);
  chunks.push(local,name,bytes);central.push(record,name);offset+=local.length+name.length+bytes.length;
 }
 const directory=join(central),end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,files.length,true);v.setUint16(10,files.length,true);v.setUint32(12,directory.length,true);v.setUint32(16,offset,true);return join([...chunks,directory,end]);
}
export function certificatePath(record){const s=record.snapshot;return `${safeName(s.scuola+' '+s.comune)}/${safeName(s.classe+' '+s.anno)}/attestato-${safeName(s.cognome+' '+s.nome)}-${s.alunno_id.slice(0,8)}-${record.id}.pdf`;}
export function certificateCSV(records){const rows=[['Scuola','Comune','Classe','Anno scolastico','Cognome','Nome','Percorso','Data','ID alunno','ID attestato','File'],...records.map(r=>{const s=r.snapshot;return [s.scuola,s.comune,s.classe,s.anno,s.cognome,s.nome,s.corso==='cat'?'CAT Archeodesign':s.corso==='turismo'?'Turismo':'SSAS',r.created_at.slice(0,10),s.alunno_id,r.id,certificatePath(r)];})];return '\ufeff'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n');}
