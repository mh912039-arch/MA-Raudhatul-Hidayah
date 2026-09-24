"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Brand } from "./Brand";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
const links = [
  ["Beranda", "/"],
  ["Profil Sekolah", "/profil"],
  ["Berita & Agenda", "/berita"],
  ["Galeri", "/galeri"],
  ["Kontak", "/kontak"],
];
export function Header({ name }: { name: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand name={name} />
        <nav className="desktop-nav" aria-label="Navigasi utama">
          {links.map(([label, url]) => (
            <Link key={url} href={url} className={path === url ? "active" : ""}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className="button navy header-cta" href="/ppdb">
          PPDB Online <ArrowUpRight size={17} />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              className="mobile-menu icon-button"
              aria-label="Buka navigasi"
            >
              <Menu />
            </button>
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>Menu sekolah</SheetTitle>
            <nav className="mobile-nav">
              {links
                .concat([
                  ["PPDB Online", "/ppdb"],
                  ["Cek Status", "/ppdb/status"],
                  ["Panel Pengelola", "/admin"],
                ])
                .map(([label, url]) => (
                  <Link key={url} href={url} onClick={() => setOpen(false)}>
                    {label}
                  </Link>
                ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
