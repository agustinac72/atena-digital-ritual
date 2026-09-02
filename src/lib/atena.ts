export type SegmentKind = "win" | "lose" | "again";

export type Segment = {
  label: string;
  kind: SegmentKind;
  win: boolean;
};

export const PRIZE_LABEL = "¡GANASTE! 🥂";
export const NO_PRIZE_LABEL = "NOS VEMOS EN LA PISTA 🪩";
export const AGAIN_LABEL = "GIRÁ DE NUEVO 🔄";

/** 6 casilleros reales: 2 premio, 3 sin premio, 1 girá de nuevo. */
export const SEGMENTS: Segment[] = [
  { label: PRIZE_LABEL, kind: "win", win: true },
  { label: NO_PRIZE_LABEL, kind: "lose", win: false },
  { label: AGAIN_LABEL, kind: "again", win: false },
  { label: PRIZE_LABEL, kind: "win", win: true },
  { label: NO_PRIZE_LABEL, kind: "lose", win: false },
  { label: NO_PRIZE_LABEL, kind: "lose", win: false },
];

export const WIN_INDEXES = SEGMENTS.map((s, i) => (s.kind === "win" ? i : -1)).filter((i) => i >= 0);
export const LOSE_INDEXES = SEGMENTS.map((s, i) => (s.kind === "lose" ? i : -1)).filter(
  (i) => i >= 0,
);

export const WIN_RESULT_LABEL = "¡Ganaste un trago!";

export const INSTAGRAM_URL = "https://instagram.com/atena.house";
export const INSTAGRAM_OPEN_URL = "https://www.instagram.com";
export const INSTAGRAM_HANDLE = "@atena.house";

export function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();
}
