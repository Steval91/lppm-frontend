/**
 * Download file dari Blob.
 * @param {Blob} blob - Blob file yang diterima dari response.
 * @param {string} filename - Nama file saat diunduh.
 * @param {string} mimeType - Tipe MIME file (default: 'application/octet-stream').
 */
export function downloadFile(
  blob,
  filename,
  mimeType = "application/octet-stream"
) {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
