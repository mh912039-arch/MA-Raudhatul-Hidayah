import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "SMA Cakrawala — Ruang Bertumbuh, Bekal Masa Depan",
    template: "%s | SMA Cakrawala",
  },
  description:
    "Kenali profil sekolah, kegiatan siswa, dan pendaftaran peserta didik baru secara online.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <a href="#main" className="skip-link">
          Lewati ke konten
        </a>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
