/**
 * Generates a tiny valid one-page PDF (Helvetica, ASCII text only).
 * Used by the seed script to create sample study files without extra dependencies.
 * @param {string} title  first line (large)
 * @param {string[]} lines following lines
 * @returns {Buffer}
 */
export function createSamplePdf(title, lines = []) {
  const escape = (text) => text.replace(/[^\x20-\x7E]/g, '?').replace(/([\\()])/g, '\\$1');

  const content = [
    'BT',
    '/F1 22 Tf',
    '72 740 Td',
    `(${escape(title)}) Tj`,
    '/F1 12 Tf',
    ...lines.flatMap((line) => ['0 -24 Td', `(${escape(line)}) Tj`]),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}
