import { useMemo, useState } from "react";

import type { FlokiActivity } from "./floki-activity";

type UseFlokiPriorityQueueParams = {
  activities: FlokiActivity[];
};

export function useFlokiPriorityQueue({
  activities,
}: UseFlokiPriorityQueueParams) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>(
    [],
  );
  const [postponedIds, setPostponedIds] = useState<string[]>(
    [],
  );

  const availableActivities = useMemo(
    () =>
      activities.filter(
        (activity) =>
          !completedIds.includes(activity.id) &&
          !postponedIds.includes(activity.id),
      ),
    [activities, completedIds, postponedIds],
  );

  const safeIndex =
    availableActivities.length === 0
      ? 0
      : Math.min(
          currentIndex,
          availableActivities.length - 1,
        );

  const currentActivity =
    availableActivities[safeIndex] ?? null;

  const remainingCount = availableActivities.length;

  const completedCount = completedIds.length;

  function completeCurrentActivity() {
    if (!currentActivity) {
      return;
    }

    setCompletedIds((current) => [
      ...current,
      currentActivity.id,
    ]);

    setCurrentIndex(0);
  }

  function postponeCurrentActivity() {
    if (!currentActivity) {
      return;
    }

    setPostponedIds((current) => [
      ...current,
      currentActivity.id,
    ]);

    setCurrentIndex(0);
  }

  function goToNextActivity() {
    if (availableActivities.length <= 1) {
      return;
    }

    setCurrentIndex((current) => {
      const nextIndex = current + 1;

      return nextIndex >= availableActivities.length
        ? 0
        : nextIndex;
    });
  }

  function restartQueue() {
    setCurrentIndex(0);
    setCompletedIds([]);
    setPostponedIds([]);
  }

  return {
    currentActivity,
    remainingCount,
    completedCount,
    hasActivities: remainingCount > 0,
    completeCurrentActivity,
    postponeCurrentActivity,
    goToNextActivity,
    restartQueue,
  };
}