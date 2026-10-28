// File Excel (.xlsx) generati nel browser, senza librerie esterne: fogli con intestazione
// colorata, righe colorate per stato, filtri automatici e prima riga bloccata.
import {zipFiles} from './bussola-attestati-files.mjs?v=20261028-edificio';

const encoder = new TextEncoder();
// Colori delle righe: gli stessi della Gestione.
export const TONES = {none: null, green: 'FFE3F4E9', amber: 'FFFFF1D6', grey: 'FFEDF1F3', pink: 'FFFBE3EC', blue: 'FFE1EEF7', violet: 'FFEEE5F7'};
const toneKeys = Object.keys(TONES);

function xml(value) {
  return String(value ?? '').replace(/[^\x09\x0A\x0D\x20-퟿-�]/g, '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function column(index) {
  let name = '';
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) name = String.fromCharCode(65 + (n - 1) % 26) + name;
  return name;
}

// Numero di serie Excel di una data AAAA-MM-GG, senza effetti del fuso orario.
export function excelDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  if (!match) return null;
  return (Date.UTC(+match[1], +match[2] - 1, +match[3]) - Date.UTC(1899, 11, 30)) / 86400000;
}

export function sheetName(name, used = new Set()) {
  const base = String(name).replace(/[\[\]:*?/\\]/g, ' ').trim().slice(0, 31) || 'Foglio';
  let result = base;
  for (let i = 2; used.has(result.toLowerCase()); i++) result = `${base.slice(0, 28)} ${i}`;
  used.add(result.toLowerCase());
  return result;
}

// Stili: 0 normale, 1 titolo, 2 intestazione, poi per ogni colore un testo e una data.
const style = (tone, isDate) => 3 + toneKeys.indexOf(tone in TONES ? tone : 'none') * 2 + (isDate ? 1 : 0);

function stylesXml() {
  const fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>',
    '<fill><patternFill patternType="solid"><fgColor rgb="FF123C57"/><bgColor indexed="64"/></patternFill></fill>',
    ...toneKeys.slice(1).map(key => `<fill><patternFill patternType="solid"><fgColor rgb="${TONES[key]}"/><bgColor indexed="64"/></patternFill></fill>`)];
  const fillOf = key => key === 'none' ? 0 : 2 + toneKeys.indexOf(key);
  const cells = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>',
    '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>',
    '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>'];
  for (const key of toneKeys) for (const isDate of [false, true]) {
    cells.push(`<xf numFmtId="${isDate ? 164 : 0}" fontId="0" fillId="${fillOf(key)}" borderId="1" xfId="0" applyNumberFormat="${isDate ? 1 : 0}" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>`);
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<numFmts count="1"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/></numFmts>
<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="14"/><color rgb="FF123C57"/><name val="Calibri"/></font></fonts>
<fills count="${fills.length}">${fills.join('')}</fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFC6D5DB"/></left><right style="thin"><color rgb="FFC6D5DB"/></right><top style="thin"><color rgb="FFC6D5DB"/></top><bottom style="thin"><color rgb="FFC6D5DB"/></bottom><diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="${cells.length}">${cells.join('')}</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;
}

function cellXml(ref, value, type, tone) {
  if (type === 'date') {
    const serial = excelDate(value);
    if (serial !== null) return `<c r="${ref}" s="${style(tone, true)}"><v>${serial}</v></c>`;
  }
  if (type === 'number' && value !== '' && value !== null && Number.isFinite(Number(value))) return `<c r="${ref}" s="${style(tone, false)}"><v>${Number(value)}</v></c>`;
  return `<c r="${ref}" s="${style(tone, false)}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`;
}

function sheetXml(sheet) {
  const columns = sheet.columns;
  const last = column(columns.length - 1);
  const top = sheet.title ? 3 : 1; // riga dell'intestazione
  const rows = [];
  if (sheet.title) rows.push(`<row r="1" ht="22" customHeight="1"><c r="A1" s="1" t="inlineStr"><is><t xml:space="preserve">${xml(sheet.title)}</t></is></c></row>`);
  rows.push(`<row r="${top}" ht="30" customHeight="1">${columns.map((col, i) => `<c r="${column(i)}${top}" s="2" t="inlineStr"><is><t xml:space="preserve">${xml(col.header)}</t></is></c>`).join('')}</row>`);
  sheet.rows.forEach((row, index) => {
    const r = top + 1 + index;
    rows.push(`<row r="${r}">${columns.map((col, i) => cellXml(`${column(i)}${r}`, row.cells[i], col.type, row.tone || 'none')).join('')}</row>`);
  });
  const end = top + Math.max(sheet.rows.length, 1);
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheetViews><sheetView workbookViewId="0"><pane ySplit="${top}" topLeftCell="A${top + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
<cols>${columns.map((col, i) => `<col min="${i + 1}" max="${i + 1}" width="${col.width || 16}" customWidth="1"/>`).join('')}</cols>
<sheetData>${rows.join('')}</sheetData>
<autoFilter ref="A${top}:${last}${end}"/>
<pageSetup orientation="landscape" fitToHeight="0"/>
</worksheet>`;
}

// sheets: [{name, title?, columns:[{header,width?,type?:'text'|'date'|'number'}], rows:[{cells:[], tone?}]}]
export function workbook(sheets) {
  const used = new Set();
  const names = sheets.map(sheet => sheetName(sheet.name, used));
  const files = [
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${names.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((name, i) => `<sheet name="${xml(name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><definedNames>${sheets.map((sheet, i) => { const top = sheet.title ? 3 : 1; return `<definedName name="_xlnm._FilterDatabase" localSheetId="${i}" hidden="1">'${xml(names[i]).replaceAll("'", "''")}'!$A$${top}:$${column(sheet.columns.length - 1)}$${top + Math.max(sheet.rows.length, 1)}</definedName>`; }).join('')}</definedNames></workbook>`],
    ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${names.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${names.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml', stylesXml()],
    ...sheets.map((sheet, i) => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(sheet)]),
  ];
  return zipFiles(files.map(([name, text]) => ({name, bytes: encoder.encode(text)})));
}

export function downloadWorkbook(sheets, filename) {
  const blob = new Blob([workbook(sheets)], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
