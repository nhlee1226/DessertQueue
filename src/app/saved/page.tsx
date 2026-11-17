"use client";

import { provider } from "@/data/provider";
import { StoreRow, TrendCard } from "@/components/cards";
import { EmptyState, Header, Skeleton } from "@/components/ui";
import { useLocation, useNow, useSaved, useWaits } from "@/lib/hooks";
import { distanceKm } from "@/lib/format";

export default function SavedPage() {
  const { saved } = useSaved();
  const waits = useWaits();
  const now = useNow();
  const { loc } = useLocation();

  const trends = saved.trends.map((id) => provider.getTrend(id)).filter((t) => !!t);
  const stores = saved.stores.map((id) => provider.getStore(id)).filter((s) => !!s);
  const alerts = saved.alerts.map((id) => provider.getStore(id)).filter((s) => !!s);

  return (
    <main>
      <Header title="찜" />
      {!waits ? (
        <div className="flex flex-col gap-2 p-4">
          <Skeleton className="h-[84px]" />
          <Skeleton className="h-[84px]" />
        </div>
      ) : trends.length + stores.length + alerts.length === 0 ? (
        <EmptyState icon="♡" title="찜한 디저트·매장이 없어요. ♡를 눌러 모아 보세요." action={{ href: "/", label: "트렌드 보러 가기" }} />
      ) : (
        <div className="flex flex-col gap-6 px-4 pt-4">
          {alerts.length > 0 && (
            <section>
              <h2 className="text-base font-bold">🔔 줄 줄면 알림 ({alerts.length})</h2>
              <p className="mt-0.5 text-xs text-ink-3">대기가 30분 아래로 내려가면 알려 드려요 (프로토타입: 표시만)</p>
              <ul className="mt-2 flex flex-col gap-2">
                {alerts.map((s) => (
                  <li key={s.id}>
                    <StoreRow store={s} wait={waits[s.id]} km={distanceKm(loc, s)} now={now} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {stores.length > 0 && (
            <section>
              <h2 className="text-base font-bold">매장 ({stores.length})</h2>
              <ul className="mt-2 flex flex-col gap-2">
                {stores.map((s) => (
                  <li key={s.id}>
                    <StoreRow store={s} wait={waits[s.id]} km={distanceKm(loc, s)} now={now} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {trends.length > 0 && (
            <section>
              <h2 className="text-base font-bold">디저트 ({trends.length})</h2>
              <ul className="mt-2 flex flex-col gap-2">
                {trends.map((t) => (
                  <li key={t.id}>
                    <TrendCard trend={t} storeCount={provider.storesForTrend(t.id).length} avgWait={null} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
