import type { Confidence, Store, WaitLevel, WaitStatus } from "@/types";

export const STALE_MS = 30 * 60_000;

export function waitLevel(w: WaitStatus | undefined, open = true): WaitLevel {
  if (!w || w.soldOut || !open) return "off";
  if (w.minutes < 30) return "short";
  if (w.minutes < 90) return "mid";
  return "long";
}

export function waitText(w: WaitStatus | undefined, open = true): string {
  if (!open) return "영업 종료";
  if (!w) return "정보 없음";
  if (w.soldOut) return "품절";
  if (w.minutes < 5) return "바로 입장";
  if (w.minutes >= 60) {
    const h = Math.floor(w.minutes / 60);
    const m = w.minutes % 60;
    return m ? `${h}시간 ${m}분` : `${h}시간`;
  }
  return `${w.minutes}분`;
}

export const levelLabel: Record<WaitLevel, string> = {
  short: "여유",
  mid: "보통",
  long: "혼잡",
  off: "불가",
};

export const confidenceLabel: Record<Confidence, string> = {
  low: "낮음",
  mid: "보통",
  high: "높음",
};

export function relTime(ts: number, now = Date.now()): string {
  const min = Math.floor((now - ts) / 60_000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

export function isStale(w: WaitStatus | undefined, now = Date.now()) {
  return !!w && now - w.updatedAt > STALE_MS;
}

export function daysSince(isoDate: string, now = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(isoDate).getTime()) / 86_400_000));
}

function toMin(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function isOpenNow(s: Store, now = new Date()): boolean {
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= toMin(s.openHours.open) && cur < toMin(s.openHours.close);
}

export interface LatLng {
  lat: number;
  lng: number;
}

export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function distanceText(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}
