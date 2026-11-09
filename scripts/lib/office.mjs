/**
 * Minimal Office Open XML generators (DOCX, XLSX, PPTX) for seed sample files.
 * Only the parts each format requires — the files open in Word, Excel and PowerPoint.
 */
import { createZip } from './zip.mjs';

const xml = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS_R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const NS_A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const NS_P = 'http://schemas.openxmlformats.org/presentationml/2006/main';
const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const CT = 'application/vnd.openxmlformats-officedocument';

function contentTypes(overrides) {
  return `${HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">`
    + '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
    + '<Default Extension="xml" ContentType="application/xml"/>'
    + overrides.map(([part, type]) => `<Override PartName="${part}" ContentType="${type}"/>`).join('')
    + '</Types>';
}

function rels(list) {
  return `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`
    + list.map(([id, type, target]) => `<Relationship Id="${id}" Type="${REL}/${type}" Target="${target}"/>`).join('')
    + '</Relationships>';
}

// ---------------------------------------------------------------------------
// DOCX
// ---------------------------------------------------------------------------
/**
 * @param {{ title: string, subtitle?: string, sections: { heading: string, paragraphs?: string[], bullets?: string[] }[] }} doc
 * @param {Date} [date]
 */
export function createDocx({ title, subtitle, sections }, date) {
  const run = (text, { size = 22, bold = false, color } = {}) =>
    `<w:r><w:rPr>${bold ? '<w:b/>' : ''}${color ? `<w:color w:val="${color}"/>` : ''}<w:sz w:val="${size}"/></w:rPr><w:t xml:space="preserve">${xml(text)}</w:t></w:r>`;
  const para = (text, options, after = 160) => `<w:p><w:pPr><w:spacing w:after="${after}"/></w:pPr>${run(text, options)}</w:p>`;

  const body = [
    para(title, { size: 40, bold: true }, 80),
    subtitle ? para(subtitle, { size: 22, color: '5F6470' }, 320) : '',
    ...sections.flatMap((section) => [
      para(section.heading, { size: 28, bold: true, color: '3E5CE0' }, 120),
      ...(section.paragraphs ?? []).map((text) => para(text)),
      ...(section.bullets ?? []).map((text) => `<w:p><w:pPr><w:spacing w:after="60"/><w:ind w:left="360" w:hanging="240"/></w:pPr>${run(`•  ${text}`)}</w:p>`),
    ]),
  ].join('');

  return createZip([
    { name: '[Content_Types].xml', data: contentTypes([['/word/document.xml', `${CT}.wordprocessingml.document.main+xml`]]) },
    { name: '_rels/.rels', data: rels([['rId1', 'officeDocument', 'word/document.xml']]) },
    {
      name: 'word/document.xml',
      data: `${HEAD}<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}`
        + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>'
        + '</w:body></w:document>',
    },
  ], date);
}

// ---------------------------------------------------------------------------
// XLSX
// ---------------------------------------------------------------------------
const columnName = (index) => String.fromCharCode(65 + index);

/**
 * @param {{ sheetName: string, columns: { title: string, width: number }[], rows: (string | number)[][] }} sheet
 * @param {Date} [date]
 */
