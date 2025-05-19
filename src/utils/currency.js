/**
 * Mengubah angka menjadi format Rupiah (tanpa desimal).
 * Contoh: 20000000 => "Rp 20.000.000"
 *
 * @param {number} angka - Nilai numerik yang akan diformat.
 * @returns {string} - String dalam format "Rp 20.000.000"
 */
export function formatRupiah(angka) {
  if (typeof angka === "string") {
    angka = angka.replace(/\./g, ""); // Menghapus titik
    angka = parseFloat(angka);
  } else if (typeof angka !== "number" || isNaN(angka)) return "Rp 0";
  console.log(typeof angka === "number");

  return `Rp ${angka.toLocaleString("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
