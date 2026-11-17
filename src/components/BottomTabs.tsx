"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "트렌드", icon: "🔥", match: (p: string) => p === "/" || p.startsWith("/trend") || p.startsWith("/store") },
  { href: "/map", label: "지도", icon: "🗺️", match: (p: string) => p.startsWith("/map") },
  { href: "/saved", label: "찜", icon: "♥", match: (p: string) => p.startsWith("/saved") },
  { href: "/report", label: "제보", icon: "✍️", match: (p: string) => p.startsWith("/report") },
];

export default function BottomTabs() {
  const path = usePathname();
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-[1000] border-t border-line bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {tabs.map((t) => {
          const active = t.match(path);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                  active ? "text-accent" : "text-ink-3"
                }`}
              >
                <span aria-hidden className="text-xl leading-none">
                  {t.icon}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
