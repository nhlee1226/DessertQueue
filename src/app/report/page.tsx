"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { provider } from "@/data/provider";
import { Header } from "@/components/ui";
import { useLocation } from "@/lib/hooks";
import { distanceKm, distanceText } from "@/lib/format";

const MINUTE_OPTIONS = [5, 15, 30, 60, 90, 120, 180];

export default function ReportPage() {
  return (
    <Suspense>
      <ReportForm />
    </Suspense>
  );
}

function ReportForm() {
  const params = useSearchParams();
  const { loc } = useLocation();
  const [storeId, setStoreId] = useState<string>(params.get("store") ?? "");
  const [minutes, setMinutes] = useState<number | null>(null);
  const [queue, setQueue] = useState<number | null>(null);
  const [soldOut, setSoldOut] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const s = params.get("store");
    if (s) setStoreId(s);
  }, [params]);

  const stores = provider
    .listStores()
    .map((s) => ({ s, km: distanceKm(loc, s) }))
    .sort((a, b) => a.km - b.km);
  const store = provider.getStore(storeId);
  const canSubmit = !!store && (soldOut || minutes !== null);

  function submit() {
    if (!store || !canSubmit) return;
    provider.addReport({
      storeId: store.id,
      minutes: soldOut ? 0 : minutes!,
      queueCount: queue ?? undefined,
      soldOut,
    });
    setDone(true);
  }

  if (done && store)
    return (
      <main>
        <Header title="제보 완료" />
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="text-5xl" aria-hidden>
            🙌
          </span>
          <p className="text-lg font-bold">고마워요! {store.name} 대기 정보가 갱신됐어요.</p>
          <div className="mt-2 flex gap-2">
            <Link href={`/store/${store.id}`} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-bg">
              매장 보기
            </Link>
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setMinutes(null);
                setQueue(null);
                setSoldOut(false);
              }}
              className="rounded-full border border-line px-5 py-2.5 text-sm font-bold"
            >
              하나 더 제보
            </button>
          </div>
        </div>
      </main>
    );

  return (
    <main>
      <Header title="지금 줄 서 있어요" />
      <div className="flex flex-col gap-6 px-4 pt-4 pb-28">
        <p className="text-sm text-ink-2">다른 사람들을 위해 지금 보이는 대기 상황을 알려 주세요. 10초면 끝나요.</p>

        <Field n={1} label="어느 매장인가요?">
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="h-12 w-full rounded-2xl border border-line bg-surface px-3 text-base font-semibold"
          >
            <option value="">가까운 매장 선택</option>
            {stores.map(({ s, km }) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.area} · {distanceText(km)})
              </option>
            ))}
          </select>
        </Field>

        <Field n={2} label="품절됐나요?">
          <div className="grid grid-cols-2 gap-2">
            <Toggle active={!soldOut} onClick={() => setSoldOut(false)}>아직 팔아요</Toggle>
            <Toggle active={soldOut} onClick={() => setSoldOut(true)}>품절이에요</Toggle>
          </div>
        </Field>

        {!soldOut && (
          <>
            <Field n={3} label="예상 대기 시간">
              <div className="grid grid-cols-4 gap-2">
                {MINUTE_OPTIONS.map((m) => (
                  <Toggle key={m} active={minutes === m} onClick={() => setMinutes(m)}>
                    {m % 60 === 0 ? `${m / 60}시간${m === 180 ? "+" : ""}` : `${m}분`}
                  </Toggle>
                ))}
              </div>
            </Field>

            <Field n={4} label="앞에 몇 팀? (선택)">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="다섯 팀 줄이기"
                  onClick={() => setQueue((q) => Math.max(0, (q ?? 0) - 5))}
                  className="h-12 w-12 rounded-2xl border border-line bg-surface text-xl font-bold"
                >
                  −
                </button>
                <span className="min-w-20 text-center text-2xl font-extrabold tabular" aria-live="polite">
                  {queue === null ? "—" : `${queue}팀`}
                </span>
                <button
                  type="button"
                  aria-label="다섯 팀 늘리기"
                  onClick={() => setQueue((q) => (q ?? 0) + 5)}
                  className="h-12 w-12 rounded-2xl border border-line bg-surface text-xl font-bold"
                >
                  +
                </button>
                <span className="text-xs text-ink-3">5팀 단위</span>
              </div>
            </Field>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-16 z-[800] mx-auto max-w-lg bg-bg/95 px-4 py-3 backdrop-blur">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="h-14 w-full rounded-2xl bg-accent text-lg font-extrabold text-white disabled:bg-surface-2 disabled:text-ink-3"
        >
          {canSubmit ? "제보하기" : store ? "대기 시간을 골라 주세요" : "매장을 골라 주세요"}
        </button>
      </div>
    </main>
  );
}

function Field({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold">
        <span className="mr-1.5 text-accent tabular">{n}</span>
        {label}
      </h2>
      {children}
    </section>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-12 rounded-2xl border text-base font-bold tabular ${
        active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink-2"
      }`}
    >
      {children}
    </button>
  );
}
