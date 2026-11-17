import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomTabs from "@/components/BottomTabs";

export const metadata: Metadata = {
  title: "줄서는디저트",
  description: "지금 뜨는 디저트, 파는 곳, 실시간 대기시간을 한 번에",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#15110e" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-dvh">
        <div className="mx-auto max-w-lg min-h-dvh pb-24">{children}</div>
        <BottomTabs />
      </body>
    </html>
  );
}
