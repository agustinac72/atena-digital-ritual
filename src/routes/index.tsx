import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  INSTAGRAM_URL,
  INSTAGRAM_OPEN_URL,
  INSTAGRAM_HANDLE,
  SEGMENTS,
  LOSE_INDEXES,
  normalizeHandle,
} from "@/lib/atena";
const logo = "/atena-logo-official.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ATENA HOUSE — Universo Atena" },
      {
        name: "description",
        content:
          "Desbloqueá la experiencia ATENA HOUSE: jugá por un trago o participá por una Mesa VIP.",
      },
      { property: "og:title", content: "ATENA HOUSE — Universo Atena" },
      {
        property: "og:description",
        content:
          "Desbloqueá la experiencia ATENA HOUSE: jugá por un trago o participá por una Mesa VIP.",
      },
    ],
  }),
  component: AtenaApp,
});

type Step = 1 | 2 | 3;

function AtenaApp() {
  const [step, setStep] = useState<Step>(1);
  const [handle, setHandle] = useState("");

  return (
    <main className="ritual-bg relative flex min-h-screen flex-col items-center overflow-hidden px-6 pb-16 pt-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 gold-line glow-pulse" />
      <div className="flex w-full max-w-md flex-1 flex-col items-center">
        <Header step={step} />
        {step === 1 && <StepWelcome onNext={() => setStep(2)} />}
        {step === 2 && (
          <StepHandle
            onNext={(value) => {
              setHandle(value);
              setStep(3);
            }}
          />
        )}
        {step === 3 && <StepExperience handle={handle} />}
      </div>
      <footer className="mt-12 text-center text-[0.6rem] uppercase tracking-[0.35em] text-gold/50">
        Powered by Atena House
      </footer>
    </main>
  );
}

