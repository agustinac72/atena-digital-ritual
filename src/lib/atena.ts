export type Prize = {
  title: string;
  detail: string;
};

export const PRIZES: Prize[] = [
  { title: "SHOT DE BIENVENIDA", detail: "Mostrá esta pantalla en la barra y retirá tu shot." },
  { title: "2X1 EN BARRA", detail: "Válido para tu primer trago de la noche." },
  { title: "TRAGO DE AUTOR", detail: "Un cocktail de la casa, cortesía de ATENA." },
  { title: "CERVEZA HELADA", detail: "Retirala en la barra mostrando esta pantalla." },
  { title: "COMBO 2 SHOTS", detail: "Para vos y quien vos elijas." },
  { title: "AGUA + SHOT", detail: "Hidratación premium con regalo incluido." },
];

export const INSTAGRAM_URL = "https://instagram.com/atena.house";

export function normalizeHandle(value: string): string {
  return value.trim().replace(/^@+/, "").replace(/\s+/g, "").toLowerCase();
}
