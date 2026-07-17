import type { FlokiActivity } from "../floki-activity";

export type ModuleHealthStatus =
  | "EXCELENTE"
  | "BOM"
  | "ATENCAO"
  | "CRITICO";

export type ModuleHealth = {
  module: string;

  score: number;

  status: ModuleHealthStatus;

  critical: number;

  warning: number;

  info: number;

  activities: FlokiActivity[];
};