import { z } from "zod";

// const fileSizeLimit = 5 * 1024 * 1024; // 5MB

// Definisikan schema validasi untuk proposal
const proposalSchema = z.object({
  judul: z.string().min(1, "Judul proposal wajib diisi"),
  ketuaPeneliti: z.number().min(1, "Ketua Peneliti wajib dipilih"),
  anggotaDosen: z.array(z.number()).min(1, "Minimal 1 Anggota Dosen"),
  anggotaMahasiswa: z.array(z.number()).optional(),
  waktuPelaksanaan: z.preprocess(
    (val) => {
      if (val === "" || val == null) return undefined;
      return new Date(val);
    },
    z.date({
      required_error: "Waktu Pelaksanaan wajib dipilih",
      invalid_type_error: "Format Waktu Pelaksanaan tidak valid",
    })
  ),

  sumberDana: z.string().min(1, "Sumber Dana wajib diisi"),
  danaYangDiUsulkan: z
    .number({
      required_error: "Jumlah Dana wajib dipilih",
      invalid_type_error: "Format Jumlah Dana tidak valid",
    })
    .nonnegative(),
  fileUrl: z.any(),
  // .instanceof(File)
  // .refine((file) => ["application/pdf"].includes(file.type), {
  //   message: "Tipe file harus PDF",
  // })
  // .refine((file) => file.size <= fileSizeLimit, {
  //   message: "Ukuran file tidak boleh lebih 5MB",
  // }),
  luaranPenelitian: z.string().min(1, "Luaran Penelitian wajib diisi"),
  namaMitra: z.string().optional(),
  alamatMitra: z.string().optional(),
  picMitra: z.string().optional(),
});

// Export schema agar bisa digunakan di tempat lain jika perlu
export { proposalSchema };
