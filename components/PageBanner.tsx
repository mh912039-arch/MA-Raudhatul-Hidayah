import Link from "next/link";
import { ChevronRight } from "lucide-react";
export function PageBanner({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="page-banner">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Beranda</Link>
          <ChevronRight size={13} />
          <span>{label}</span>
        </div>
        <div className="eyebrow">{label.toUpperCase()}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}
