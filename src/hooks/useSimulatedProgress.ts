import { useState, useEffect } from "react";

const PROGRESS_STAGES = [
  { target: 15, speed: 0.8 }, // Initial quick progress
  { target: 35, speed: 0.4 }, // Slower during data processing
  { target: 65, speed: 0.2 }, // Very slow during main training
  { target: 85, speed: 0.3 }, // Picking up during fine-tuning
  { target: 95, speed: 0.1 }, // Final optimization phase
];

export function useSimulatedProgress(
  isComplete: boolean,
  actualProgress: number
) {
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    if (isComplete) {
      setSimulatedProgress(100);
      return;
    }

    // Use the actual progress as baseline if higher
    const baseProgress = Math.max(actualProgress, simulatedProgress);

    const getCurrentStage = (progress: number) => {
      return (
        PROGRESS_STAGES.find((stage) => progress < stage.target) ||
        PROGRESS_STAGES[PROGRESS_STAGES.length - 1]
      );
    };

    const interval = setInterval(() => {
      setSimulatedProgress((current) => {
        const stage = getCurrentStage(current);

        // Add some randomness to the increment
        const variance = Math.random() * 0.3;
        const increment = stage.speed * (1 + variance);

        // Add small chance of brief plateau
        if (Math.random() < 0.1) return current;

        // Progress towards current stage target
        return Math.min(current + increment, stage.target);
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isComplete, actualProgress]);

  return isComplete ? 100 : simulatedProgress;
}
