import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEGMENTS, LOSE_INDEXES, PRIZE_LABEL, NO_PRIZE_LABEL } from "@/lib/atena";

const logo = "/atena-logo-official.png";
const MAX_DRINKS = 50;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATENA HOUSE — La Rueda de Atena" },
      {
        name: "description",
        content:
          "Girá la Rueda de Atena en el evento y descubrí si ganás un trago. Experiencia interactiva de ATENA HOUSE.",
      },
      { property: "og:title", content: "ATENA HOUSE — La Rueda de Atena" },
      {
        property: "og:description",
        content:
          "Girá la Rueda de Atena en el evento y descubrí si ganás un trago. Experiencia interactiva de ATENA HOUSE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AtenaApp,
});

type Screen = "welcome" | "wheel";

function AtenaApp() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [given, setGiven] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const refreshCounter = useCallback(async () => {
    const { data, error } = await supabase
      .from("prizes_counter")
      .select("total_drinks_given")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data) setGiven(data.total_drinks_given ?? 0);
  }, []);

  useEffect(() => {
    void refreshCounter();
  }, [refreshCounter]);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => setFullscreen(true));
    setFullscreen((v) => !v);
  }, []);

  return (
    <main className="ritual-bg relative flex min-h-[100dvh] flex-col items-center overflow-hidden px-6 pb-32 pt-6 md:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 gold-line glow-pulse" />
      <div className="club-beams" aria-hidden />
      <AmbientDust />
      <div className="relative flex w-full max-w-5xl flex-1 flex-col items-center justify-center">
        <Logo compact={fullscreen && screen === "wheel"} />
        {screen === "welcome" ? (
          <WelcomeScreen onStart={() => setScreen("wheel")} />
        ) : (
          <WheelScreen
            given={given}
            setGiven={setGiven}
            onNextParticipant={() => setScreen("welcome")}
          />
        )}
      </div>
      <OperatorBar
        given={given}
        onReset={refreshCounter}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
      />
    </main>
  );
}

const DUST = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: 2 + (i % 3),
  delay: `${(i % 9) * 1.1}s`,
  duration: `${8 + (i % 5) * 1.6}s`,
}));

function AmbientDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {DUST.map((d, i) => (
        <span
          key={i}
          className="dust-particle"
          style={{
            left: d.left,
            bottom: "-10px",
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
    </div>
  );
}

function Logo({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`logo-glow mx-auto w-[92%] overflow-hidden transition-all duration-500 ${
        compact ? "max-h-[14vh] max-w-[20rem]" : "max-h-[30vh] max-w-[32rem] md:max-w-[44rem]"
      }`}
    >
      <img
        src={logo}
        alt="Logo oficial de ATENA HOUSE"
        width={900}
        height={490}
        className="h-full w-full scale-[1.18] object-contain"
      />
    </div>
  );
}


function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mt-6 text-center font-display text-2xl leading-tight tracking-[0.15em] text-gold-gradient drop-shadow-[0_0_22px_rgba(234,211,146,0.35)] sm:text-3xl md:text-5xl">
      {children}
    </h1>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-2xl text-center text-sm font-light leading-relaxed text-muted-foreground sm:text-base md:text-xl">
      {children}
    </p>
  );
}


function GoldButton({
  children,
  onClick,
  variant = "solid",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "solid" | "outline";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const base =
    "w-full rounded-sm px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 disabled:opacity-40 sm:text-sm md:py-6 md:text-base";
  const styles =
    variant === "solid"
      ? "bg-gold text-primary-foreground shadow-[0_0_30px_-12px_rgba(234,211,146,0.8)] hover:bg-gold-deep hover:shadow-[0_0_44px_-8px_rgba(234,211,146,0.8)]"
      : "border border-gold/50 text-gold hover:border-gold hover:bg-gold/10";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function DestinyButton({ onStart }: { onStart: () => void }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="btn-destiny w-full px-8 py-5 font-display text-sm font-bold uppercase tracking-[0.32em] sm:text-base md:py-8 md:text-2xl"
    >
      Revelá tu destino
    </button>
  );
}

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="rise flex w-full max-w-md flex-col items-center md:max-w-2xl">
      <Title>BIENVENIDO AL UNIVERSO ATENA</Title>
      <Subtitle>Dejá que la sabiduría de Atena guíe tu suerte.</Subtitle>
      <div className="mt-10 w-full md:mt-14">
        <DestinyButton onStart={onStart} />
      </div>
    </section>
  );
}


function saveEntry(wonDrink: boolean) {
  supabase
    .from("atena_entries")
    .insert({
      instagram_handle: "operador-tablet",
      experience: "trago",
      prize: wonDrink ? PRIZE_LABEL : NO_PRIZE_LABEL,
      won_drink: wonDrink,
    })
    .then(({ error }) => {
      if (error) console.error("No se pudo guardar la entrada", error);
    });
}

function pick(list: number[]): number {
  return list[Math.floor(Math.random() * list.length)]!;
}

