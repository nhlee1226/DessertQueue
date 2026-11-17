export type TrendStatus = "rising" | "peak" | "falling";

export interface Trend {
  id: string;
  name: string;
  aliases: string[];
  emoji: string;
  tags: string[];
  rank: number;
  rankDelta: number; // +면 상승, -면 하락, 0 유지
  buzzScore: number; // 0~100
  buzzHistory: { date: string; score: number }[]; // 최근 7일
  sourceShare: { instagram: number; x: number; search: number }; // 합 100
  firstSeenAt: string; // ISO date
  status: TrendStatus;
  isNew?: boolean;
  description: string;
}

export interface Store {
  id: string;
  name: string;
  area: string;
  trendIds: string[];
  lat: number;
  lng: number;
  address: string;
  openHours: { open: string; close: string }; // "HH:MM"
  rating: number;
  reservable: boolean;
  instagramHandle?: string;
  kakaoPlaceId?: string;
  naverPlaceId?: string;
}

export type Confidence = "low" | "mid" | "high";

export interface WaitStatus {
  storeId: string;
  minutes: number;
  queueCount?: number;
  soldOut: boolean;
  confidence: Confidence;
  sourceCount: number;
  updatedAt: number; // epoch ms
}

export interface Report {
  storeId: string;
  minutes: number;
  queueCount?: number;
  soldOut: boolean;
  createdAt: number; // epoch ms
}

export type WaitLevel = "short" | "mid" | "long" | "off";
