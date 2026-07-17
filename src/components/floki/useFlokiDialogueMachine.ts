import { useEffect, useState } from "react";

import type { FlokiState } from "./FlokiCore";

export type FlokiDialogueStage =
  | "idle"
  | "greeting"
  | "thinking"
  | "speaking"
  | "showing-activity"
  | "waiting";

type UseFlokiDialogueMachineParams = {
  userName: string;
  activityCount: number;
  enabled: boolean;
};

export function useFlokiDialogueMachine({
  userName,
  activityCount,
  enabled,
}: UseFlokiDialogueMachineParams) {
  const [stage, setStage] =
    useState<FlokiDialogueStage>("idle");

  const [flokiState, setFlokiState] =
    useState<FlokiState>("idle");

  const [message, setMessage] = useState("");
  const [showActivity, setShowActivity] =
    useState(false);

  useEffect(() => {
    if (!enabled) {
      setStage("idle");
      setFlokiState("idle");
      setMessage("");
      setShowActivity(false);

      return;
    }

    setStage("greeting");
    setFlokiState("idle");
    setMessage(`Certo, ${userName}.`);
    setShowActivity(false);

    const thinkingTimer = window.setTimeout(() => {
      setStage("thinking");
      setFlokiState("thinking");
      setMessage(
        "Estou analisando suas prioridades por impacto e urgência.",
      );
    }, 900);

    const speakingTimer = window.setTimeout(() => {
      setStage("speaking");
      setFlokiState("speaking");

      setMessage(
        activityCount > 0
          ? `Encontrei ${activityCount} ${
              activityCount === 1
                ? "prioridade"
                : "prioridades"
            }. Vou começar pela mais importante.`
          : "Não encontrei nenhuma prioridade pendente neste momento.",
      );
    }, 2300);

    const activityTimer = window.setTimeout(() => {
      if (activityCount > 0) {
        setStage("showing-activity");
        setShowActivity(true);
        setMessage(
          "Esta é a primeira atividade que merece sua atenção.",
        );
      } else {
        setStage("waiting");
      }

      setFlokiState("idle");
    }, 3900);

    return () => {
      window.clearTimeout(thinkingTimer);
      window.clearTimeout(speakingTimer);
      window.clearTimeout(activityTimer);
    };
  }, [activityCount, enabled, userName]);

  function reset() {
    setStage("idle");
    setFlokiState("idle");
    setMessage("");
    setShowActivity(false);
  }

  function prepareNextActivity() {
    setStage("thinking");
    setFlokiState("thinking");
    setMessage("Organizando a próxima prioridade.");
    setShowActivity(false);

    window.setTimeout(() => {
      setStage("speaking");
      setFlokiState("speaking");
      setMessage("Encontrei a próxima atividade.");
    }, 850);

    window.setTimeout(() => {
      setStage("showing-activity");
      setFlokiState("idle");
      setMessage(
        "Esta é a próxima atividade da sua fila.",
      );
      setShowActivity(true);
    }, 1600);
  }

  return {
    stage,
    flokiState,
    message,
    showActivity,
    reset,
    prepareNextActivity,
  };
}