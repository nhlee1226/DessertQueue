"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { provider } from "@/data/provider";
import { StoreRow } from "@/components/cards";
import { Chip, EmptyState, Header, SaveButton, Skeleton, Sparkline, statusLabel } from "@/components/ui";
import { useLocation, useNow, useSaved, useWaits } from "@/lib/hooks";
import { daysSince, distanceKm, isOpenNow } from "@/lib/format";

type Sort = "near" | "wait" | "rating";

export default function TrendPage() {
  const { id } = useParams<{ id: string }>();
  const trend = provider.getTrend(id);
  const waits = useWaits();
  const now = useNow();
  const { loc, locate, locating } = useLocation();
  const { saved, toggle } = useSaved();
  const [sort, setSort] = useState<Sort>("near");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyReservable, setOnlyReservable] = useState(false);

  const rows = useMemo(() => {
    if (!trend || !waits) return [];
    const d = new Date(now);
    return provider
      .storesForTrend(trend.id)
      .map((s) => ({ s, w: waits[s.id], km: distanceKm(loc, s), open: isOpenNow(s, d) }))
      .filter((r) => !onlyAvailable || (r.w && !r.w.soldOut))
      .filter((r) => !onlyOpen || r.open)
      .filter((r) => !onlyReservable || r.s.reservable)
      .sort((a, b) => {
        if (sort === "near") return a.km - b.km;
        if (sort === "rating") return b.s.rating - a.s.rating;
        // 대기 짧은 순: 영업중·판매중이 먼저
        const av = !a.open || a.w?.soldOut ? Infinity : a.w?.minutes ?? Infinity;
        const bv = !b.open || b.w?.soldOut ? Infinity : b.w?.minutes ?? Infinity;
        return av - bv;
      });
  }, [trend, waits, now, loc, sort, onlyAvailable, onlyOpen, onlyReservable]);

  if (!trend) return <EmptyState icon="🤔" title="없는 트렌드예요" action={{ href: "/", label: "홈으로" }} />;

  const st = statusLabel[trend.status];
  const share = trend.sourceShare;

  return (
    <main>
      <Header
        title={trend.name}
        back
        right={<SaveButton saved={saved.trends.includes(trend.id)} onClick={() => toggle("trends", trend.id)} label={trend.name} />}
      />

      <section className="px-4 pt-4">
        <div className="flex items-start gap-3">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-4xl" aria-hidden>
            {trend.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`rounded-md px-1.5 py-0.5 text-xs font-bold ${st.cls}`}>{st.text}</span>
              <span className="text-sm font-semibold text-ink-2 tabular">
                {trend.rank}위 · 버즈 {trend.buzzScore} · 뜬 지 {daysSince(trend.firstSeenAt)}일째
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{trend.description}</p>
            {trend.aliases.length > 0 && <p className="mt-1 text-xs text-ink-3">다른 이름: {trend.aliases.join(", ")}</p>}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">어디서 화제?</span>
            <Sparkline data={trend.buzzHistory.map((h) => h.score)} />
          </div>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full" aria-hidden>
            <span style={{ width: `${share.instagram}%`, background: "#d6336c" }} />
            <span style={{ width: `${share.x}%`, background: "var(--ink)" }} />
            <span style={{ width: `${share.search}%`, background: "#2f9e44" }} />
          </div>
          <p className="mt-2 flex gap-3 text-xs text-ink-2 tabular">
            <span>● 인스타 {share.instagram}%</span>
            <span>● X {share.x}%</span>
            <span>● 검색 {share.search}%</span>
          </p>
        </div>
      </section>

      <section aria-labelledby="stores-h" className="mt-6">
        <div className="flex items-center justify-between px-4">
          <h2 id="stores-h" className="text-base font-bold">
            파는 곳 {waits ? rows.length : ""}
          </h2>
          <button type="button" onClick={locate} className="h-9 text-sm font-semibold text-accent">
            📍 {locating ? "찾는 중…" : `${loc.label} 기준`}
          </button>
        </div>

        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-4" role="group" aria-label="정렬">
          <Chip active={sort === "near"} onClick={() => setSort("near")}>가까운 순</Chip>
          <Chip active={sort === "wait"} onClick={() => setSort("wait")}>대기 짧은 순</Chip>
          <Chip active={sort === "rating"} onClick={() => setSort("rating")}>평점 순</Chip>
        </div>
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto px-4" role="group" aria-label="필터">
          <Chip active={onlyAvailable} onClick={() => setOnlyAvailable((v) => !v)}>판매중만</Chip>
          <Chip active={onlyOpen} onClick={() => setOnlyOpen((v) => !v)}>지금 영업중</Chip>
          <Chip active={onlyReservable} onClick={() => setOnlyReservable((v) => !v)}>예약 가능</Chip>
        </div>

        <ul className="mt-3 flex flex-col gap-2 px-4">
          {!waits &&
            [0, 1, 2].map((i) => (
              <li key={i}>
                <Skeleton className="h-[84px]" />
              </li>
            ))}
          {waits &&
            rows.map((r) => (
              <li key={r.s.id}>
                <StoreRow store={r.s} wait={r.w} km={r.km} now={now} />
              </li>
            ))}
        </ul>
        {waits && rows.length === 0 && <EmptyState icon="🔍" title="조건에 맞는 매장이 없어요. 필터를 줄여 보세요." />}
      </section>
    </main>
  );
}
