"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Newspaper,
  Settings,
  ArrowUpRight,
  LogOut,
  BookOpen,
  PanelLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { logout } from "@/app/actions/auth";
import type { Role } from "@/lib/types";
export function AdminShell({
  children,
  role,
  name,
  demo = false,
}: {
  children: React.ReactNode;
  role: Role;
  name: string;
  demo?: boolean;
}) {
  const path = usePathname();
  const prefix = demo ? "/demo" : "/admin";
  const links = [
    { href: prefix, label: "Ringkasan", icon: LayoutDashboard },
    { href: `${prefix}/ppdb`, label: "Pendaftar PPDB", icon: Users },
    { href: `${prefix}/konten`, label: "Konten Sekolah", icon: Newspaper },
    { href: `${prefix}/pengaturan`, label: "Pengaturan", icon: Settings },
  ].filter(
    (l) =>
      !(role === "humas" && l.label === "Pendaftar PPDB") &&
      !(role !== "super_admin" && l.label === "Pengaturan"),
  );
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4rem",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-5">
          <Link href="/" className="flex items-center gap-3">
            <BookOpen className="text-[#e5bc77]" size={25} />
            <div className="group-data-[collapsible=icon]:hidden">
              <strong className="text-base">Cakrawala</strong>
              <small className="block text-[10px] tracking-[2px] text-slate-400">
                PANEL PENGELOLA
              </small>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-3 pt-8">
          <SidebarMenu>
            {links.map((l) => (
              <SidebarMenuItem key={l.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={l.label}
                  isActive={path === l.href}
                  className="h-12 mb-1 text-sm data-[active=true]:bg-[#294c68]"
                >
                  <Link href={l.href}>
                    <l.icon size={19} />
                    <span>{l.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <ArrowUpRight />
                  <span>Lihat website</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {!demo && (
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => void logout()}>
                  <LogOut />
                  <span>Keluar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-[#f4f7fa]">
        <div className="admin-topbar">
          <div>
            <SidebarTrigger aria-label="Buka atau tutup menu" />
            <span className="small muted">Portal pengelola sekolah</span>
          </div>
          <div>
            {demo && <span className="demo-tag">DEMO</span>}
            <span className="small">
              {name} <span className="muted">· {role.replace("_", " ")}</span>
            </span>
          </div>
        </div>
        <main id="main" className="admin-content">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
