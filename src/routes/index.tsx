import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { INSTAGRAM_URL, PRIZES, normalizeHandle, type Prize } from "@/lib/atena";
import logo from "@/assets/atena-logo.png";

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
      <footer className="mt-12 text-[0.6rem] uppercase tracking-[0.4em] text-muted-foreground">
        Atena House · Ritual Digital
      </footer>
    </main>
  );
}

function Header({ step }: { step: Step }) {
  return (
    <div className="flex flex-col items-center">
      <img
        src={logo}
        alt="Isotipo de ATENA HOUSE"
        width={816}
        height={816}
        className="h-28 w-28 object-contain drop-shadow-[0_0_25px_rgba(234,211,146,0.25)]"
      />
      <p className="mt-3 font-display text-lg tracking-[0.55em] text-gold">ATENA</p>
      <p className="text-[0.55rem] tracking-[0.7em] text-muted-foreground">HOUSE</p>
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
          <GoldButton>Seguir a @atena</GoldButton>
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

function StepExperience({ handle }: { handle: string }) {
  const [mode, setMode] = useState<"choose" | "drink" | "vip">("choose");

  const save = (experience: string, prize?: string) => {
    supabase
      .from("atena_entries")
      .insert({ instagram_handle: handle, experience, prize: prize ?? null })
      .then(({ error }) => {
        if (error) console.error("No se pudo guardar la entrada", error);
      });

  };

  if (mode === "drink") return <DrinkGame handle={handle} onBack={() => setMode("choose")} onWin={save} />;
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
            save("mesa_vip");
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

function DrinkGame({
  handle,
  onBack,
  onWin,
}: {
  handle: string;
  onBack: () => void;
  onWin: (experience: string, prize: string) => void;
}) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<Prize | null>(null);

  const segment = 360 / PRIZES.length;

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    const index = Math.floor(Math.random() * PRIZES.length);
    const target = 360 * 6 + (360 - index * segment - segment / 2);
    setAngle((prev) => prev + target);
    window.setTimeout(() => {
      setSpinning(false);
      const won = PRIZES[index]!;
      setPrize(won);
      onWin("trago", won.title);
    }, 4200);
  };

  return (
    <section className="rise flex w-full flex-col items-center">
      <Title>LA RUEDA DE ATENA</Title>
      <Subtitle>Un solo giro. El destino elige tu trago.</Subtitle>

      <div className="relative mt-12 flex h-64 w-64 items-center justify-center">
        <div className="absolute -top-2 z-10 h-0 w-0 border-x-8 border-t-[14px] border-x-transparent border-t-[color:var(--gold)]" />
        <div
          className="h-64 w-64 rounded-full border border-gold/40 shadow-[0_0_60px_-20px_rgba(234,211,146,0.7)]"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: "transform 4s cubic-bezier(0.12, 0.75, 0.1, 1)",
            background: `conic-gradient(${PRIZES.map((_, i) => {
              const c = i % 2 === 0 ? "oklch(0.22 0.02 82)" : "oklch(0.35 0.05 80)";
              return `${c} ${i * segment}deg ${(i + 1) * segment}deg`;
            }).join(", ")})`,
          }}
        >
          {PRIZES.map((p, i) => (
            <div
              key={p.title}
              className="absolute left-1/2 top-1/2 origin-left"
              style={{ transform: `rotate(${i * segment + segment / 2}deg)` }}
            >
              <span className="ml-6 block w-24 text-[0.5rem] uppercase tracking-[0.12em] text-gold">
                {p.title}
              </span>
            </div>
          ))}
        </div>
        <div className="absolute h-10 w-10 rounded-full border border-gold/60 bg-background" />
      </div>

      <div className="mt-12 flex w-full flex-col gap-3">
        <GoldButton onClick={spin} disabled={spinning || !!prize}>
          {spinning ? "Girando..." : prize ? "Ya jugaste" : "Girar la rueda"}
        </GoldButton>
        <GoldButton variant="outline" onClick={onBack}>
          Volver
        </GoldButton>
      </div>

      {prize && <Voucher prize={prize} handle={handle} onClose={() => onBack()} />}
    </section>
  );
}

function Voucher({
  prize,
  handle,
  onClose,
}: {
  prize: Prize;
  handle: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 px-6 backdrop-blur-sm">
      <div className="panel rise w-full max-w-sm rounded-sm px-7 py-10 text-center">
        <p className="text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground">
          Voucher digital
        </p>
        <div className="mx-auto mt-5 w-16 gold-line" />
        <h2 className="mt-6 font-display text-xl uppercase tracking-[0.14em] text-gold-gradient">
          ¡Ganaste!
        </h2>
        <p className="mt-4 font-display text-2xl tracking-[0.1em] text-gold">{prize.title}</p>
        <p className="mt-4 text-sm font-light text-muted-foreground">{prize.detail}</p>
        <div className="mx-auto mt-7 w-full border border-dashed border-gold/40 px-4 py-3">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">
            @{handle}
          </p>
          <p className="mt-1 text-[0.6rem] uppercase tracking-[0.2em] text-gold">
            {new Date().toLocaleString("es-AR")}
          </p>
        </div>
        <p className="mt-5 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
          Mostrá esta pantalla en la barra
        </p>
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
  return (
    <section className="rise flex w-full flex-col items-center">
      <Title>MESA VIP</Title>
      <div className="panel mt-8 w-full rounded-sm px-7 py-8 text-center">
        <div className="text-3xl">📸</div>
        <p className="mt-5 text-sm font-light leading-relaxed text-muted-foreground">
          Sacá tu mejor foto esta noche 📸, subila a tu historia de Instagram etiquetando a{" "}
          <span className="text-gold">@atena.house</span> y participá por una Mesa VIP para 4
          personas en la próxima edición.
        </p>
      </div>
      <div className="mt-8 flex w-full flex-col gap-3">
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="block">
          <GoldButton>Abrir Instagram para subir story</GoldButton>
        </a>
        <GoldButton variant="outline" onClick={onBack}>
          Volver
        </GoldButton>
      </div>
    </section>
  );
}
