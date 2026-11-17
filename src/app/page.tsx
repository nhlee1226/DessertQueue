"use client";

import Link from "next/link";
import { provider } from "@/data/provider";
import { TrendCard } from "@/components/cards";
import { Skeleton } from "@/components/ui";
import { useNow, useWaits } from "@/lib/hooks";
import { isOpenNow, relTime } from "@/lib/format";

export default function HomePage() {
  const waits = useWaits();
  const now = useNow();
  const trends = provider.listTrends();
  const newOnes = trends.filter((t) => t.isNew || t.status === "rising");

  const latest = waits ? Math.max(...Object.values(waits).map((w) => w.updatedAt)) : null;

  function stats(trendId: string) {
    const stores = provider.storesForTrend(trendId);
    if (!waits) return { count: stores.length, avg: null };
    const live = stores
      .map((s) => ({ s, w: waits[s.id] }))
      .filter(({ s, w }) => w && !w.soldOut && isOpenNow(s, new Date(now)));
    const avg = live.length ? Math.round(live.reduce((a, { w }) => a + w!.minutes, 0) / live.length) : null;
    return { count: stores.length, avg };
  }

  return (
    <main>
      <header className="px-4 pt-6 pb-3">
        <p className="text-sm font-semibold text-accent">줄서는디저트</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-snug">
          지금 뜨는 디저트,
          <br />
          얼마나 기다릴까?
        </h1>
        <p className="mt-2 text-xs text-ink-3" aria-live="polite">
          {latest ? `실시간 대기 ${relTime(latest, now)} 갱신` : "불러오는 중…"} · 예시 데이터
        </p>
      </header>

      <section aria-labelledby="new-h" className="mt-2">
        <h2 id="new-h" className="px-4 text-base font-bold">
          이번 주 새로 뜸 🚀
        </h2>
        <ul className="no-scrollbar mt-2 flex gap-2.5 overflow-x-auto px-4 pb-1">
          {newOnes.map((t) => (
            <li key={t.id} className="shrink-0">
              <Link
                href={`/trend/${t.id}`}
                className="flex w-36 flex-col gap-1 rounded-2xl bg-accent-soft p-3.5"
              >
                <span className="text-3xl" aria-hidden>
                  {t.emoji}
                </span>
                <span className="font-bold leading-tight">{t.name}</span>
                <span className="text-xs font-semibold text-accent tabular">버즈 {t.buzzScore}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="rank-h" className="mt-6 px-4">
        <div className="flex items-baseline justify-between">
          <h2 id="rank-h" className="text-base font-bold">
            실시간 트렌드 TOP {trends.length}
          </h2>
          <span className="text-xs text-ink-3">인스타·X·검색량 종합</span>
        </div>
        <ol className="mt-2 flex flex-col gap-2">
          {trends.map((t) => {
            const s = stats(t.id);
            return (
              <li key={t.id}>
                {waits ? (
                  <TrendCard trend={t} storeCount={s.count} avgWait={s.avg} />
                ) : (
                  <Skeleton className="h-[84px]" />
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
