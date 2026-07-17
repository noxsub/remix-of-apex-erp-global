import type { FlokiActivity } from "./floki-activity";
import type { FlokiActivityArea } from "./floki-activity";

import { Card } from "@/components/ui/card";

type AreaVisualConfig = {
  label: string;
  accent: string;
  border: string;
};

type FlokiActivityCardProps = {
  activity: FlokiActivity;
  areaConfig: Record<FlokiActivityArea, AreaVisualConfig>;
  onClick: () => void;
};

export function FlokiActivityCard({
  activity,
  areaConfig,
  onClick,
}: FlokiActivityCardProps) {
  const config = areaConfig[activity.area];

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-[72%] top-[22%] z-20 w-72 origin-left animate-in fade-in zoom-in-75 slide-in-from-left-5 duration-500"
    >
      <Card
        className={`bg-background/95 p-5 text-left shadow-2xl backdrop-blur-xl transition hover:scale-[1.03] ${config.border}`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-[0.22em] ${config.accent}`}
        >
          {config.label}
        </p>

        <h2 className="mt-3 text-base font-semibold text-foreground">
          {activity.title}
        </h2>

        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          {activity.summary}
        </p>

        <div
          className={`mt-4 text-xs font-semibold ${config.accent}`}
        >
          Puxar atividade para perto →
        </div>
      </Card>
    </button>
  );
}