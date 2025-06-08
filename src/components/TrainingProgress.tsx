import React from "react";
import { Activity, Clock, CheckCircle } from "lucide-react";
import { Card } from "./ui/Card";
import { useGemini } from "../contexts/GeminiContext";
import { motion } from "framer-motion";
import { useSimulatedProgress } from "../hooks/useSimulatedProgress";

export function TrainingProgress() {
  const { state } = useGemini();

  if (!state.currentOperation) {
    return null;
  }

  const actualProgress = state.currentOperation.metadata.completedPercent || 0;
  const isComplete = state.currentOperation.done;
  const progress = useSimulatedProgress(isComplete, actualProgress);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`p-2 rounded-lg ${
            isComplete ? "bg-green-100" : "bg-blue-100"
          }`}
        >
          {isComplete ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-5 h-5 text-blue-600" />
            </motion.div>
          )}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {isComplete ? "Training Complete" : "Training in Progress"}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isComplete ? "bg-green-500" : "bg-blue-500"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isComplete
              ? "Training completed successfully"
              : "This may take several minutes to complete"}
          </motion.span>
        </div>

        {state.currentOperation.metadata.tunedModel && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Model:</strong> {state.currentOperation.metadata.tunedModel}
          </div>
        )}
      </div>
    </Card>
  );
}
