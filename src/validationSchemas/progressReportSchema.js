import { z } from "zod";

// Zod schema untuk validasi form Progress Report
export const progressReportSchema = z.object({
  tahunPelaksanaan: z.preprocess(
    (val) => {
      if (val === "" || val == null) return undefined;
      return new Date(val);
    },
    z.date({
      required_error: "Tahun Pelaksanaan wajib dipilih",
      invalid_type_error: "Format Tahun Pelaksanaan tidak valid",
    })
  ),
  biayaTahunBerjalan: z
    .number({
      required_error: "Biaya Tahun Berjalan wajib dipilih",
      invalid_type_error: "Format Biaya Tahun Berjalan tidak valid",
    })
    .min(0, "Biaya Tahun Berjalan tidak boleh negatif"),
  // .nullable(), // tambah ini

  biayaKeseluruhan: z
    .number({
      required_error: "Biaya Keseluruhan wajib dipilih",
      invalid_type_error: "Format Biaya Keseluruhan tidak valid",
    })
    .min(0, "Biaya Keseluruhan tidak boleh negatif"),
  // .nullable(), // tambah ini
});
