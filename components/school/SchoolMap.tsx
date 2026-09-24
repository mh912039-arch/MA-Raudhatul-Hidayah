"use client";
import { useState } from "react";
export function SchoolMap({ url, address }: { url: string; address: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="stack">
      <div
        style={{
          position: "relative",
          minHeight: 370,
          background: "#eff4f7",
          borderRadius: 8,
        }}
      >
        {!loaded && (
          <div
            style={{ position: "absolute", inset: 30, pointerEvents: "none" }}
          >
            <p className="muted">Memuat peta…</p>
            <p className="small">{address}</p>
          </div>
        )}
        <iframe
          className="map"
          src={url}
          title="Peta lokasi sekolah"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="small muted">{address}</p>
      <a
        className="text-link"
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Buka petunjuk arah di Google Maps ↗
      </a>
    </div>
  );
}
