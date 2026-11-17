"use client";

import Link from "next/link";
import type { Store, Trend, WaitStatus } from "@/types";
import { daysSince, distanceText, isOpenNow } from "@/lib/format";
import { RankDelta, Sparkline, WaitBadge, statusLabel } from "./ui";

export function TrendCard({
  trend,
  storeCount,
  avgWait,
}: {
  trend: Trend;
  storeCount: number;
  avgWait: number | null;
}) {
  const st = statusLabel[trend.status];
  return (
    <Link
      href={`/trend/${trend.id}`}
      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 active:scale-[0.99]"
    >
      <div className="flex w-8 flex-col items-center">
        <span className="text-xl font-extrabold tabular">{trend.rank}</span>
        <RankDelta delta={trend.rankDelta} />
      </div>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-2xl" aria-hidden>
        {trend.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="truncate text-base font-bold">{trend.name}</h3>
          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${st.cls}`}>{st.text}</span>
        </div>
        <p className="mt-0.5 text-sm text-ink-2 tabular">
          매장 {storeCount}곳
          {avgWait !== null && <> · 평균 대기 <b className="text-ink">{avgWait}분</b></>}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-3">
          뜬 지 {daysSince(trend.firstSeenAt)}일째 · {trend.tags.map((t) => `#${t}`).join(" ")}
        </p>
      </div>
      <Sparkline data={trend.buzzHistory.map((h) => h.score)} className="shrink-0" />
    </Link>
  );
}

export function StoreRow({
  store,
  wait,
  km,
  now,
  showTrends,
  trendNames,
}: {
  store: Store;
  wait: WaitStatus | undefined;
  km: number;
  now: number;
  showTrends?: boolean;
  trendNames?: string[];
}) {
  const open = isOpenNow(store, new Date(now));
  return (
    <Link
      href={`/store/${store.id}`}
      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 active:scale-[0.99]"
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-bold">{store.name}</h3>
        <p className="mt-0.5 text-sm text-ink-2 tabular">
          {distanceText(km)} · {store.area} · ★{store.rating.toFixed(1)}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-3">
          {open ? `~${store.openHours.close} 영업` : `${store.openHours.open} 오픈`}
          {store.reservable && " · 예약가능"}
          {showTrends && trendNames && ` · ${trendNames.join(", ")}`}
        </p>
      </div>
      <WaitBadge wait={wait} open={open} now={now} />
    </Link>
  );
}
