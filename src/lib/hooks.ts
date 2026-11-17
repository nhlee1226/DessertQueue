"use client";

import { useCallback, useEffect, useState } from "react";
import { provider } from "@/data/provider";
import type { WaitStatus } from "@/types";
import type { LatLng } from "./format";

/** 클라이언트에 마운트된 뒤에만 true. 서버 렌더와 시간 값이 어긋나지 않게 한다. */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** 전체 대기 정보 + 실시간 갱신 구독 */
export function useWaits(): Record<string, WaitStatus> | null {
  const [waits, setWaits] = useState<Record<string, WaitStatus> | null>(null);
  useEffect(() => {
    setWaits(provider.allWaits());
    return provider.subscribe(() => setWaits(provider.allWaits()));
  }, []);
  return waits;
}

/** "N분 전" 같은 상대 시간이 저절로 갱신되도록 주기적으로 현재 시각을 돌려준다 */
export function useNow(intervalMs = 15_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

// ---------------- 찜 (localStorage) ----------------

const SAVED_KEY = "dw.saved";
interface Saved {
  trends: string[];
  stores: string[];
  alerts: string[]; // 대기시간 하락 알림을 켠 매장
}
const emptySaved: Saved = { trends: [], stores: [], alerts: [] };
const savedListeners = new Set<() => void>();

function readSaved(): Saved {
  try {
    return { ...emptySaved, ...JSON.parse(localStorage.getItem(SAVED_KEY) ?? "{}") };
  } catch {
    return emptySaved;
  }
}

export function useSaved() {
  const [saved, setSaved] = useState<Saved>(emptySaved);
  useEffect(() => {
    setSaved(readSaved());
    const fn = () => setSaved(readSaved());
    savedListeners.add(fn);
    return () => {
      savedListeners.delete(fn);
    };
  }, []);

  const toggle = useCallback((kind: keyof Saved, id: string) => {
    const cur = readSaved();
    const list = cur[kind];
    const next = { ...cur, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] };
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
    } catch {
      /* 무시 */
    }
    savedListeners.forEach((f) => f());
  }, []);

  return { saved, toggle };
}

// ---------------- 위치 ----------------

export const DEFAULT_LOCATION: LatLng & { label: string } = {
  lat: 37.5446,
  lng: 127.0557,
  label: "성수역",
};

const LOC_KEY = "dw.loc";

export function useLocation() {
  const [loc, setLoc] = useState(DEFAULT_LOCATION);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    try {
      const v = sessionStorage.getItem(LOC_KEY);
      if (v) setLoc(JSON.parse(v));
    } catch {
      /* 무시 */
    }
  }, []);

  const locate = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const v = { lat: p.coords.latitude, lng: p.coords.longitude, label: "내 위치" };
        setLoc(v);
        try {
          sessionStorage.setItem(LOC_KEY, JSON.stringify(v));
        } catch {
          /* 무시 */
        }
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }, []);

  return { loc, locate, locating };
}
