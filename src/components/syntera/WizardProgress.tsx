type WizardProgressProps = {
  step: number;
  total: number;
  title: string;
};

export function WizardProgress({
  step,
  total,
  title,
}: WizardProgressProps) {
  const percentage = (step / total) * 100;

  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-primary">
          Etapa {step} de {total}
        </span>

        <span className="text-sm text-muted-foreground">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <h2 className="text-lg font-semibold">
        {title}
      </h2>
    </div>
  );
}