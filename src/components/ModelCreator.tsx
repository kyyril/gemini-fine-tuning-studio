import React, { useState, useEffect } from "react";
import { Brain, Settings, Info } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useGemini } from "../contexts/GeminiContext";
import { useGeminiApi } from "../hooks/useGeminiApi";
import { Switch } from "./ui/Switch";

const HYPERPARAMETER_CONSTRAINTS = {
  batchSize: { min: 4, max: 64 },
  learningRate: { min: 0.0001, max: 0.01 },
  epochCount: { min: 1, max: 100 },
} as const;

const calculateHyperparameters = (trainingDataLength: number) => {
  // Dynamic batch size: now respecting Google's constraints (4-64)
  const batchSize = Math.min(
    Math.max(
      Math.floor(trainingDataLength / 8),
      HYPERPARAMETER_CONSTRAINTS.batchSize.min
    ),
    HYPERPARAMETER_CONSTRAINTS.batchSize.max
  );

  // Learning rate calculation based on dataset size
  const learningRate =
    trainingDataLength < 20
      ? 0.001 // Higher learning rate for small datasets
      : trainingDataLength < 50
      ? 0.0005 // Medium datasets
      : 0.0002; // Large datasets

  // Smarter epoch count calculation
  const epochCount =
    trainingDataLength < 20
      ? 8 // More epochs for small datasets
      : trainingDataLength < 50
      ? 5 // Balanced for medium datasets
      : 3; // Fewer epochs for large datasets to prevent overfitting

  return {
    batchSize,
    learningRate,
    epochCount,
    message: getRecommendationMessage(trainingDataLength),
    warnings: getWarnings(trainingDataLength),
  };
};

const getWarnings = (dataLength: number): string[] => {
  const warnings = [];

  if (dataLength < 10) {
    warnings.push(
      "Very small dataset may lead to overfitting. Consider adding more examples."
    );
  }
  if (dataLength > 1000) {
    warnings.push("Large dataset detected. Training may take longer.");
  }

  return warnings;
};

const getRecommendationMessage = (dataLength: number): string => {
  if (dataLength < 10) {
    return "Small dataset detected. Using conservative settings with higher epochs to compensate.";
  } else if (dataLength < 50) {
    return "Medium dataset detected. Using balanced settings for optimal learning.";
  } else if (dataLength < 200) {
    return "Good dataset size. Using optimized settings for efficient training.";
  } else {
    return "Large dataset detected. Using settings optimized for scalability.";
  }
};

