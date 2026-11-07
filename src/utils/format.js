const dateFormatter = new Intl.DateTimeFormat('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat('bg-BG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const numberFormatter = new Intl.NumberFormat('bg-BG');

/** 1536 → "1,5 KB" */
export function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  return `${value.toLocaleString('bg-BG', { maximumFractionDigits: exponent === 0 ? 0 : 1 })} ${units[exponent]}`;
}

export const formatDate = (value) => dateFormatter.format(new Date(value));
export const formatDateTime = (value) => dateTimeFormatter.format(new Date(value));
export const formatNumber = (value) => numberFormatter.format(value ?? 0);

/** 4.333 → "4,3" */
export function formatRating(value) {
  return Number(value || 0).toLocaleString('bg-BG', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Bulgarian plural helper: plural(3, 'материал', 'материала') → "3 материала" */
export function plural(count, one, many) {
  return `${formatNumber(count)} ${count === 1 ? one : many}`;
}

const FILE_TYPES = {
  'application/pdf': { label: 'PDF', icon: 'bi-file-earmark-pdf', tone: 'coral' },
  'application/msword': { label: 'DOC', icon: 'bi-file-earmark-word', tone: 'sky' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { label: 'DOCX', icon: 'bi-file-earmark-word', tone: 'sky' },
  'application/vnd.ms-powerpoint': { label: 'PPT', icon: 'bi-file-earmark-ppt', tone: 'yellow' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { label: 'PPTX', icon: 'bi-file-earmark-ppt', tone: 'yellow' },
  'application/vnd.ms-excel': { label: 'XLS', icon: 'bi-file-earmark-excel', tone: 'green' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { label: 'XLSX', icon: 'bi-file-earmark-excel', tone: 'green' },
  'text/plain': { label: 'TXT', icon: 'bi-file-earmark-text', tone: 'paper' },
  'application/zip': { label: 'ZIP', icon: 'bi-file-earmark-zip', tone: 'lilac' },
};

/** Display info (label, Bootstrap icon, theme tone for ss-tone-*) for a MIME type. */
export function fileTypeInfo(mimeType) {
  return FILE_TYPES[mimeType] ?? { label: 'FILE', icon: 'bi-file-earmark', tone: 'paper' };
}
