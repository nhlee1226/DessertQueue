import type { Confidence, Report, Store, Trend, WaitStatus } from "@/types";
import { mockTrends } from "./mock/trends";
import { mockStores } from "./mock/stores";

/**
 * 데이터 소스 인터페이스.
 * 지금은 mockProvider가 구현하고, 나중에 실제 수집기(네이버 데이터랩, 카카오 로컬 API,
 * 사용자 제보 서버 등)로 교체한다. 화면 코드는 이 인터페이스만 의존한다.
 */
export interface TrendProvider {
  listTrends(): Trend[];
  getTrend(id: string): Trend | undefined;
}

export interface StoreProvider {
  listStores(): Store[];
  getStore(id: string): Store | undefined;
  storesForTrend(trendId: string): Store[];
}

export interface WaitProvider {
  getWait(storeId: string): WaitStatus | undefined;
  allWaits(): Record<string, WaitStatus>;
  reportsFor(storeId: string): Report[];
  addReport(r: Omit<Report, "createdAt">): void;
  /** 대기 정보가 바뀌면 호출. 해제 함수를 돌려준다. */
  subscribe(fn: () => void): () => void;
}

export type DataProvider = TrendProvider & StoreProvider & WaitProvider;

// ---------------- mock 구현 ----------------

const POLL_MS = 30_000;
const REPORT_KEY = "dw.reports";

const baseWait: Record<string, number> = {
  s1: 150, s2: 80, s3: 95, s4: 55, s5: 20, s6: 25, s7: 40,
  s8: 15, s9: 120, s10: 30, s11: 10, s12: 5, s13: 65, s14: 12,
};

function confidenceOf(count: number, ageMin: number): Confidence {
  if (count >= 3 && ageMin <= 20) return "high";
  if (count >= 1 && ageMin <= 45) return "mid";
  return "low";
}

function createMockProvider(): DataProvider {
  let waits: Record<string, WaitStatus> = {};
  let reports: Report[] = [];
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | null = null;
  let initialized = false;

  function init() {
    if (initialized || typeof window === "undefined") return;
    initialized = true;
    const now = Date.now();
    try {
      const saved = JSON.parse(localStorage.getItem(REPORT_KEY) ?? "[]") as Report[];
      reports = saved.filter((r) => now - r.createdAt < 3 * 60 * 60_000);
    } catch {
      reports = [];
    }
    for (const s of mockStores) {
      const ageMin = Math.floor(Math.random() * 50);
      const count = Math.floor(Math.random() * 6);
      const minutes = baseWait[s.id] ?? 30;
      waits[s.id] = {
        storeId: s.id,
        minutes,
        queueCount: Math.round(minutes / 4),
        soldOut: s.id === "s12",
        confidence: confidenceOf(count, ageMin),
        sourceCount: count,
        updatedAt: now - ageMin * 60_000,
      };
    }
    for (const r of reports) applyReport(r);
  }

  function applyReport(r: Report) {
    const prev = waits[r.storeId];
    const recent = reports.filter(
      (x) => x.storeId === r.storeId && r.createdAt - x.createdAt < 60 * 60_000,
    );
    // 최근 제보일수록 가중치가 크다 (30분 반감)
    let wSum = 0;
    let mSum = 0;
    for (const x of recent) {
      const w = Math.exp(-(r.createdAt - x.createdAt) / (30 * 60_000));
      wSum += w;
      mSum += w * x.minutes;
    }
    const minutes = Math.round(mSum / wSum);
    const count = (prev?.sourceCount ?? 0) + 1;
    waits[r.storeId] = {
      storeId: r.storeId,
      minutes,
      queueCount: r.queueCount ?? Math.round(minutes / 4),
      soldOut: r.soldOut,
      confidence: confidenceOf(count, 0),
      sourceCount: count,
      updatedAt: r.createdAt,
    };
  }

  function tick() {
    const now = Date.now();
    const next: Record<string, WaitStatus> = {};
    for (const [id, w] of Object.entries(waits)) {
      if (w.soldOut || Math.random() > 0.4) {
        next[id] = w;
        continue;
      }
      // 새 제보가 들어온 것처럼 값과 갱신시각을 바꾼다
      const minutes = Math.max(0, w.minutes + Math.round((Math.random() - 0.5) * 16));
      next[id] = {
        ...w,
        minutes,
        queueCount: Math.round(minutes / 4),
        sourceCount: w.sourceCount + 1,
        confidence: confidenceOf(w.sourceCount + 1, 0),
        updatedAt: now,
      };
    }
    waits = next;
    emit();
  }

  function emit() {
    listeners.forEach((fn) => fn());
  }

  return {
    listTrends: () => [...mockTrends].sort((a, b) => a.rank - b.rank),
    getTrend: (id) => mockTrends.find((t) => t.id === id),
    listStores: () => mockStores,
    getStore: (id) => mockStores.find((s) => s.id === id),
    storesForTrend: (trendId) => mockStores.filter((s) => s.trendIds.includes(trendId)),

    getWait: (id) => {
      init();
      return waits[id];
    },
    allWaits: () => {
      init();
      return waits;
    },
    reportsFor: (id) => {
      init();
      return reports.filter((r) => r.storeId === id).sort((a, b) => b.createdAt - a.createdAt);
    },
    addReport: (input) => {
      init();
      const r: Report = { ...input, createdAt: Date.now() };
      reports = [...reports, r];
      try {
        localStorage.setItem(REPORT_KEY, JSON.stringify(reports));
      } catch {
        /* 저장 실패해도 메모리 상태는 유지 */
      }
      applyReport(r);
      waits = { ...waits };
      emit();
    },
    subscribe: (fn) => {
      init();
      listeners.add(fn);
      if (!timer) timer = setInterval(tick, POLL_MS);
      return () => {
        listeners.delete(fn);
        if (listeners.size === 0 && timer) {
          clearInterval(timer);
          timer = null;
        }
      };
    },
  };
}

export const provider: DataProvider = createMockProvider();
