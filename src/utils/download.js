/**
 * Saves a Blob as a file with the given name (works with any characters, e.g. Cyrillic).
 * The temporary link has a `download` attribute, so the router leaves the click native.
 */
export function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
