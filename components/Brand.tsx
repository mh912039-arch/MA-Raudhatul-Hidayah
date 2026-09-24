import Link from "next/link";
import { BookOpen } from "lucide-react";
export function Brand({
  name = "SMA Cakrawala",
  light = false,
}: {
  name?: string;
  light?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label={`${name} — beranda`}
    >
      <span className="brand-mark">
        <BookOpen size={25} strokeWidth={1.7} />
      </span>
      <span>
        <strong>{name}</strong>
        <small>BERKARAKTER · BERPRESTASI</small>
      </span>
    </Link>
  );
}
