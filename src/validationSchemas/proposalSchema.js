import { z } from "zod";

const fileSizeLimit = 5 * 1024 * 1024; // 5MB

// Definisikan schema validasi untuk proposal
const proposalSchema = z.object({
  judul: z.string().min(1, "Judul proposal wajib diisi"),
  ketuaPeneliti: z.number().min(1, "Ketua Peneliti wajib dipilih"),
  anggotaDosen: z.array(z.number()).min(1, "Minimal 1 Anggota Dosen"),
  anggotaMahasiswa: z.array(z.number()).optional(),
  waktuPelaksanaan: z.string().min(1, "Waktu Pelaksanaan wajib dipilih"),
  sumberDana: z.string().min(1, "Sumber Dana wajib diisi"),
  danaYangDiUsulkan: z.number().nonnegative().min(1, "Jumlah Dana wajib diisi"),
  fileUrl: z
    .any()
    // .instanceof(File)
    // .refine((file) => ["application/pdf"].includes(file.type), {
    //   message: "Tipe file harus PDF",
    // })
    .refine((file) => file.size <= fileSizeLimit, {
      message: "Ukuran file tidak boleh lebih 5MB",
    }),
  luaranPenelitian: z.string().min(1, "Luaran Penelitian wajib diisi"),
  namaMitra: z.string().optional(),
  alamatMitra: z.string().optional(),
  picMitra: z.string().optional(),
});

// Export schema agar bisa digunakan di tempat lain jika perlu
export { proposalSchema };
