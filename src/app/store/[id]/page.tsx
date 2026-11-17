"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { provider } from "@/data/provider";
import { EmptyState, Header, SaveButton, Skeleton, levelHex } from "@/components/ui";
import { useLocation, useNow, useSaved, useWaits } from "@/lib/hooks";
import {
  confidenceLabel,
  distanceKm,
  distanceText,
  isOpenNow,
  isStale,
  levelLabel,
  relTime,
  waitLevel,
  waitText,
} from "@/lib/format";
import type { Report } from "@/types";

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const store = provider.getStore(id);
  const waits = useWaits();
  const now = useNow();
  const { loc } = useLocation();
  const { saved, toggle } = useSaved();
  const [reports, setReports] = useState<Report[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (store) setReports(provider.reportsFor(store.id));
  }, [store, waits]);

  if (!store) return <EmptyState icon="🤔" title="없는 매장이에요" action={{ href: "/", label: "홈으로" }} />;

  // 시간·영업 여부는 클라이언트 시각 기준이라 마운트 전에는 스켈레톤만 보여준다
  if (!waits)
    return (
      <main>
        <Header title={store.name} back />
        <div className="flex flex-col gap-3 px-4 pt-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-12" />
          <Skeleton className="h-56" />
        </div>
      </main>
    );

  const w = waits[store.id];
  const open = isOpenNow(store, new Date(now));
  const level = waitLevel(w, open);
  const stale = isStale(w, now);
  const trends = store.trendIds.map((t) => provider.getTrend(t)).filter(Boolean);
  const q = encodeURIComponent(store.name);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(store!.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 무시 */
    }
  }

  return (
    <main>
      <Header
        title={store.name}
        back
        right={<SaveButton saved={saved.stores.includes(store.id)} onClick={() => toggle("stores", store.id)} label={store.name} />}
      />

      {/* 가장 중요한 정보: 대기시간 */}
      <section className="px-4 pt-4" aria-live="polite">
        {!waits ? (
          <Skeleton className="h-40" />
        ) : (
          <div
            className={`rounded-3xl border-2 bg-surface p-5 ${stale ? "opacity-70" : ""}`}
            style={{ borderColor: levelHex[level] }}
          >
            <p className="text-sm font-bold" style={{ color: levelHex[level] }}>
              {open ? `지금 예상 대기 · ${levelLabel[level]}` : "지금은 영업 시간이 아니에요"}
            </p>
            <p className="mt-1 text-5xl font-extrabold tracking-tight tabular">
              {open && w && !w.soldOut && w.minutes >= 5 ? "약 " : ""}
              {waitText(w, open)}
            </p>
            {w && open && !w.soldOut && w.queueCount !== undefined && (
              <p className="mt-1 text-base font-semibold text-ink-2 tabular">앞에 약 {w.queueCount}팀</p>
            )}
            {w && (
              <p className="mt-3 text-xs text-ink-3 tabular">
                {relTime(w.updatedAt, now)} · 제보 {w.sourceCount}건 기반 · 신뢰도 {confidenceLabel[w.confidence]}
                {stale && <b className="ml-1 text-wait-long">· 오래된 정보</b>}
              </p>
            )}
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link
            href={`/report?store=${store.id}`}
            className="flex h-12 items-center justify-center rounded-2xl bg-ink text-base font-bold text-bg"
          >
            ✍️ 지금 대기 제보
          </Link>
          <button
            type="button"
            onClick={() => toggle("alerts", store.id)}
            aria-pressed={saved.alerts.includes(store.id)}
            className={`h-12 rounded-2xl border text-base font-bold ${
              saved.alerts.includes(store.id) ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface"
            }`}
          >
            🔔 {saved.alerts.includes(store.id) ? "알림 켜짐" : "줄 줄면 알림"}
          </button>
        </div>
      </section>

      <section className="mt-5 px-4">
        <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
          <Info label="거리">{distanceText(distanceKm(loc, store))} ({loc.label} 기준)</Info>
          <Info label="영업">
            {store.openHours.open} – {store.openHours.close}{" "}
            <b className={open ? "text-wait-short" : "text-ink-3"}>{open ? "영업중" : "영업 전/종료"}</b>
          </Info>
          <Info label="예약">{store.reservable ? "가능" : "현장 대기만"}</Info>
          <Info label="평점">★ {store.rating.toFixed(1)}</Info>
          <Info label="주소">
            <span className="flex items-center justify-between gap-2">
              <span>{store.address}</span>
              <button type="button" onClick={copyAddress} className="h-8 shrink-0 rounded-lg bg-surface-2 px-2.5 text-xs font-bold">
                {copied ? "복사됨" : "복사"}
              </button>
            </span>
          </Info>
        </dl>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <a
            href={`https://map.kakao.com/link/search/${q}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center rounded-2xl bg-[#fee500] text-sm font-bold text-[#191919]"
          >
            카카오맵 길찾기
          </a>
          <a
            href={`https://map.naver.com/p/search/${q}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center justify-center rounded-2xl bg-[#03c75a] text-sm font-bold text-white"
          >
            네이버지도 길찾기
          </a>
        </div>
      </section>

      <section className="mt-6 px-4">
        <h2 className="text-base font-bold">이 매장의 트렌드 메뉴</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {trends.map((t) => (
            <Link key={t!.id} href={`/trend/${t!.id}`} className="rounded-full bg-surface-2 px-3 py-2 text-sm font-semibold">
              {t!.emoji} {t!.name}
            </Link>
          ))}
          {store.instagramHandle && (
            <a
              href={`https://www.instagram.com/${store.instagramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-surface-2 px-3 py-2 text-sm font-semibold"
            >
              📷 인스타 @{store.instagramHandle}
            </a>
          )}
        </div>
      </section>

      <section className="mt-6 px-4">
        <h2 className="text-base font-bold">최근 제보</h2>
        {reports.length === 0 ? (
          <p className="mt-2 text-sm text-ink-3">아직 내가 보낸 제보가 없어요. 줄 서 있다면 첫 제보를 남겨 주세요!</p>
        ) : (
          <ol className="mt-2 flex flex-col gap-1.5">
            {reports.slice(0, 5).map((r) => (
              <li key={r.createdAt} className="flex justify-between rounded-xl bg-surface px-3 py-2.5 text-sm tabular">
                <span className="font-semibold">
                  {r.soldOut ? "품절" : `${r.minutes}분`}
                  {r.queueCount !== undefined && ` · ${r.queueCount}팀`}
                </span>
                <span className="text-ink-3">{relTime(r.createdAt, now)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 px-3.5 py-3 text-sm">
      <dt className="w-10 shrink-0 font-semibold text-ink-3">{label}</dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}
