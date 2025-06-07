import React, { useState } from 'react';
import { Plus, Trash2, Upload, Download, Sparkles, BookOpen, Calculator, MessageSquare } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useGemini } from '../contexts/GeminiContext';
import { TrainingExample, SampleDataset } from '../types';
import { toast } from 'sonner';

const SAMPLE_DATASETS: SampleDataset[] = [
  {
    name: "Number Sequence",
    description: "Generate the next number in sequence",
    examples: [
      { text_input: "1", output: "2" },
      { text_input: "3", output: "4" },
      { text_input: "-3", output: "-2" },
      { text_input: "twenty two", output: "twenty three" },
      { text_input: "two hundred", output: "two hundred one" },
      { text_input: "ninety nine", output: "one hundred" },
      { text_input: "8", output: "9" },
      { text_input: "-98", output: "-97" },
      { text_input: "1,000", output: "1,001" },
      { text_input: "10,100,000", output: "10,100,001" },
      { text_input: "thirteen", output: "fourteen" },
      { text_input: "eighty", output: "eighty one" },
      { text_input: "one", output: "two" },
      { text_input: "seven", output: "eight" }
    ]
  },
  {
    name: "Sentiment Analysis",
    description: "Classify text sentiment as positive, negative, or neutral",
    examples: [
      { text_input: "I love this product! It's amazing.", output: "positive" },
      { text_input: "This is terrible and doesn't work.", output: "negative" },
      { text_input: "The weather is okay today.", output: "neutral" },
      { text_input: "Best purchase I've ever made!", output: "positive" },
      { text_input: "Waste of money, very disappointed.", output: "negative" },
      { text_input: "It's an average product.", output: "neutral" },
      { text_input: "Absolutely fantastic experience!", output: "positive" },
      { text_input: "Poor quality and bad service.", output: "negative" },
      { text_input: "The item arrived on time.", output: "neutral" },
      { text_input: "Exceeded my expectations completely!", output: "positive" }
    ]
  },
  {
    name: "Language Translation",
    description: "Translate English phrases to Spanish",
    examples: [
      { text_input: "Hello, how are you?", output: "Hola, ¿cómo estás?" },
      { text_input: "Good morning", output: "Buenos días" },
      { text_input: "Thank you very much", output: "Muchas gracias" },
      { text_input: "What is your name?", output: "¿Cómo te llamas?" },
      { text_input: "I love you", output: "Te amo" },
      { text_input: "Where is the bathroom?", output: "¿Dónde está el baño?" },
      { text_input: "How much does it cost?", output: "¿Cuánto cuesta?" },
      { text_input: "I don't understand", output: "No entiendo" },
      { text_input: "Please help me", output: "Por favor ayúdame" },
      { text_input: "Have a good day", output: "Que tengas un buen día" }
    ]
  },
  {
    name: "Code Comments",
    description: "Generate comments for code snippets",
    examples: [
      { text_input: "function add(a, b) { return a + b; }", output: "// Function to add two numbers and return the sum" },
      { text_input: "const users = await fetch('/api/users');", output: "// Fetch users data from the API endpoint" },
      { text_input: "if (user.isAdmin) { showAdminPanel(); }", output: "// Show admin panel if user has admin privileges" },
      { text_input: "for (let i = 0; i < items.length; i++) {", output: "// Loop through each item in the items array" },
      { text_input: "const result = data.filter(item => item.active);", output: "// Filter data to get only active items" },
      { text_input: "localStorage.setItem('token', authToken);", output: "// Store authentication token in browser's local storage" },
      { text_input: "try { await saveData(); } catch (error) {", output: "// Attempt to save data and handle any errors that occur" },
      { text_input: "const isValid = email.includes('@');", output: "// Check if email contains @ symbol for basic validation" }
    ]
  }
];