function WheelScreen({
  given,
  setGiven,
  onNextParticipant,
}: {
  given: number;
  setGiven: (n: number) => void;
  onNextParticipant: () => void;
}) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);

  const segment = 360 / SEGMENTS.length;

  const spin = async () => {
    if (spinning || result) return;
    setSpinning(true);

    // Azar real entre los 6 casilleros.
    let index = Math.floor(Math.random() * SEGMENTS.length);
    let won = SEGMENTS[index]!.win;

    // Si salió premio, se valida el cupo global de 50 tragos en la nube.
    if (won) {
      try {
        const { data, error } = await supabase.rpc("claim_drink");
        if (error) throw error;
        won = data === true;
      } catch (err) {
        console.error("No se pudo consultar el cupo de tragos", err);
        won = false;
      }
      if (!won) index = pick(LOSE_INDEXES);
      else setGiven(Math.min(given + 1, MAX_DRINKS));
    }

    // La aguja (arriba) queda exactamente en el centro del sector elegido.
    const extraTurns = 5 + Math.floor(Math.random() * 4);
    const current = angle;
    const centerOffset = 360 - (index * segment + segment / 2);
    const target =
      current + 360 * extraTurns + ((centerOffset - (current % 360)) % 360);
    setAngle(target);

    window.setTimeout(() => {
      setSpinning(false);
      setResult(won ? "win" : "lose");
      saveEntry(won);
    }, 4200);
  };

  return (
    <section className="rise flex w-full flex-col items-center">
      <Title>LA RUEDA DE ATENA</Title>
      <Subtitle>Un solo giro. El destino elige tu suerte.</Subtitle>

      <div className="relative mt-6 flex aspect-square w-[min(88vw,52vh,22rem)] items-center justify-center md:w-[min(80vw,62vh,34rem)]">
        <div className="orbit-slow pointer-events-none absolute -inset-5 rounded-full border border-dashed border-gold/25" />
        <div className="ring-sweep pointer-events-none absolute -inset-3 rounded-full" />
        {[
          "top-0 left-1/2 -translate-x-1/2",
          "top-1/2 left-0 -translate-y-1/2",
          "top-1/2 right-0 -translate-y-1/2",
          "bottom-0 left-1/2 -translate-x-1/2",
        ].map((pos, i) => (
          <span
            key={pos}
            className={`sparkle pointer-events-none absolute ${pos} h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_3px_rgba(234,211,146,0.75)]`}
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
        <div className="absolute -top-3 z-10 h-0 w-0 border-x-[12px] border-t-[22px] border-x-transparent border-t-[color:var(--gold)] drop-shadow-[0_0_12px_rgba(234,211,146,0.9)] md:-top-4 md:border-x-[16px] md:border-t-[28px]" />
        <div
          className={`wheel-halo relative h-full w-full rounded-full border-2 border-gold/60 ${spinning ? "wheel-glow-active" : ""}`}
          style={{
            transform: `rotate(${angle}deg)`,
            transition: "transform 4s cubic-bezier(0.12, 0.75, 0.1, 1)",
            background: `conic-gradient(${SEGMENTS.map((s, i) => {
              const c = s.win ? "oklch(0.42 0.06 80)" : "oklch(0.15 0.012 82)";
              return `${c} ${i * segment}deg ${(i + 1) * segment}deg`;
            }).join(", ")})`,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 22%, oklch(1 0 0 / 0.16), transparent 45%), radial-gradient(circle at 70% 85%, oklch(0 0 0 / 0.45), transparent 55%)",
            }}
          />
          {SEGMENTS.map((s, i) => {
            const a = i * segment + segment / 2;
            const flip = a > 90 && a < 270 ? 180 : 0;
            return (
              <div
                key={`${s.label}-${i}`}
                className="absolute bottom-1/2 left-1/2 h-1/2 w-0 origin-bottom"
                style={{ transform: `rotate(${a}deg)` }}
              >
                <span
                  className="absolute left-1/2 top-[20%] block w-[7rem] text-center text-[0.9rem] font-bold uppercase leading-[1.15] tracking-[0.02em] text-gold drop-shadow-[0_1px_3px_rgba(0,0,0,1)] md:w-[10rem] md:text-[1.25rem]"
                  style={{ transform: `translate(-50%, -50%) rotate(${flip}deg)` }}
                >
                  {s.label}
                </span>
              </div>

            );
          })}

        </div>
        <div className="absolute h-12 w-12 rounded-full border-2 border-gold/70 bg-background shadow-[0_0_25px_-4px_rgba(234,211,146,0.8)] md:h-16 md:w-16" />
      </div>

      <div className="mt-8 w-full max-w-md md:max-w-xl">
        <GoldButton onClick={spin} disabled={spinning || !!result}>
          {spinning ? "Girando..." : "Girar"}

        </GoldButton>
      </div>

      {result && <ResultModal result={result} onNext={onNextParticipant} />}
    </section>
  );
}

const BURST_PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const dist = 90 + (i % 3) * 35;
  return {
    dx: `${Math.cos(angle) * dist}px`,
    dy: `${Math.sin(angle) * dist}px`,
    delay: `${(i % 4) * 0.06}s`,
    size: 5 + (i % 3) * 2,
  };
});

