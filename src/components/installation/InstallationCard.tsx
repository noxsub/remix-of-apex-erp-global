import type { ReactNode } from "react";

import { WizardProgress } from "../syntera/WizardProgress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

type InstallationCardProps = {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  children: ReactNode;
};

export function InstallationCard({
  step,
  totalSteps,
  title,
  description,
  children,
}: InstallationCardProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <WizardProgress
          step={step}
          total={totalSteps}
          title={title}
        />

        <CardTitle className="sr-only">{title}</CardTitle>

        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
}