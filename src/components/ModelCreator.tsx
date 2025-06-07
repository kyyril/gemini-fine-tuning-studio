import React, { useState } from 'react';
import { Brain, Settings } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useGemini } from '../contexts/GeminiContext';
import { useGeminiApi } from '../hooks/useGeminiApi';

export function ModelCreator() {
  const { state } = useGemini();
  const { createModel } = useGeminiApi();
  const [displayName, setDisplayName] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hyperparameters, setHyperparameters] = useState({
    batchSize: 2,
    learningRate: 0.001,
    epochCount: 5,
  });

  const handleCreateModel = () => {
    createModel(
      displayName,
      hyperparameters.batchSize,
      hyperparameters.learningRate,
      hyperparameters.epochCount
    );
    setDisplayName('');
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Brain className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Create Fine-tuned Model</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <Input
                label="Batch Size"
                type="number"
                min="1"
                max="32"
                value={hyperparameters.batchSize}
                onChange={(e) => setHyperparameters({
                  ...hyperparameters,
                  batchSize: parseInt(e.target.value, 10)
                })}
              />
              <Input
                label="Learning Rate"
                type="number"
                min="0.0001"
                max="0.01"
                step="0.0001"
                value={hyperparameters.learningRate}
                onChange={(e) => setHyperparameters({
                  ...hyperparameters,
                  learningRate: parseFloat(e.target.value)
                })}
              />
              <Input
                label="Epoch Count"
                type="number"
                min="1"
                max="100"
                value={hyperparameters.epochCount}
                onChange={(e) => setHyperparameters({
                  ...hyperparameters,
                  epochCount: parseInt(e.target.value, 10)
                })}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCreateModel}
            disabled={!displayName.trim() || state.trainingData.length === 0 || state.isLoading}
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