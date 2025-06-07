import React from 'react';
import { Toaster } from 'sonner';
import { Brain } from 'lucide-react';
import { GeminiProvider, useGemini } from './contexts/GeminiContext';
import { ApiKeySetup } from './components/ApiKeySetup';
import { TrainingDataEditor } from './components/TrainingDataEditor';
import { ModelCreator } from './components/ModelCreator';
import { TrainingProgress } from './components/TrainingProgress';
import { ModelList } from './components/ModelList';

function AppContent() {
  const { state } = useGemini();

  if (!state.apiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gemini Fine-tuning Studio
              </h1>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create and manage fine-tuned Gemini models with an intuitive interface. 
              Upload training data, monitor progress, and test your models all in one place.
            </p>
          </div>
          <ApiKeySetup />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Gemini Fine-tuning Studio
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <TrainingDataEditor />
            <ModelCreator />
            {state.currentOperation && <TrainingProgress />}
          </div>
          <div>
            <ModelList />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <GeminiProvider>
      <AppContent />
      <Toaster position="top-right" richColors />
    </GeminiProvider>
  );
}

export default App;