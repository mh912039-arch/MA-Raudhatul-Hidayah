"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { GraduationCap, Check } from "lucide-react";
import Image from "next/image";
import type { School } from "@/lib/types";
export function ProfileTabs({
  school,
  tab = "profil",
}: {
  school: School;
  tab?: string;
}) {
  return (
    <Tabs
      defaultValue={
        ["profil", "sambutan", "visi", "struktur"].includes(tab)
          ? tab
          : "profil"
      }
    >
      <div className="tabs-scroll">
        <TabsList className="h-12 gap-2 p-1">
          <TabsTrigger value="profil" className="px-4">
            Tentang Sekolah
          </TabsTrigger>
          <TabsTrigger value="sambutan" className="px-4">
            Sambutan
          </TabsTrigger>
          <TabsTrigger value="visi" className="px-4">
            Visi & Misi
          </TabsTrigger>
          <TabsTrigger value="struktur" className="px-4">
            Struktur Organisasi
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="profil" className="tab-panel">
        <div className="content-grid">
          <div className="stack">
            <h2>Pendidikan dengan tujuan.</h2>
            <p className="muted">{school.intro}</p>
            <p className="muted">{school.tagline}</p>
            <div className="panel">
              <h3>Nilai yang kami tumbuhkan</h3>
              <p>
                Integritas, rasa ingin tahu, kerja sama, dan kepedulian menjadi
                fondasi pengalaman belajar di sekolah.
              </p>
            </div>
          </div>
          <div className="news-image" style={{ height: 330 }}>
            <Image
              src="/images/campus.webp"
              alt="Ilustrasi lingkungan sekolah"
              fill
              sizes="50vw"
              className="cover"
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="sambutan" className="tab-panel">
        <div className="panel stack">
          <div className="principal-photo">
            {school.principal_image ? (
              <Image
                src={school.principal_image}
                fill
                sizes="150px"
                alt={school.principal_name}
                className="cover"
              />
            ) : (
              <GraduationCap size={65} strokeWidth={1} />
            )}
          </div>
          <h2>Selamat datang di {school.name}.</h2>
          <p className="article-body">{school.principal_message}</p>
          <div>
            <strong>{school.principal_name}</strong>
            <p>Kepala Sekolah</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="visi" className="tab-panel">
        <div className="content-grid">
          <div className="panel">
            <div className="eyebrow">VISI KAMI</div>
            <h2>{school.vision}</h2>
          </div>
          <div className="stack">
            <h2>Misi yang kami jalankan</h2>
            {school.mission.map((m, i) => (
              <div key={i} className="check-line">
                <Check size={20} />
                <p>{m}</p>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="struktur" className="tab-panel">
        <div className="org-chart">
          <div className="org-node">
            <strong>Kepala Sekolah</strong>
            <small>{school.principal_name}</small>
          </div>
          <div className="org-branches">
            {[
              "Bidang Kurikulum",
              "Bidang Kesiswaan",
              "Humas & Kemitraan",
              "Sarana & Prasarana",
            ].map((n) => (
              <div className="org-node" key={n}>
                {n}
                <small>Koordinator bidang</small>
              </div>
            ))}
          </div>
          <div className="org-node">Guru & Tenaga Kependidikan</div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
