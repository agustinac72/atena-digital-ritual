export type Segment = {
  label: string;
  win: boolean;
};

/** 6 secciones alternadas: 3 con premio, 3 sin premio. */
export const SEGMENTS: Segment[] = [
  { label: "GANASTE UN TRAGO 🍸", win: true },
  { label: "NOS VEMOS EN LA PISTA 🪩", win: false },
  { label: "GANASTE UN TRAGO 🍸", win: true },
  { label: "NOS VEMOS EN LA PISTA 🪩", win: false },
  { label: "GANASTE UN TRAGO 🍸", win: true },
  { label: "NOS VEMOS EN LA PISTA 🪩", win: false },
];

export const WIN_INDEXES = SEGMENTS.map((s, i) => (s.win ? i : -1)).filter((i) => i >= 0);
export const LOSE_INDEXES = SEGMENTS.map((s, i) => (!s.win ? i : -1)).filter((i) => i >= 0);

export const PRIZE_LABEL = "GANASTE UN TRAGO 🍸";
export const NO_PRIZE_LABEL = "NOS VEMOS EN LA PISTA 🪩";

export const INSTAGRAM_URL = "https://instagram.com/atena.house";
export const INSTAGRAM_OPEN_URL = "https://www.instagram.com";
export const INSTAGRAM_HANDLE = "@atena.house";

export function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();
}
