import React, { useEffect, useState } from 'react';
import { RefreshCw, Trash2, Play, Brain } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { useGemini } from '../contexts/GeminiContext';
import { useGeminiApi } from '../hooks/useGeminiApi';
import { toast } from 'sonner';

export function ModelList() {
  const { state } = useGemini();
  const { listModels, deleteModel, testModel } = useGeminiApi();
  const [testInputs, setTestInputs] = useState<Record<string, string>>({});
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [testingModels, setTestingModels] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (state.apiKey) {
      listModels();
    }
  }, [state.apiKey, listModels]);

  const handleTestModel = async (modelName: string) => {
    const input = testInputs[modelName];
    if (!input?.trim()) {
      toast.error('Please enter test input');
      return;
    }

    setTestingModels(prev => new Set(prev).add(modelName));
    const result = await testModel(modelName, input);
    setTestingModels(prev => {
      const newSet = new Set(prev);
      newSet.delete(modelName);
      return newSet;
    });

    if (result) {
      setTestResults(prev => ({ ...prev, [modelName]: result }));
    }
  };

  const handleDeleteModel = async (modelName: string) => {
    if (window.confirm('Are you sure you want to delete this model? This action cannot be undone.')) {
      await deleteModel(modelName);
    }
  };

  const getStatusBadge = (state: string) => {
    switch (state) {
      case 'ACTIVE':
        return <Badge variant="success">Active</Badge>;
      case 'CREATING':
        return <Badge variant="warning">Creating</Badge>;
      case 'FAILED':
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
            <div key={model.name} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{model.display_name}</h3>
                  <p className="text-sm text-gray-500">{model.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(model.state)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteModel(model.name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {model.state === 'ACTIVE' && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter test input..."
                      value={testInputs[model.name] || ''}
                      onChange={(e) => setTestInputs(prev => ({
                        ...prev,
                        [model.name]: e.target.value
                      }))}
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
                      <div className="text-sm font-medium text-green-800 mb-1">Model Output:</div>
                      <div className="text-sm text-green-700">{testResults[model.name]}</div>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Created: {new Date(model.create_time).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}