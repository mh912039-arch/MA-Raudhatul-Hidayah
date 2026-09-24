import type { Registration } from "./types";
export const demoRegistrations: Registration[] = [
  ["Nadia Putri", "SMP Harapan", "Menunggu"],
  ["Raka Pratama", "SMP Tunas Bangsa", "Diterima"],
  ["Alya Ramadhani", "MTs Al-Hikmah", "Perlu revisi"],
  ["Bima Aditya", "SMP Mandiri", "Menunggu"],
  ["Salsabila Putri", "SMP Nusantara", "Menunggu"],
].map(([name, school, status], i) => ({
  id: `contoh-${i}`,
  registration_number: `DEMO-2027-00000${i + 1}`,
  student_name: name,
  nisn: `000000000${i}`,
  birth_date: "2011-03-12",
  gender: i % 2 ? "Laki-laki" : "Perempuan",
  parent_name: "Wali Siswa Contoh",
  parent_phone: "08000000000",
  email: "contoh@example.com",
  address: "Alamat demonstrasi",
  previous_school: school,
  status: status as Registration["status"],
  notes:
    status === "Perlu revisi"
      ? "Unggah ulang scan rapor yang lebih jelas."
      : "",
  report_path: "",
  birth_path: "",
  created_at: "2026-09-24T08:00:00Z",
  updated_at: "2026-09-24T08:00:00Z",
}));