function Header({ step }: { step: Step }) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="h-40 w-[80%] overflow-hidden">
        <img
          src={logo}
          alt="Logo oficial de ATENA HOUSE"
          width={900}
          height={490}
          className="h-full w-full scale-[1.35] object-cover"
        />
      </div>
      <div className="mt-6 flex items-center gap-2">
        {[1, 2, 3].map((n) => (
          <span
            key={n}
            className={`h-[2px] w-8 transition-colors duration-500 ${
              n <= step ? "bg-gold" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mt-10 text-center font-display text-2xl leading-tight tracking-[0.15em] text-gold-gradient">
      {children}
    </h1>
  );
}

function Subtitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-xs text-center text-sm font-light leading-relaxed text-muted-foreground">
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
    "w-full rounded-sm px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] transition-all duration-300 disabled:opacity-40";
  const styles =
    variant === "solid"
      ? "bg-gold text-primary-foreground hover:bg-gold-deep hover:shadow-[0_0_30px_-8px_rgba(234,211,146,0.6)]"
      : "border border-gold/50 text-gold hover:border-gold hover:bg-gold/10";
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <section className="rise flex w-full flex-col items-center">
      <Title>BIENVENIDO AL UNIVERSO ATENA</Title>
      <Subtitle>Seguinos en Instagram para desbloquear la experiencia de esta noche.</Subtitle>
      <div className="mt-10 flex w-full flex-col gap-3">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="block">
          <GoldButton>Seguir a {INSTAGRAM_HANDLE}</GoldButton>
        </a>
        <GoldButton variant="outline" onClick={onNext}>
          Ya sigo a Atena
        </GoldButton>
      </div>
    </section>
  );
}

function StepHandle({ onNext }: { onNext: (handle: string) => void }) {
  const [value, setValue] = useState("");
  const clean = normalizeHandle(value);

  return (
    <section className="rise flex w-full flex-col items-center">
      <Title>INGRESA TU USUARIO</Title>
      <Subtitle>Dejanos tu @ de Instagram para continuar.</Subtitle>
      <form
        className="mt-10 flex w-full flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (clean) onNext(clean);
        }}
      >
        <div className="flex items-center gap-2 border-b border-input px-1 py-3 focus-within:border-gold">
          <span className="font-display text-lg text-gold">@</span>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="usuario"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <GoldButton type="submit" disabled={!clean}>
          Continuar
        </GoldButton>
      </form>
    </section>
  );
}

function saveEntry(handle: string, experience: string, wonDrink: boolean, prize?: string | null) {
  supabase
    .from("atena_entries")
    .insert({
      instagram_handle: handle,
      experience,
      prize: prize ?? null,
      won_drink: wonDrink,
    })
    .then(({ error }) => {
      if (error) console.error("No se pudo guardar la entrada", error);
    });
}

type PlayedRecord = { result: "win" | "lose"; prize: string };
const PLAYED_KEY = "atena_house_played";

function getPlayedRecord(): PlayedRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PLAYED_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlayedRecord;
    if (parsed && (parsed.result === "win" || parsed.result === "lose") && parsed.prize) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function setPlayedRecord(result: "win" | "lose", prize: string) {
  try {
    window.localStorage.setItem(PLAYED_KEY, JSON.stringify({ result, prize }));
  } catch {
    /* localStorage no disponible */
  }
}

function StepExperience({ handle }: { handle: string }) {
  const [mode, setMode] = useState<"choose" | "drink" | "vip">("choose");

  if (mode === "drink") return <DrinkGame handle={handle} onBack={() => setMode("choose")} />;
  if (mode === "vip") return <VipCard onBack={() => setMode("choose")} />;

  return (
    <section className="rise flex w-full flex-col items-center">
      <Title>ELEGÍ TU EXPERIENCIA</Title>
      <Subtitle>@{handle}, tu acceso está desbloqueado.</Subtitle>
      <div className="mt-10 flex w-full flex-col gap-4">
        <ExperienceCard
          emoji="🍸"
          title="Jugar y ganar un trago"
          caption="Girá la rueda del destino"
          onClick={() => setMode("drink")}
        />
        <ExperienceCard
          emoji="📸"
          title="Participar por una Mesa VIP"
          caption="Subí tu historia y competí"
          onClick={() => {
            saveEntry(handle, "mesa_vip", false);
            setMode("vip");
          }}
        />
      </div>
    </section>
  );
}

function ExperienceCard({
  emoji,
  title,
  caption,
  onClick,
}: {
  emoji: string;
  title: string;
  caption: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="panel group w-full rounded-sm px-6 py-7 text-left transition-transform duration-300 active:scale-[0.98]"
    >
      <div className="text-2xl">{emoji}</div>
      <h2 className="mt-3 font-display text-base uppercase tracking-[0.18em] text-gold">{title}</h2>
      <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-muted-foreground">
        {caption}
      </p>
    </button>
  );
}

function pick(list: number[]): number {
  return list[Math.floor(Math.random() * list.length)]!;
}

function DrinkGame({ handle, onBack }: { handle: string; onBack: () => void }) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [played, setPlayed] = useState<PlayedRecord | null>(null);

  const segment = 360 / SEGMENTS.length;

  // Al entrar o recargar, verificamos si este dispositivo ya giró la ruleta.
  useEffect(() => {
    setPlayed(getPlayedRecord());
  }, []);

  const spin = async () => {
    if (spinning || result || played) return;
    setSpinning(true);

    // Azar real: se sortea primero el casillero entre los 6 disponibles.
    let index = Math.floor(Math.random() * SEGMENTS.length);
    let won = SEGMENTS[index]!.win;

    // Si salió premio, se valida el cupo global de tragos en la nube.
    if (won) {
      try {
        const { data, error } = await supabase.rpc("claim_drink");
        if (error) throw error;
        won = data === true;
      } catch (err) {
        console.error("No se pudo consultar el cupo de tragos", err);
        won = false;
      }
      // Cupo agotado: la aguja cae en un casillero sin premio.
      if (!won) index = pick(LOSE_INDEXES);
    }

    const jitter = (Math.random() - 0.5) * (segment * 0.6);
    const extraTurns = 5 + Math.floor(Math.random() * 4);
    const target = 360 * extraTurns + (360 - index * segment - segment / 2) + jitter;
    setAngle((prev) => prev + target);

    const prize = won ? "GANASTE UN TRAGO 🍸" : "NOS VEMOS EN LA PISTA 🪩";
    window.setTimeout(() => {
      setSpinning(false);
      setResult(won ? "win" : "lose");
      setPlayedRecord(won ? "win" : "lose", prize);
      setPlayed({ result: won ? "win" : "lose", prize });
      saveEntry(handle, "trago", won, prize);
    }, 4200);
  };

  return (
    <section className="rise flex w-full flex-col items-center">
      <Title>LA RUEDA DE ATENA</Title>
      <Subtitle>Un solo giro. El destino elige tu suerte.</Subtitle>

      <div className="relative mt-12 flex h-[19rem] w-[19rem] max-w-[92vw] items-center justify-center">
        <div className="absolute -top-2 z-10 h-0 w-0 border-x-8 border-t-[14px] border-x-transparent border-t-[color:var(--gold)]" />
        <div
          className="h-full w-full rounded-full border border-gold/40 shadow-[0_0_60px_-20px_rgba(234,211,146,0.7)]"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: "transform 4s cubic-bezier(0.12, 0.75, 0.1, 1)",
            background: `conic-gradient(${SEGMENTS.map((s, i) => {
              const c = s.win ? "oklch(0.35 0.05 80)" : "oklch(0.18 0.015 82)";
              return `${c} ${i * segment}deg ${(i + 1) * segment}deg`;
            }).join(", ")})`,
          }}
        >
          {SEGMENTS.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              className="absolute left-1/2 top-1/2 origin-left"
              style={{ transform: `rotate(${i * segment + segment / 2}deg)` }}
            >
              <span className="ml-6 block w-[6.5rem] text-[0.72rem] font-semibold uppercase leading-[1.15] tracking-[0.02em] text-gold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute h-10 w-10 rounded-full border border-gold/60 bg-background" />
      </div>

      <div className="mt-12 flex w-full flex-col gap-3">
        <GoldButton onClick={spin} disabled={spinning || !!result || !!played}>
          {spinning ? "Girando..." : result || played ? "Ya jugaste" : "Girar la rueda"}
        </GoldButton>
        <GoldButton variant="outline" onClick={onBack}>
          Volver
        </GoldButton>
      </div>

      {result && !played?.result ? null : null}
      {played && !result ? <PlayedCard played={played} onClose={onBack} /> : null}
      {result && <ResultCard result={result} handle={handle} onClose={onBack} />}
    </section>
  );
}

function ResultCard({
  result,
  handle,
  onClose,
}: {
  result: "win" | "lose";
  handle: string;
  onClose: () => void;
}) {
  const won = result === "win";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-6 backdrop-blur-sm">
      <div className="panel rise w-full max-w-sm rounded-sm px-7 py-10 text-center">
        <p className="text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground">
          {won ? "Voucher digital" : "Resultado"}
        </p>
        <div className="mx-auto mt-5 w-16 gold-line" />
        <h2 className="mt-6 font-display text-xl uppercase tracking-[0.14em] text-gold-gradient">
          {won ? "¡Ganaste!" : "Esta vez no"}
        </h2>
        <p className="mt-4 font-display text-xl leading-tight tracking-[0.08em] text-gold">
          {won ? "GANASTE UN TRAGO 🍸" : "NOS VEMOS EN LA PISTA 🪩"}
        </p>
        <p className="mt-4 text-sm font-light text-muted-foreground">
          {won
            ? "Mostrá esta pantalla en la barra y retirá tu trago."
            : "No te quedaste con un trago, pero la noche recién empieza. ¡Nos vemos en la pista!"}
        </p>
        <div className="mx-auto mt-7 w-full border border-dashed border-gold/40 px-4 py-3">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">@{handle}</p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-gold">
            {new Date().toLocaleString("es-AR")}
          </p>
        </div>
        <div className="mt-8">
          <GoldButton variant="outline" onClick={onClose}>
            Cerrar
          </GoldButton>
        </div>
      </div>
    </div>
  );
}

function VipCard({ onBack }: { onBack: () => void }) {
  const steps = [
    "Sacá tu mejor foto esta noche 📸",
    "Subila a tu Historia de Instagram",
    `Etiquetá a ${INSTAGRAM_HANDLE}`,
  ];

  return (
    <section className="rise flex w-full flex-col items-center">
      <Title>MESA VIP</Title>
      <div className="panel mt-8 w-full rounded-sm px-7 py-8">
        <ol className="flex flex-col gap-5">
          {steps.map((text, i) => (
            <li key={text} className="flex items-start gap-4">
              <span className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gold/50 font-display text-xs text-gold">
                {i + 1}
              </span>
              <p className="text-sm font-light leading-relaxed text-foreground">{text}</p>
            </li>
          ))}
        </ol>
        <div className="mx-auto mt-7 w-full gold-line" />
        <p className="mt-5 text-center text-xs font-light leading-relaxed text-muted-foreground">
          Al etiquetarnos ingresás automáticamente al sorteo
        </p>
      </div>
      <div className="mt-8 w-full">
        <a href={INSTAGRAM_OPEN_URL} target="_blank" rel="noopener noreferrer" className="block">
          <GoldButton>Abrir Instagram</GoldButton>
        </a>
      </div>
      <button
        onClick={onBack}
        className="mt-6 text-[0.6rem] uppercase tracking-[0.35em] text-muted-foreground transition-colors hover:text-gold"
      >
        Volver
      </button>
    </section>
  );
}
