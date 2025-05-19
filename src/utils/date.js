/**
 * Format tanggal JavaScript ke string "DD/MM/YYYY".
 * @param {Date|null|undefined} date - Objek tanggal.
 * @returns {string} - Format "DD/MM/YYYY", atau string kosong jika tidak valid.
 */
export function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Mengonversi string tanggal berformat "DD/MM/YYYY" menjadi objek Date JavaScript.
 * @param {string} dateString - Tanggal dalam format "DD/MM/YYYY".
 * @returns {Date|null} - Objek Date atau null jika tidak valid.
 */
export function parseDate(dateString) {
  if (!dateString || typeof dateString !== "string") return null;

  const parts = dateString.split("/");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Bulan dimulai dari 0
    const year = parseInt(parts[2], 10);

    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  return null;
}

/**
 * Mengonversi objek Date menjadi string tahun (format "YYYY").
 * Cocok untuk Calendar PrimeReact dengan view="year".
 * @param {Date|null|undefined} date - Objek Date.
 * @returns {string} - Tahun sebagai string, atau string kosong jika tidak valid.
 */
export function formatYear(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "";
  return String(date.getFullYear());
}

/**
 * Mengonversi string tahun (format "YYYY") menjadi objek Date.
 * Hanya digunakan untuk view="year" di PrimeReact Calendar.
 * @param {string} yearString - Tahun dalam bentuk string.
 * @returns {Date|null} - Objek Date dengan tanggal 1 Januari tahun tersebut, atau null jika tidak valid.
 */
export function parseYearString(yearString) {
  const year = parseInt(yearString, 10);
  if (!isNaN(year)) {
    return new Date(year, 0, 1); // 1 Januari
  }
  return null;
}
