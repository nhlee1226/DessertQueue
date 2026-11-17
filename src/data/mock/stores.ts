import type { Store } from "@/types";

// 가상 매장(실존 매장 아님). 좌표는 서울 주요 디저트 상권 근처.
export const mockStores: Store[] = [
  { id: "s1", name: "버터공방 성수", area: "성수", trendIds: ["butter-tteok", "salt-bread"], lat: 37.5447, lng: 127.0559, address: "서울 성동구 연무장길 일대", openHours: { open: "11:00", close: "21:00" }, rating: 4.6, reservable: false, instagramHandle: "butter_seongsu" },
  { id: "s2", name: "모찌하우스", area: "성수", trendIds: ["butter-tteok", "pizza-tteok"], lat: 37.5425, lng: 127.0531, address: "서울 성동구 성수이로 일대", openHours: { open: "12:00", close: "20:00" }, rating: 4.4, reservable: true },
  { id: "s3", name: "떡방앗간 연남", area: "연남", trendIds: ["pizza-tteok", "butter-tteok"], lat: 37.5622, lng: 126.9254, address: "서울 마포구 동교로 일대", openHours: { open: "10:00", close: "20:00" }, rating: 4.5, reservable: false },
  { id: "s4", name: "머랭하우스", area: "한남", trendIds: ["meringue-cake", "fruit-mochi"], lat: 37.5345, lng: 127.0012, address: "서울 용산구 이태원로 일대", openHours: { open: "11:30", close: "21:30" }, rating: 4.7, reservable: true, instagramHandle: "meringue_house" },
  { id: "s5", name: "구름케이크", area: "연남", trendIds: ["meringue-cake"], lat: 37.5608, lng: 126.9231, address: "서울 마포구 연희로 일대", openHours: { open: "12:00", close: "22:00" }, rating: 4.3, reservable: false },
  { id: "s6", name: "피스타치오랩", area: "강남", trendIds: ["dubai-cookie", "fruit-mochi"], lat: 37.4979, lng: 127.0276, address: "서울 강남구 강남대로 일대", openHours: { open: "10:30", close: "21:00" }, rating: 4.2, reservable: false },
  { id: "s7", name: "쫀득상회", area: "잠실", trendIds: ["dubai-cookie", "butter-tteok"], lat: 37.5113, lng: 127.0981, address: "서울 송파구 올림픽로 일대", openHours: { open: "10:00", close: "22:00" }, rating: 4.1, reservable: false },
  { id: "s8", name: "치즈떡집", area: "잠실", trendIds: ["pizza-tteok"], lat: 37.5133, lng: 127.1002, address: "서울 송파구 백제고분로 일대", openHours: { open: "11:00", close: "20:30" }, rating: 4.0, reservable: true },
  { id: "s9", name: "과일떡공방", area: "성수", trendIds: ["fruit-mochi", "meringue-cake"], lat: 37.5469, lng: 127.0587, address: "서울 성동구 서울숲길 일대", openHours: { open: "09:00", close: "18:00" }, rating: 4.8, reservable: false, instagramHandle: "fruitmochi_lab" },
  { id: "s10", name: "소금빵 연구소", area: "한남", trendIds: ["salt-bread"], lat: 37.5368, lng: 127.0038, address: "서울 용산구 한남대로 일대", openHours: { open: "08:00", close: "19:00" }, rating: 4.5, reservable: false },
  { id: "s11", name: "요거트팜", area: "강남", trendIds: ["yogurt-ice"], lat: 37.5005, lng: 127.0262, address: "서울 강남구 테헤란로 일대", openHours: { open: "11:00", close: "23:00" }, rating: 4.2, reservable: false },
  { id: "s12", name: "두바이스위츠", area: "연남", trendIds: ["dubai-cookie"], lat: 37.5636, lng: 126.9268, address: "서울 마포구 성미산로 일대", openHours: { open: "12:00", close: "21:00" }, rating: 3.9, reservable: false },
  { id: "s13", name: "버터앤떡", area: "강남", trendIds: ["butter-tteok", "pizza-tteok"], lat: 37.4992, lng: 127.0301, address: "서울 강남구 서초대로 일대", openHours: { open: "11:00", close: "21:00" }, rating: 4.3, reservable: true },
  { id: "s14", name: "아이스요거", area: "성수", trendIds: ["yogurt-ice"], lat: 37.5438, lng: 127.0512, address: "서울 성동구 아차산로 일대", openHours: { open: "12:00", close: "22:00" }, rating: 4.0, reservable: false },
];
