import { useEffect, useState } from "react";

type UseFlokiTimelineParams = {
  enabled: boolean;
  activityCount: number;
};

export function useFlokiTimeline({
  enabled,
  activityCount,
}: UseFlokiTimelineParams) {
  const [visibleStep, setVisibleStep] = useState(0);
  const [active, setActive] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  useEffect(() => {
    setVisibleStep(0);
    setActive(false);
    setShowActivity(false);

    if (!enabled) {
      return;
    }

    const timers = [
      window.setTimeout(() => {
        setVisibleStep(1);
      }, 300),

      window.setTimeout(() => {
        setVisibleStep(2);
      }, 1400),

      window.setTimeout(() => {
        setVisibleStep(3);
      }, 2600),

      window.setTimeout(() => {
        if (activityCount > 0) {
          setActive(true);
        }
      }, 3600),

      window.setTimeout(() => {
        if (activityCount > 0) {
          setShowActivity(true);
        }
      }, 4300),
    ];

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, [activityCount, enabled]);

  function resetTimeline() {
    setVisibleStep(0);
    setActive(false);
    setShowActivity(false);
  }

  function stopAlert() {
    setActive(false);
    setShowActivity(false);
  }

  function showAlert() {
    if (activityCount === 0) {
      return;
    }

    setActive(true);
    setShowActivity(true);
  }

  return {
    visibleStep,
    active,
    showActivity,
    resetTimeline,
    stopAlert,
    showAlert,
  };
}