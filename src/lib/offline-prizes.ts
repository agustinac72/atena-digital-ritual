export const MAX_DRINKS = 50;

const COUNTER_KEY = "atena.drinks.given";
const LAST_RESULT_KEY = "atena.spins.last";

/** Resultado del último giro realizado (persistente, funciona offline). */
export function getLastResult(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_RESULT_KEY);
}

export function setLastResult(value: string | null) {
  if (typeof window === "undefined") return;
  if (value === null) window.localStorage.removeItem(LAST_RESULT_KEY);
  else window.localStorage.setItem(LAST_RESULT_KEY, value);
}

function readNumber(key: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(key);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

export function getLocalGiven(): number {
  return Math.min(readNumber(COUNTER_KEY), MAX_DRINKS);
}

export function setLocalGiven(n: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COUNTER_KEY, String(Math.max(0, Math.min(n, MAX_DRINKS))));
}

export function resetLocal() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COUNTER_KEY, "0");
  window.localStorage.removeItem(LAST_RESULT_KEY);
}

/** Cupo entregado; vive únicamente en el dispositivo. */
export function loadGiven(): number {
  return getLocalGiven();
}

/** Reserva un trago si queda cupo. Todo local, sin red. */
export function claimDrink(): boolean {
  const local = getLocalGiven();
  if (local >= MAX_DRINKS) return false;
  setLocalGiven(local + 1);
  return true;
}

export function resetCounter() {
  resetLocal();
}
