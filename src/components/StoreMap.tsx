"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Store, WaitStatus } from "@/types";
import { isOpenNow, waitLevel, waitText, type LatLng } from "@/lib/format";
import { levelHex } from "./ui";

export default function StoreMap({
  stores,
  waits,
  center,
  selectedId,
  onSelect,
  now,
}: {
  stores: Store[];
  waits: Record<string, WaitStatus>;
  center: LatLng;
  selectedId: string | null;
  onSelect: (id: string) => void;
  now: number;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const me = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { zoomControl: false, attributionControl: true }).setView(
      [center.lat, center.lng],
      12,
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map.current) return;
    me.current?.remove();
    me.current = L.circleMarker([center.lat, center.lng], {
      radius: 8,
      color: "#fff",
      weight: 3,
      fillColor: "#3b6fd8",
      fillOpacity: 1,
    }).addTo(map.current);
  }, [center]);

  useEffect(() => {
    const g = layer.current;
    if (!g) return;
    g.clearLayers();
    const d = new Date(now);
    for (const s of stores) {
      const w = waits[s.id];
      const open = isOpenNow(s, d);
      const color = levelHex[waitLevel(w, open)];
      const sel = s.id === selectedId;
      const html = `<div style="
        transform: translate(-50%, -100%);
        display:inline-flex; white-space:nowrap; align-items:center; gap:4px;
        padding:${sel ? "6px 10px" : "4px 8px"}; border-radius:999px;
        background:${color}; color:#fff; font-weight:800; font-size:${sel ? 15 : 13}px;
        box-shadow:0 2px 6px rgba(0,0,0,.25); border:2px solid #fff;
        font-family:inherit; font-variant-numeric:tabular-nums;">
        ${waitText(w, open)}</div>`;
      const m = L.marker([s.lat, s.lng], {
        icon: L.divIcon({ html, className: "wait-pin", iconSize: [0, 0] }),
        keyboard: true,
        title: s.name,
        zIndexOffset: sel ? 1000 : 0,
      });
      m.on("click", () => onSelect(s.id));
      g.addLayer(m);
    }
  }, [stores, waits, selectedId, onSelect, now]);

  useEffect(() => {
    if (!map.current || !selectedId) return;
    const s = stores.find((x) => x.id === selectedId);
    if (s) map.current.panTo([s.lat - 0.004, s.lng], { animate: true });
  }, [selectedId, stores]);

  return <div ref={el} className="h-full w-full" role="application" aria-label="매장 지도" />;
}