function WinBurst() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {BURST_PARTICLES.map((p, i) => (
        <span
          key={i}
          className="burst-particle absolute rounded-full bg-gold shadow-[0_0_8px_2px_rgba(234,211,146,0.8)]"
          style={
            {
              width: p.size,
              height: p.size,
              "--dx": p.dx,
              "--dy": p.dy,
              animationDelay: p.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function ResultModal({ result, onNext }: { result: "win" | "lose"; onNext: () => void }) {
  const won = result === "win";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 px-6 backdrop-blur-sm">
      {won && <WinBurst />}
      <div className="panel pop-in w-full max-w-sm rounded-sm px-7 py-10 text-center">
        <p className="text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground">
          {won ? "Voucher digital" : "Resultado"}
        </p>
        <div className="mx-auto mt-5 w-16 gold-line" />
        <h2 className="mt-6 font-display text-xl uppercase tracking-[0.14em] text-gold-gradient">
          {won ? "¡Ganaste!" : "Esta vez no"}
        </h2>
        <p className="mt-4 font-display text-xl leading-tight tracking-[0.08em] text-gold">
          {won ? PRIZE_LABEL : NO_PRIZE_LABEL}
        </p>
        {!won && (
          <p className="mt-4 text-sm font-light text-muted-foreground">
            La noche recién empieza. ¡Nos vemos en la pista!
          </p>
        )}
        <div className="mt-8">
          <GoldButton onClick={onNext}>Siguiente participante</GoldButton>
        </div>
      </div>
    </div>
  );
}

function OperatorBar({
  given,
  onReset,
  fullscreen,
  onToggleFullscreen,
}: {
  given: number;
  onReset: () => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const [open, setOpen] = useState(false);
  const soldOut = given >= MAX_DRINKS;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 flex items-end justify-between gap-3 px-4 pb-3">
        <button
          onClick={() => setOpen(true)}
          className={`pointer-events-auto text-[0.55rem] uppercase tracking-[0.3em] text-gold/25 transition-colors hover:text-gold/70 ${fullscreen ? "opacity-0" : ""}`}
          aria-label="Reiniciar juego"
        >
          ⟲
        </button>
        <p
          className={`text-[0.6rem] uppercase tracking-[0.28em] transition-colors sm:text-[0.7rem] ${
            fullscreen ? "opacity-0" : soldOut ? "font-semibold text-[#e0574f]" : "text-gold/45"
          }`}
        >
          {soldOut
            ? `Stock de tragos agotado (${MAX_DRINKS}/${MAX_DRINKS})`
            : `Tragos entregados: ${given} / ${MAX_DRINKS}`}
        </p>
        <button
          onClick={onToggleFullscreen}
          className="pointer-events-auto rounded-sm border border-gold/40 px-3 py-1.5 text-[0.55rem] uppercase tracking-[0.28em] text-gold/70 transition-colors hover:border-gold hover:bg-gold/10 hover:text-gold sm:text-[0.65rem]"
        >
          {fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        </button>
      </div>
      {!fullscreen && (
        <span className="pointer-events-none fixed inset-x-0 bottom-10 text-center text-[0.55rem] uppercase tracking-[0.3em] text-gold/30">
          Powered by Atena House
        </span>
      )}

      {open && <ResetDialog onClose={() => setOpen(false)} onDone={onReset} />}
    </>
  );
}

function ResetDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const doReset = async () => {
    setBusy(true);
    setMsg(null);
    const { error } = await supabase.rpc("reset_roulette", { p_code: code.trim() });
    setBusy(false);
    if (error) {
      setMsg("Código incorrecto. No se reinició nada.");
      return;
    }
    onDone();
    setMsg("Listo: contador en 0 y datos de prueba borrados.");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 px-6 backdrop-blur-sm">
      <div className="panel rise w-full max-w-sm rounded-sm px-7 py-9 text-center">
        <h2 className="font-display text-lg uppercase tracking-[0.14em] text-gold-gradient">
          Reiniciar el juego
        </h2>
        <p className="mt-4 text-xs font-light leading-relaxed text-muted-foreground">
          Esto vuelve el contador de tragos a 0 y borra los registros de prueba. Ingresá el código
          de operador para confirmar.
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de operador"
          autoCapitalize="characters"
          autoCorrect="off"
          className="mt-6 w-full border-b border-input bg-transparent px-1 py-3 text-center text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-gold"
        />
        {msg && <p className="mt-4 text-xs font-light text-gold">{msg}</p>}
        <div className="mt-7 flex flex-col gap-3">
          <GoldButton onClick={doReset} disabled={busy || !code.trim()}>
            {busy ? "Reiniciando..." : "Confirmar reinicio"}
          </GoldButton>
          <GoldButton variant="outline" onClick={onClose}>
            Cancelar
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
