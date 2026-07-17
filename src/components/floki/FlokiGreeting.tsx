type FlokiGreetingProps = {
  greeting: string;
  introduction?: string;
  transition?: string;
  visibleStep: number;
};

export function FlokiGreeting({
  greeting,
  introduction,
  transition,
  visibleStep,
}: FlokiGreetingProps) {
  return (
    <div className="max-w-xl">
      <p
        className={`text-xs font-semibold uppercase tracking-[0.35em] text-primary transition-all duration-500 ${
          visibleStep >= 1
            ? "translate-y-0 opacity-100"
            : "translate-y-2 opacity-0"
        }`}
      >
        Floki
      </p>

      <h1
        className={`mt-4 text-4xl font-semibold tracking-tight text-slate-100 transition-all duration-700 ${
          visibleStep >= 1
            ? "translate-y-0 opacity-100"
            : "translate-y-3 opacity-0"
        }`}
      >
        {greeting}
      </h1>

      {introduction && (
        <p
          className={`mt-4 text-base leading-7 text-slate-400 transition-all duration-700 ${
            visibleStep >= 2
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          {introduction}
        </p>
      )}

      {transition && (
        <p
          className={`mt-3 text-sm font-medium text-slate-300 transition-all duration-700 ${
            visibleStep >= 3
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
          }`}
        >
          {transition}
        </p>
      )}
    </div>
  );
}