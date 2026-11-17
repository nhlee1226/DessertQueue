"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Trend, WaitLevel, WaitStatus } from "@/types";
import { isStale, levelLabel, waitLevel, waitText } from "@/lib/format";

const levelClass: Record<WaitLevel, string> = {
  short: "bg-wait-short-bg text-wait-short",
  mid: "bg-wait-mid-bg text-wait-mid",
  long: "bg-wait-long-bg text-wait-long",
  off: "bg-wait-off-bg text-wait-off",
};

export const levelHex: Record<WaitLevel, string> = {
  short: "var(--wait-short)",
  mid: "var(--wait-mid)",
  long: "var(--wait-long)",
  off: "var(--wait-off)",
};

/** 대기시간 배지: 색 + 텍스트를 항상 함께 보여준다(색약 대응) */
export function WaitBadge({
  wait,
  open = true,
  size = "md",
  now,
}: {
  wait: WaitStatus | undefined;
  open?: boolean;
  size?: "md" | "lg";
  now?: number;
}) {
  const level = waitLevel(wait, open);
  const stale = isStale(wait, now);
  return (
    <span
      className={`inline-flex shrink-0 flex-col items-end rounded-xl px-2.5 py-1 tabular ${levelClass[level]} ${
        stale ? "opacity-60" : ""
      }`}
    >
      <span className={`font-extrabold leading-tight ${size === "lg" ? "text-2xl" : "text-base"}`}>
        {waitText(wait, open)}
      </span>
      <span className="text-[11px] font-semibold leading-tight">{stale ? "오래된 정보" : levelLabel[level]}</span>
    </span>
  );
}

export function Sparkline({ data, className = "" }: { data: number[]; className?: string }) {
  const w = 72;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - 2 - ((v - min) / span) * (h - 4)}`)
    .join(" ");
  const rising = data[data.length - 1] >= data[0];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      className={className}
      role="img"
      aria-label={`최근 7일 ${rising ? "상승" : "하락"} 추세`}
    >
      <polyline
        points={pts}
        fill="none"
        stroke={rising ? "var(--accent)" : "var(--ink-3)"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RankDelta({ delta }: { delta: number }) {
  if (delta > 0)
    return (
      <span className="text-xs font-bold text-wait-long tabular" aria-label={`${delta}계단 상승`}>
        ▲{delta}
      </span>
    );
  if (delta < 0)
    return (
      <span className="text-xs font-bold text-[#3b6fd8] tabular" aria-label={`${-delta}계단 하락`}>
        ▼{-delta}
      </span>
    );
  return (
    <span className="text-xs font-bold text-ink-3" aria-label="순위 유지">
      –
    </span>
  );
}

export const statusLabel: Record<Trend["status"], { text: string; cls: string }> = {
  rising: { text: "급상승", cls: "bg-accent-soft text-accent" },
  peak: { text: "절정", cls: "bg-wait-mid-bg text-wait-mid" },
  falling: { text: "하락세", cls: "bg-surface-2 text-ink-2" },
};

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full border px-3.5 text-sm font-semibold transition-colors ${
        active ? "border-ink bg-ink text-bg" : "border-line bg-surface text-ink-2"
      }`}
    >
      {children}
    </button>
  );
}

export function Header({ title, back, right }: { title: string; back?: boolean; right?: React.ReactNode }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-[900] flex h-14 items-center gap-2 border-b border-line bg-bg/95 px-2 backdrop-blur">
      {back ? (
        <button
          type="button"
          onClick={() => (history.length > 1 ? router.back() : router.push("/"))}
          aria-label="뒤로"
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl"
        >
          ‹
        </button>
      ) : (
        <span className="w-2" />
      )}
      <h1 className="flex-1 truncate text-lg font-bold">{title}</h1>
      {right}
    </header>
  );
}

export function SaveButton({ saved, onClick, label }: { saved: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? `${label} 찜 해제` : `${label} 찜하기`}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${
        saved ? "text-accent" : "text-ink-3"
      }`}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}

export function Skeleton({ className }: { className: string }) {
  return <div aria-hidden className={`skeleton ${className}`} />;
}

export function EmptyState({ icon, title, action }: { icon: string; title: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="text-4xl" aria-hidden>
        {icon}
      </span>
      <p className="text-ink-2">{title}</p>
      {action && (
        <Link href={action.href} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-bg">
          {action.label}
        </Link>
      )}
    </div>
  );
}
