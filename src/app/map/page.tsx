"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { provider } from "@/data/provider";
import { StoreRow } from "@/components/cards";
import { Chip, Skeleton } from "@/components/ui";
import { useLocation, useNow, useWaits } from "@/lib/hooks";
import { distanceKm } from "@/lib/format";

const StoreMap = dynamic(() => import("@/components/StoreMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

export default function MapPage() {
  const waits = useWaits();
  const now = useNow();
  const { loc, locate, locating } = useLocation();
  const [trendId, setTrendId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const trends = provider.listTrends();

  const stores = useMemo(
    () =>
      provider
        .listStores()
        .filter((s) => !trendId || s.trendIds.includes(trendId))
        .map((s) => ({ s, km: distanceKm(loc, s) }))
        .sort((a, b) => a.km - b.km),
    [trendId, loc],
  );

  const onSelect = useCallback((id: string) => {
    setSelected(id);
    setExpanded(false);
  }, []);

  const sel = stores.find((r) => r.s.id === selected);
  const trendName = (id: string) => provider.getTrend(id)?.name ?? "";

  return (
    <main className="fixed inset-x-0 top-0 bottom-16 mx-auto max-w-lg">
      <div className="absolute inset-0">
        {waits && (
          <StoreMap
            stores={stores.map((r) => r.s)}
            waits={waits}
            center={loc}
            selectedId={selected}
            onSelect={onSelect}
            now={now}
          />
        )}
      </div>

      {/* 상단: 트렌드 필터 */}
      <div className="no-scrollbar absolute inset-x-0 top-0 z-[500] flex gap-2 overflow-x-auto px-4 pt-3 pb-2">
        <Chip active={!trendId} onClick={() => setTrendId(null)}>전체</Chip>
        {trends.map((t) => (
          <Chip key={t.id} active={trendId === t.id} onClick={() => setTrendId(t.id)}>
            {t.emoji} {t.name}
          </Chip>
        ))}
      </div>

      <button
        type="button"
        onClick={locate}
        className="absolute right-4 top-16 z-[500] h-10 rounded-full border border-line bg-surface px-3.5 text-sm font-bold shadow"
      >
        📍 {locating ? "찾는 중…" : loc.label}
      </button>

      {/* 범례 */}
      <div className="absolute left-4 top-16 z-[500] flex gap-1.5 rounded-full bg-surface/95 px-3 py-2 text-[11px] font-bold shadow">
        <span className="text-wait-short">● 30분↓</span>
        <span className="text-wait-mid">● 90분↓</span>
        <span className="text-wait-long">● 90분↑</span>
      </div>

      {/* 바텀시트 */}
      <section
        aria-label="주변 매장"
        className={`absolute inset-x-0 bottom-0 z-[600] flex flex-col rounded-t-3xl border-t border-line bg-bg shadow-[0_-4px_16px_rgba(0,0,0,.12)] transition-[height] ${
          expanded ? "h-[70%]" : sel ? "h-auto" : "h-40"
        }`}
      >
        <button
          type="button"
          onClick={() => {
            setExpanded((v) => !v);
            setSelected(null);
          }}
          aria-expanded={expanded}
          className="flex w-full flex-col items-center pt-2 pb-2"
        >
          <span className="h-1.5 w-10 rounded-full bg-line" aria-hidden />
          <span className="mt-2 text-sm font-bold">
            {expanded ? "지도 보기" : `주변 매장 ${stores.length}곳 · 목록 펼치기`}
          </span>
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {!waits ? (
            <Skeleton className="h-[84px]" />
          ) : sel && !expanded ? (
            <StoreRow store={sel.s} wait={waits[sel.s.id]} km={sel.km} now={now} showTrends trendNames={sel.s.trendIds.map(trendName)} />
          ) : (
            <ul className="flex flex-col gap-2">
              {stores.map((r) => (
                <li key={r.s.id}>
                  <StoreRow store={r.s} wait={waits[r.s.id]} km={r.km} now={now} showTrends trendNames={r.s.trendIds.map(trendName)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
