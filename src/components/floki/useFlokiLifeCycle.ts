import { useEffect, useState } from "react";

import type { FlokiState } from "./FlokiCore";

type UseFlokiLifeCycleParams = {
  enabled: boolean;
  hasActivity: boolean;
};

export function useFlokiLifeCycle({
  enabled,
  hasActivity,
}: UseFlokiLifeCycleParams) {
  const [state, setState] =
    useState<FlokiState>("idle");

  const [showActivity, setShowActivity] =
    useState(false);

  useEffect(() => {
    setState("idle");
    setShowActivity(false);

    if (!enabled) {
      return;
    }

    const thinkingTimer = window.setTimeout(() => {
      setState("thinking");
    }, 700);

    const speakingTimer = window.setTimeout(() => {
      setState(
        hasActivity ? "speaking" : "idle",
      );
    }, 1900);

    const activityTimer = window.setTimeout(() => {
      if (hasActivity) {
        setShowActivity(true);
      }
    }, 2500);

    const idleTimer = window.setTimeout(() => {
      setState("idle");
    }, 3900);

    return () => {
      window.clearTimeout(thinkingTimer);
      window.clearTimeout(speakingTimer);
      window.clearTimeout(activityTimer);
      window.clearTimeout(idleTimer);
    };
  }, [enabled, hasActivity]);

  function restart() {
    setState("thinking");
    setShowActivity(false);

    window.setTimeout(() => {
      setState(
        hasActivity ? "speaking" : "idle",
      );
    }, 850);

    window.setTimeout(() => {
      if (hasActivity) {
        setShowActivity(true);
      }
    }, 1450);

    window.setTimeout(() => {
      setState("idle");
    }, 2800);
  }

  function reset() {
    setState("idle");
    setShowActivity(false);
  }

  return {
    state,
    showActivity,
    restart,
    reset,
  };
}