export function TrainingDataEditor() {
  const { state, dispatch } = useGemini();
  const [newExample, setNewExample] = useState<TrainingExample>({ text_input: '', output: '' });
  const [showSamples, setShowSamples] = useState(false);

  const addExample = () => {
    if (!newExample.text_input.trim() || !newExample.output.trim()) {
      toast.error('Please fill in both input and output fields');
      return;
    }

    if (newExample.text_input.length > 40000) {
      toast.error('Input text exceeds 40,000 character limit');
      return;
    }

    if (newExample.output.length > 5000) {
      toast.error('Output text exceeds 5,000 character limit');
      return;
    }

    dispatch({ type: 'ADD_TRAINING_EXAMPLE', payload: newExample });
    setNewExample({ text_input: '', output: '' });
    toast.success('Training example added');
  };

  const removeExample = (index: number) => {
    dispatch({ type: 'REMOVE_TRAINING_EXAMPLE', payload: index });
    toast.success('Training example removed');
  };

  const updateExample = (index: number, field: keyof TrainingExample, value: string) => {
    const updatedExample = { ...state.trainingData[index], [field]: value };
    dispatch({ type: 'UPDATE_TRAINING_EXAMPLE', payload: { index, example: updatedExample } });
  };

  const loadSampleDataset = (dataset: SampleDataset) => {
    dispatch({ type: 'SET_TRAINING_DATA', payload: dataset.examples });
    setShowSamples(false);
    toast.success(`Loaded ${dataset.examples.length} examples from "${dataset.name}" dataset`);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all training data? This action cannot be undone.')) {
      dispatch({ type: 'SET_TRAINING_DATA', payload: [] });
      toast.success('All training data cleared');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data) && data.every(item => 
          typeof item === 'object' && 'text_input' in item && 'output' in item
        )) {
          // Validate data limits
          const invalidExamples = data.filter(item => 
            item.text_input.length > 40000 || item.output.length > 5000
          );
          
          if (invalidExamples.length > 0) {
            toast.error(`${invalidExamples.length} examples exceed character limits and will be skipped`);
          }

          const validData = data.filter(item => 
            item.text_input.length <= 40000 && item.output.length <= 5000
          );

          dispatch({ type: 'SET_TRAINING_DATA', payload: validData });
          toast.success(`Loaded ${validData.length} valid training examples`);
        } else {
          toast.error('Invalid JSON format. Expected array of objects with text_input and output fields.');
        }
      } catch (error) {
        toast.error('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state.trainingData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'training-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Training data exported');
  };

  const getSampleIcon = (name: string) => {
    switch (name) {
      case 'Number Sequence': return Calculator;
      case 'Sentiment Analysis': return MessageSquare;
      case 'Language Translation': return BookOpen;
      case 'Code Comments': return Sparkles;
      default: return Sparkles;
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Training Data</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSamples(!showSamples)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Sample Data
          </Button>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import JSON
          </Button>
          <Button variant="ghost" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {showSamples && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Sample Datasets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_DATASETS.map((dataset) => {
              const IconComponent = getSampleIcon(dataset.name);
              return (
                <div
                  key={dataset.name}
                  className="p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                  onClick={() => loadSampleDataset(dataset)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="w-4 h-4 text-purple-600" />
                    <h4 className="font-medium text-gray-900">{dataset.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{dataset.description}</p>
                  <p className="text-xs text-purple-600">{dataset.examples.length} examples</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <Input
              placeholder="Input text (max 40,000 chars)"
              value={newExample.text_input}
              onChange={(e) => setNewExample({ ...newExample, text_input: e.target.value })}
            />
            <div className="text-xs text-gray-500 mt-1">
              {newExample.text_input.length}/40,000 characters
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Expected output (max 5,000 chars)"
                value={newExample.output}
                onChange={(e) => setNewExample({ ...newExample, output: e.target.value })}
              />
              <div className="text-xs text-gray-500 mt-1">
                {newExample.output.length}/5,000 characters
              </div>
            </div>
            <Button onClick={addExample} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {state.trainingData.map((example, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white border border-gray-200 rounded-lg">
              <div>
                <Input
                  value={example.text_input}
                  onChange={(e) => updateExample(index, 'text_input', e.target.value)}
                  placeholder="Input text"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {example.text_input.length}/40,000 chars
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={example.output}
                    onChange={(e) => updateExample(index, 'output', e.target.value)}
                    placeholder="Expected output"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {example.output.length}/5,000 chars
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExample(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {state.trainingData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No training examples yet. Add some above, import from a JSON file, or try sample data.
          </div>
        )}

        {state.trainingData.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              <strong>{state.trainingData.length}</strong> training examples
              {state.trainingData.length < 10 && (
                <span className="text-yellow-600 ml-2">
                  (Recommended: 10+ examples)
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllData}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
        )}

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Training Data Guidelines:</p>
          <ul className="text-xs space-y-1">
            <li>• Maximum input size: 40,000 characters per example</li>
            <li>• Maximum output size: 5,000 characters per example</li>
            <li>• Use clear, consistent input-output pairs</li>
            <li>• Include diverse examples to improve model performance</li>
            <li>• Minimum 10 examples recommended for good results</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}