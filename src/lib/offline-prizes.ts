import { supabase } from "@/integrations/supabase/client";
import { PRIZE_LABEL, NO_PRIZE_LABEL } from "@/lib/atena";

export const MAX_DRINKS = 50;

const COUNTER_KEY = "atena.drinks.given";
const QUEUE_KEY = "atena.entries.queue";
const COOLDOWN_KEY = "atena.spins.cooldown";
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

type QueuedEntry = { won_drink: boolean; created_at: string };

function readNumber(key: string): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(key);
  const n = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function readQueue(): QueuedEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueuedEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(q: QueuedEntry[]) {
  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-500)));
}

export function getLocalGiven(): number {
  return readNumber(COUNTER_KEY);
}

export function setLocalGiven(n: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COUNTER_KEY, String(Math.max(0, Math.min(n, MAX_DRINKS))));
}

export function resetLocal() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COUNTER_KEY, "0");
  window.localStorage.removeItem(QUEUE_KEY);
  window.localStorage.removeItem(COOLDOWN_KEY);
  window.localStorage.removeItem(LAST_RESULT_KEY);
}

/** Lee el cupo en la nube; si no hay conexión, usa el contador local. */
export async function loadGiven(): Promise<number> {
  const local = getLocalGiven();
  if (typeof navigator !== "undefined" && navigator.onLine === false) return local;
  try {
    const { data, error } = await supabase
      .from("prizes_counter")
      .select("total_drinks_given")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return local;
    const remote = data.total_drinks_given ?? 0;
    const value = Math.max(remote, local);
    setLocalGiven(value);
    return value;
  } catch {
    return local;
  }
}

/**
 * Intenta reservar un trago. Offline resuelve con el contador local,
 * respetando el cupo máximo; online usa el RPC atómico.
 */
export async function claimDrink(): Promise<boolean> {
  const local = getLocalGiven();
  if (local >= MAX_DRINKS) return false;

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    setLocalGiven(local + 1);
    return true;
  }
  try {
    const { data, error } = await supabase.rpc("claim_drink");
    if (error) throw error;
    if (data === true) {
      setLocalGiven(local + 1);
      return true;
    }
    return false;
  } catch {
    setLocalGiven(local + 1);
    return true;
  }
}

export async function resetCounter() {
  resetLocal();
  try {
    await supabase.rpc("reset_roulette", { p_code: "ATENA-RESET" });
  } catch {
    /* offline: el reinicio local ya se aplicó */
  }
}

/** Guarda la jugada; si no hay conexión la deja en cola para sincronizar luego. */
export function saveEntry(wonDrink: boolean) {
  const entry: QueuedEntry = { won_drink: wonDrink, created_at: new Date().toISOString() };
  const queue = readQueue();
  queue.push(entry);
  writeQueue(queue);
  void flushQueue();
}

let flushing = false;

export async function flushQueue() {
  if (flushing) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;
  const queue = readQueue();
  if (queue.length === 0) return;
  flushing = true;
  try {
    const rows = queue.map((e) => ({
      instagram_handle: "operador-tablet",
      experience: "trago",
      prize: e.won_drink ? PRIZE_LABEL : NO_PRIZE_LABEL,
      won_drink: e.won_drink,
      created_at: e.created_at,
    }));
    const { error } = await supabase.from("atena_entries").insert(rows);
    if (!error) writeQueue([]);
  } catch {
    /* seguirá en cola */
  } finally {
    flushing = false;
  }
}
