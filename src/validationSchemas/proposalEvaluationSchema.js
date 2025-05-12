import { z } from "zod";

// Schema untuk validasi kriteria penilaian
const criteriaSchema = z.object({
  nilaiKualitasDanKebaruan: z
    .number()
    .min(0, "Nilai tidak boleh kurang dari 0")
    .max(100, "Nilai tidak boleh lebih dari 100"),
  nilaiRoadmap: z.number().min(0).max(100),
  nilaiTinjauanPustaka: z.number().min(0).max(100),
  nilaiKemutakhiranSumber: z.number().min(0).max(100),
  nilaiMetodologi: z.number().min(0).max(100),
  nilaiTargetLuaran: z.number().min(0).max(100),
  nilaiKompetensiDanTugas: z.number().min(0).max(100),
  nilaiPenulisan: z.number().min(0).max(100),
});

// Schema lengkap untuk validasi form penilaian
const evaluationFormSchema = z
  .object({
    proposalId: z.number().positive("ID proposal harus valid"),
    reviewerId: z.number().positive("ID reviewer harus valid"),
    komentar: z.string().optional(),
    // .min(10, "Komentar minimal 10 karakter")
    // .max(1000, "Komentar maksimal 1000 karakter"),
  })
  .merge(criteriaSchema);

export { evaluationFormSchema };