export function ModelCreator() {
  const { state } = useGemini();
  const { createModel } = useGeminiApi();
  const [displayName, setDisplayName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useAutoSettings, setUseAutoSettings] = useState(true);

  // Add inside ModelCreator component
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Calculate recommended values based on training data
  const recommendedSettings = calculateHyperparameters(
    state.trainingData.length
  );

  const [hyperparameters, setHyperparameters] = useState({
    batchSize: recommendedSettings.batchSize,
    learningRate: recommendedSettings.learningRate,
    epochCount: recommendedSettings.epochCount,
  });

  // Update hyperparameters when training data changes and auto settings is enabled
  useEffect(() => {
    if (useAutoSettings) {
      const newSettings = calculateHyperparameters(state.trainingData.length);
      setHyperparameters({
        batchSize: newSettings.batchSize,
        learningRate: newSettings.learningRate,
        epochCount: newSettings.epochCount,
      });
    }
  }, [state.trainingData.length, useAutoSettings]);

  const handleCreateModel = () => {
    createModel(
      displayName,
      hyperparameters.batchSize,
      hyperparameters.learningRate,
      hyperparameters.epochCount
    );
    setDisplayName("");
  };

  const handleApplyRecommendations = () => {
    setHyperparameters(recommendedSettings);
  };

  const validateHyperparameters = (
    params: typeof hyperparameters
  ): string[] => {
    const errors: string[] = [];

    if (
      params.batchSize < HYPERPARAMETER_CONSTRAINTS.batchSize.min ||
      params.batchSize > HYPERPARAMETER_CONSTRAINTS.batchSize.max
    ) {
      errors.push(
        `Batch size must be between ${HYPERPARAMETER_CONSTRAINTS.batchSize.min} and ${HYPERPARAMETER_CONSTRAINTS.batchSize.max}`
      );
    }

    if (
      params.learningRate < HYPERPARAMETER_CONSTRAINTS.learningRate.min ||
      params.learningRate > HYPERPARAMETER_CONSTRAINTS.learningRate.max
    ) {
      errors.push(
        `Learning rate must be between ${HYPERPARAMETER_CONSTRAINTS.learningRate.min} and ${HYPERPARAMETER_CONSTRAINTS.learningRate.max}`
      );
    }

    return errors;
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Create Fine-tuned Model
        </h2>
      </div>

      <div className="space-y-4">
        <Input
          label="Model Name"
          placeholder="Enter a descriptive name for your model"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mb-3"
          >
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings
          </Button>

          {showAdvanced && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-blue-900">
                    Automatic Hyperparameters
                  </div>
                  <Switch
                    checked={useAutoSettings}
                    onCheckedChange={setUseAutoSettings}
                    className="ml-2"
                  />
                </div>
                <p className="text-sm text-blue-700">
                  {recommendedSettings.message}
                </p>
                {recommendedSettings.warnings.map((warning, index) => (
                  <p key={index} className="text-sm text-amber-600 mt-2">
                    ⚠️ {warning}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  label={`Batch Size (${HYPERPARAMETER_CONSTRAINTS.batchSize.min}-${HYPERPARAMETER_CONSTRAINTS.batchSize.max})`}
                  type="number"
                  min={HYPERPARAMETER_CONSTRAINTS.batchSize.min}
                  max={HYPERPARAMETER_CONSTRAINTS.batchSize.max}
                  value={hyperparameters.batchSize}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    setUseAutoSettings(false);
                    setHyperparameters((prev) => ({
                      ...prev,
                      batchSize: Math.min(
                        Math.max(
                          value,
                          HYPERPARAMETER_CONSTRAINTS.batchSize.min
                        ),
                        HYPERPARAMETER_CONSTRAINTS.batchSize.max
                      ),
                    }));
                  }}
                  disabled={useAutoSettings}
                  helperText={`Recommended: ${recommendedSettings.batchSize}`}
                />
                <Input
                  label={`Learning Rate (${HYPERPARAMETER_CONSTRAINTS.learningRate.min}-${HYPERPARAMETER_CONSTRAINTS.learningRate.max})`}
                  type="number"
                  min={HYPERPARAMETER_CONSTRAINTS.learningRate.min}
                  max={HYPERPARAMETER_CONSTRAINTS.learningRate.max}
                  step="0.0001"
                  value={hyperparameters.learningRate}
                  onChange={(e) => {
                    setUseAutoSettings(false);
                    setHyperparameters({
                      ...hyperparameters,
                      learningRate: parseFloat(e.target.value),
                    });
                  }}
                  disabled={useAutoSettings}
                  helperText={`Recommended: ${recommendedSettings.learningRate}`}
                />
                <Input
                  label={`Epoch Count (${HYPERPARAMETER_CONSTRAINTS.epochCount.min}-${HYPERPARAMETER_CONSTRAINTS.epochCount.max})`}
                  type="number"
                  min={HYPERPARAMETER_CONSTRAINTS.epochCount.min}
                  max={HYPERPARAMETER_CONSTRAINTS.epochCount.max}
                  value={hyperparameters.epochCount}
                  onChange={(e) => {
                    setUseAutoSettings(false);
                    setHyperparameters({
                      ...hyperparameters,
                      epochCount: parseInt(e.target.value, 10),
                    });
                  }}
                  disabled={useAutoSettings}
                  helperText={`Recommended: ${recommendedSettings.epochCount}`}
                />
              </div>

              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-red-800 mb-1">
                    Please fix the following errors:
                  </div>
                  {validationErrors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">
                      • {error}
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Understanding Hyperparameters
                </h4>
                <div className="text-xs text-gray-600 space-y-2">
                  <p>
                    • <strong>Batch Size:</strong> Controls how many examples
                    are processed together. Larger batches (4-64) can speed up
                    training but may require more memory.
                  </p>
                  <p>
                    • <strong>Learning Rate:</strong> Determines how quickly the
                    model adapts. Higher rates learn faster but may be less
                    stable.
                  </p>
                  <p>
                    • <strong>Epoch Count:</strong> Number of complete passes
                    through your training data. More epochs can improve results
                    but may cause overfitting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCreateModel}
            disabled={
              !displayName.trim() ||
              state.trainingData.length === 0 ||
              state.isLoading
            }
            loading={state.isLoading}
            className="w-full"
          >
            Create Model
          </Button>

          <div className="text-sm text-gray-600">
            Training examples: {state.trainingData.length}
          </div>
        </div>
      </div>
    </Card>
  );
}
