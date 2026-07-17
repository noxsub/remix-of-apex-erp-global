import { useEffect, useRef } from "react";

export type FlokiState =
  | "idle"
  | "thinking"
  | "speaking";

type FlokiCoreProps = {
  state?: FlokiState;

  /*
   * Mantido temporariamente para não quebrar as telas antigas.
   * active={true} será interpretado como speaking.
   */
  active?: boolean;

  size?: number;
};

type Particle = {
  angle: number;
  radius: number;
  speed: number;
  phase: number;
  size: number;
  opacity: number;
};

type StateConfiguration = {
  timeSpeed: number;
  pulseStrength: number;
  pulseSpeed: number;
  shadowBlur: number;
  baseGlow: number;
  particleSpeedMultiplier: number;
  particleColor: [number, number, number];
};

const stateConfigurations: Record<
  FlokiState,
  StateConfiguration
> = {
  idle: {
    timeSpeed: 0.012,
    pulseStrength: 0.022,
    pulseSpeed: 1.25,
    shadowBlur: 8,
    baseGlow: 0.3,
    particleSpeedMultiplier: 1,
    particleColor: [210, 210, 210],
  },

  thinking: {
    timeSpeed: 0.024,
    pulseStrength: 0.045,
    pulseSpeed: 2.2,
    shadowBlur: 14,
    baseGlow: 0.58,
    particleSpeedMultiplier: 2.1,
    particleColor: [224, 196, 105],
  },

  speaking: {
    timeSpeed: 0.034,
    pulseStrength: 0.09,
    pulseSpeed: 3.3,
    shadowBlur: 22,
    baseGlow: 0.82,
    particleSpeedMultiplier: 1.5,
    particleColor: [242, 207, 103],
  },
};

export function FlokiCore({
  state,
  active = false,
  size = 420,
}: FlokiCoreProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  /*
   * Se uma tela antiga ainda enviar active,
   * ela continuará funcionando.
   */
  const currentState: FlokiState =
    state ?? (active ? "speaking" : "idle");

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const canvasContext =
      canvas.getContext("2d");

    if (!canvasContext) {
      return;
    }

    const context: CanvasRenderingContext2D =
      canvasContext;

    const pixelRatio =
      window.devicePixelRatio || 1;

    canvas.width = size * pixelRatio;
    canvas.height = size * pixelRatio;

    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    context.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0,
    );

    const center = size / 2;
    const baseRadius = size * 0.28;
    const particleCount = Math.max(
      650,
      Math.round(size * 1.9),
    );

    const particles: Particle[] = Array.from(
      { length: particleCount },
      (_, index) => ({
        angle:
          (index / particleCount) *
          Math.PI *
          2,

        radius:
          baseRadius +
          Math.random() * size * 0.05,

        speed:
          0.0009 +
          Math.random() * 0.0024,

        phase:
          Math.random() * Math.PI * 2,

        size:
          0.55 + Math.random() * 1.45,

        opacity:
          0.45 + Math.random() * 0.45,
      }),
    );

    let animationFrame = 0;
    let time = 0;

    function render() {
      const config =
        stateConfigurations[currentState];

      time += config.timeSpeed;

      context.clearRect(
        0,
        0,
        size,
        size,
      );

      const pulse =
        1 +
        Math.sin(
          time * config.pulseSpeed,
        ) *
          config.pulseStrength;

      const glowOscillation =
        Math.sin(
          time * config.pulseSpeed,
        ) *
        0.16;

      const glow = Math.max(
        0.15,
        config.baseGlow + glowOscillation,
      );

      context.save();

      context.shadowBlur =
        config.shadowBlur;

      context.shadowColor =
        `rgba(212, 175, 55, ${glow})`;

      for (const particle of particles) {
        particle.angle +=
          particle.speed *
          config.particleSpeedMultiplier;

        const primaryWave =
          Math.sin(
            particle.angle * 3 +
              time +
              particle.phase,
          ) *
          size *
          0.024;

        const secondaryWave =
          Math.sin(
            particle.angle * 7 -
              time * 0.85,
          ) *
          size *
          0.011;

        const thinkingTurbulence =
          currentState === "thinking"
            ? Math.sin(
                particle.angle * 12 +
                  time * 2.8 +
                  particle.phase,
              ) *
              size *
              0.008
            : 0;

        const speakingExpansion =
          currentState === "speaking"
            ? Math.max(
                0,
                Math.sin(
                  time *
                    config.pulseSpeed,
                ),
              ) *
              size *
              0.012
            : 0;

        const radius =
          particle.radius * pulse +
          primaryWave +
          secondaryWave +
          thinkingTurbulence +
          speakingExpansion;

        const verticalCompression =
          0.82 +
          Math.sin(
            particle.angle * 2 + time,
          ) *
            0.08;

        const x =
          center +
          Math.cos(particle.angle) *
            radius;

        const y =
          center +
          Math.sin(particle.angle) *
            radius *
            verticalCompression;

        const alphaVariation =
          Math.sin(
            particle.angle * 4 +
              time +
              particle.phase,
          ) * 0.22;

        const alpha = Math.max(
          0.12,
          Math.min(
            0.95,
            particle.opacity +
              alphaVariation,
          ),
        );

        const [red, green, blue] =
          config.particleColor;

        context.beginPath();

        context.arc(
          x,
          y,
          particle.size,
          0,
          Math.PI * 2,
        );

        context.fillStyle =
          `rgba(${red}, ${green}, ${blue}, ${alpha})`;

        context.fill();
      }

      context.restore();

      animationFrame =
        window.requestAnimationFrame(
          render,
        );
    }

    render();

    return () => {
      window.cancelAnimationFrame(
        animationFrame,
      );
    };
  }, [currentState, size]);

  const glowClass =
    currentState === "speaking"
      ? "h-[56%] w-[56%] bg-amber-300/12 blur-3xl"
      : currentState === "thinking"
        ? "h-[49%] w-[49%] bg-amber-300/8 blur-3xl"
        : "h-[42%] w-[42%] bg-white/5 blur-2xl";

  return (
    <div
      data-floki-state={currentState}
      className="relative flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className={`pointer-events-none absolute rounded-full transition-all duration-700 ${glowClass}`}
      />

      <canvas
        ref={canvasRef}
        aria-label={`Núcleo visual do Floki em estado ${currentState}`}
        className="relative z-10 block"
      />
    </div>
  );
}