export function createXlsx({ sheetName, columns, rows }, date) {
  const cell = (value, ref, style = 0) => (typeof value === 'number'
    ? `<c r="${ref}" s="${style}"><v>${value}</v></c>`
    : `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`);
  const allRows = [columns.map((c) => c.title), ...rows];
  const sheetData = allRows
    .map((row, r) => `<row r="${r + 1}">${row.map((value, c) => cell(value, `${columnName(c)}${r + 1}`, r === 0 ? 1 : 0)).join('')}</row>`)
    .join('');
  const cols = columns.map((c, i) => `<col min="${i + 1}" max="${i + 1}" width="${c.width}" customWidth="1"/>`).join('');

  const styles = `${HEAD}<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`
    + '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>'
    + '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>'
    + '<fill><patternFill patternType="solid"><fgColor rgb="FFCDDCFF"/><bgColor indexed="64"/></patternFill></fill></fills>'
    + '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
    + '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    + '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>'
    + '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>'
    + '</styleSheet>';

  return createZip([
    {
      name: '[Content_Types].xml',
      data: contentTypes([
        ['/xl/workbook.xml', `${CT}.spreadsheetml.sheet.main+xml`],
        ['/xl/worksheets/sheet1.xml', `${CT}.spreadsheetml.worksheet+xml`],
        ['/xl/styles.xml', `${CT}.spreadsheetml.styles+xml`],
      ]),
    },
    { name: '_rels/.rels', data: rels([['rId1', 'officeDocument', 'xl/workbook.xml']]) },
    {
      name: 'xl/workbook.xml',
      data: `${HEAD}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="${NS_R}">`
        + `<sheets><sheet name="${xml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    },
    { name: 'xl/_rels/workbook.xml.rels', data: rels([['rId1', 'worksheet', 'worksheets/sheet1.xml'], ['rId2', 'styles', 'styles.xml']]) },
    { name: 'xl/styles.xml', data: styles },
    {
      name: 'xl/worksheets/sheet1.xml',
      data: `${HEAD}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">`
        + `<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
        + `<cols>${cols}</cols><sheetData>${sheetData}</sheetData></worksheet>`,
    },
  ], date);
}

// ---------------------------------------------------------------------------
// PPTX
// ---------------------------------------------------------------------------
const SLIDE_W = 12192000; // 16:9
const SLIDE_H = 6858000;
const EMPTY_TREE = '<p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/>';

function textBox(id, name, [x, y, w, h], paragraphs, fill) {
  const fillXml = fill ? `<a:solidFill><a:srgbClr val="${fill}"/></a:solidFill><a:ln w="25400"><a:solidFill><a:srgbClr val="1F1F1F"/></a:solidFill></a:ln>` : '<a:noFill/>';
  const body = paragraphs.length
    ? paragraphs.map(({ text, size, bold, color = '1F1F1F' }) =>
      `<a:p><a:r><a:rPr lang="bg-BG" sz="${size}"${bold ? ' b="1"' : ''}><a:solidFill><a:srgbClr val="${color}"/></a:solidFill></a:rPr><a:t>${xml(text)}</a:t></a:r></a:p>`).join('')
    : '<a:p><a:endParaRPr lang="bg-BG"/></a:p>';
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="${name}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>`
    + `<p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${w}" cy="${h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom>${fillXml}</p:spPr>`
    + `<p:txBody><a:bodyPr wrap="square" lIns="182880" tIns="91440" rIns="182880" bIns="91440"><a:normAutofit/></a:bodyPr><a:lstStyle/>${body}</p:txBody></p:sp>`;
}

function slideXml({ title, bullets = [] }, index, total, accent) {
  const shapes = [
    textBox(2, 'Band', [0, 0, SLIDE_W, 1371600], [], accent),
    textBox(3, 'Title', [457200, 228600, SLIDE_W - 914400, 1005840], [{ text: title, size: 3600, bold: true }]),
    textBox(4, 'Content', [457200, 1737360, SLIDE_W - 914400, SLIDE_H - 2560320], bullets.map((text) => ({ text: `•  ${text}`, size: 2200 }))),
    textBox(5, 'Footer', [457200, SLIDE_H - 640080, SLIDE_W - 914400, 457200], [{ text: `StudyShare  ·  ${index + 1} / ${total}`, size: 1200, color: '5F6470' }]),
  ];
  return `${HEAD}<p:sld xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}"><p:cSld><p:spTree>${EMPTY_TREE}${shapes.join('')}</p:spTree></p:cSld>`
    + '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>';
}

function themeXml() {
  const colors = [['dk1', '1F1F1F'], ['lt1', 'FFFFFF'], ['dk2', '3E5CE0'], ['lt2', 'F5F8FF'], ['accent1', '5B7CFA'], ['accent2', '6DBB6A'],
    ['accent3', 'F6D84A'], ['accent4', 'E5675A'], ['accent5', 'A5A8FF'], ['accent6', 'CDDCFF'], ['hlink', '3E5CE0'], ['folHlink', '4A4DC4']];
  const fill = '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>';
  const font = '<a:latin typeface="Calibri"/><a:ea typeface=""/><a:cs typeface=""/>';
  return `${HEAD}<a:theme xmlns:a="${NS_A}" name="StudyShare"><a:themeElements>`
    + `<a:clrScheme name="StudyShare">${colors.map(([n, v]) => `<a:${n}><a:srgbClr val="${v}"/></a:${n}>`).join('')}</a:clrScheme>`
    + `<a:fontScheme name="StudyShare"><a:majorFont>${font}</a:majorFont><a:minorFont>${font}</a:minorFont></a:fontScheme>`
    + `<a:fmtScheme name="StudyShare"><a:fillStyleLst>${fill.repeat(3)}</a:fillStyleLst>`
    + `<a:lnStyleLst>${`<a:ln w="9525">${fill}</a:ln>`.repeat(3)}</a:lnStyleLst>`
    + `<a:effectStyleLst>${'<a:effectStyle><a:effectLst/></a:effectStyle>'.repeat(3)}</a:effectStyleLst>`
    + `<a:bgFillStyleLst>${fill.repeat(3)}</a:bgFillStyleLst></a:fmtScheme>`
    + '</a:themeElements></a:theme>';
}

/**
 * @param {{ slides: { title: string, bullets?: string[] }[], accent?: string }} deck  accent = hex color of the title band
 * @param {Date} [date]
 */
export function createPptx({ slides, accent = 'CDDCFF' }, date) {
  const ns = `xmlns:a="${NS_A}" xmlns:r="${NS_R}" xmlns:p="${NS_P}"`;
  const entries = [
    {
      name: '[Content_Types].xml',
      data: contentTypes([
        ['/ppt/presentation.xml', `${CT}.presentationml.presentation.main+xml`],
        ['/ppt/slideMasters/slideMaster1.xml', `${CT}.presentationml.slideMaster+xml`],
        ['/ppt/slideLayouts/slideLayout1.xml', `${CT}.presentationml.slideLayout+xml`],
        ['/ppt/theme/theme1.xml', `${CT}.theme+xml`],
        ...slides.map((_, i) => [`/ppt/slides/slide${i + 1}.xml`, `${CT}.presentationml.slide+xml`]),
      ]),
    },
    { name: '_rels/.rels', data: rels([['rId1', 'officeDocument', 'ppt/presentation.xml']]) },
    {
      name: 'ppt/presentation.xml',
      data: `${HEAD}<p:presentation ${ns}><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>`
        + `<p:sldIdLst>${slides.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 3}"/>`).join('')}</p:sldIdLst>`
        + `<p:sldSz cx="${SLIDE_W}" cy="${SLIDE_H}"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`,
    },
    {
      name: 'ppt/_rels/presentation.xml.rels',
      data: rels([
        ['rId1', 'slideMaster', 'slideMasters/slideMaster1.xml'],
        ['rId2', 'theme', 'theme/theme1.xml'],
        ...slides.map((_, i) => [`rId${i + 3}`, 'slide', `slides/slide${i + 1}.xml`]),
      ]),
    },
    {
      name: 'ppt/slideMasters/slideMaster1.xml',
      data: `${HEAD}<p:sldMaster ${ns}><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree>${EMPTY_TREE}</p:spTree></p:cSld>`
        + '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
        + '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst></p:sldMaster>',
    },
    { name: 'ppt/slideMasters/_rels/slideMaster1.xml.rels', data: rels([['rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml'], ['rId2', 'theme', '../theme/theme1.xml']]) },
    {
      name: 'ppt/slideLayouts/slideLayout1.xml',
      data: `${HEAD}<p:sldLayout ${ns} type="blank" preserve="1"><p:cSld name="Blank"><p:spTree>${EMPTY_TREE}</p:spTree></p:cSld>`
        + '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>',
    },
    { name: 'ppt/slideLayouts/_rels/slideLayout1.xml.rels', data: rels([['rId1', 'slideMaster', '../slideMasters/slideMaster1.xml']]) },
    { name: 'ppt/theme/theme1.xml', data: themeXml() },
    ...slides.flatMap((slide, i) => [
      { name: `ppt/slides/slide${i + 1}.xml`, data: slideXml(slide, i, slides.length, accent) },
      { name: `ppt/slides/_rels/slide${i + 1}.xml.rels`, data: rels([['rId1', 'slideLayout', '../slideLayouts/slideLayout1.xml']]) },
    ]),
  ];
  return createZip(entries, date);
}
