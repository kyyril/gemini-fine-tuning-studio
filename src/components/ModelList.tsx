import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Trash2,
  Play,
  Brain,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Input";
import { useGemini } from "../contexts/GeminiContext";
import { useGeminiApi } from "../hooks/useGeminiApi";
import { toast } from "sonner";

export function ModelList() {
  const { state } = useGemini();
  const { listModels, deleteModel, testModel } = useGeminiApi();
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [testingModels, setTestingModels] = useState<Set<string>>(new Set());
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [creatingModels, setCreatingModels] = useState<Set<string>>(new Set());
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    if (state.apiKey) {
      listModels();
    }
  }, [state.apiKey, listModels]);

  useEffect(() => {
    const creatingModelExists = state.models.some(
      (model) => model.state === "CREATING"
    );

    if (creatingModelExists) {
      // Set up polling every 5 seconds if there's a creating model
      const interval = setInterval(() => {
        listModels();
      }, 5000);
      setRefreshInterval(interval);
    } else {
      // Clear interval if no models are creating
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [state.models, listModels]);

  const handleTestModel = async (modelName: string) => {
    const input = testInputs[modelName];
    if (!input?.trim()) {
      toast.error("Please enter test input");
      return;
    }

    setTestingModels((prev) => new Set(prev).add(modelName));
    const result = await testModel(modelName, input);
    setTestingModels((prev) => {
      const newSet = new Set(prev);
      newSet.delete(modelName);
      return newSet;
    });

    if (result) {
      setTestResults((prev) => ({ ...prev, [modelName]: result }));
    }
  };

  const handleDeleteModel = async (modelName: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this model? This action cannot be undone."
      )
    ) {
      await deleteModel(modelName);
    }
  };

  const toggleModelDetails = (modelName: string) => {
    setExpandedModels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modelName)) {
        newSet.delete(modelName);
      } else {
        newSet.add(modelName);
      }
      return newSet;
    });
  };

  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const seconds = Math.floor((end.getTime() - start.getTime()) / 1000);
    return `${seconds} seconds`;
  };

  const getStatusBadge = (state: string) => {
    switch (state) {
      case "ACTIVE":
        return <Badge variant="success">Active</Badge>;
      case "CREATING":
        return <Badge variant="warning">Creating</Badge>;
      case "FAILED":
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="info">{state}</Badge>;
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Your Models</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={listModels}
          loading={state.isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        {state.models.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No models found. Create your first model to get started.
          </div>
        ) : (
          state.models.map((model) => (
            <div
              key={model.name}
              className="border border-gray-200 rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {model.displayName}
                    </h3>
                    {model.state === "CREATING" ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                        <svg
                          className="w-3 h-3 mr-1 animate-spin"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating...
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleModelDetails(model.name)}
                      >
                        {expandedModels.has(model.name) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{model.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(model.state)}
                  {model.state !== "CREATING" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteModel(model.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {model.state === "CREATING" ? (
                <div className="flex items-center justify-center py-4">
                  <svg
                    className="w-6 h-6 mr-2 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating model, please wait...
                </div>
              ) : (
                expandedModels.has(model.name) && (
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Base Model:</p>
                        <p className="text-gray-600">{model.baseModel}</p>
                      </div>
                      <div>
                        <p className="font-medium">Training Duration:</p>
                        <p className="text-gray-600">
                          {formatDuration(
                            model.tuningTask.startTime,
                            model.tuningTask.completeTime
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Hyperparameters:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">
                            Epochs:{" "}
                            {model.tuningTask.hyperparameters.epochCount}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">
                            Batch Size:{" "}
                            {model.tuningTask.hyperparameters.batchSize}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">
                            Learning Rate:{" "}
                            {model.tuningTask.hyperparameters.learningRate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Generation Settings:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">
                            Temperature: {model.temperature}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Top P: {model.topP}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-gray-600">Top K: {model.topK}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Training Progress:</p>
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="space-y-2">
                          {model.tuningTask.snapshots.map((snapshot, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-xs"
                            >
                              <span>
                                Step {snapshot.step} (Epoch{" "}
                                {snapshot.epoch || 1})
                              </span>
                              <span>Loss: {snapshot.meanLoss.toFixed(4)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

              {model.state === "ACTIVE" && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter test input..."
                      value={testInputs[model.name] || ""}
                      onChange={(e) =>
                        setTestInputs((prev) => ({
                          ...prev,
                          [model.name]: e.target.value,
                        }))
                      }
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleTestModel(model.name)}
                      loading={testingModels.has(model.name)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Test
                    </Button>
                  </div>

                  {testResults[model.name] && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-green-800 mb-1">
                        Model Output:
                      </div>
                      <div className="text-sm text-green-700">
                        {testResults[model.name]}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Created: {new Date(model.create_time).toLocaleString()}
                <br />
                Last Updated: {new Date(model.update_time).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
