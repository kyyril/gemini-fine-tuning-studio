import { useCallback } from 'react';
import { toast } from 'sonner';
import { TunedModel, TuningOperation, GenerateContentResponse } from '../types';
import { useGemini } from '../contexts/GeminiContext';

export function useGeminiApi() {
  const { state, dispatch } = useGemini();

  const handleApiError = useCallback((error: any, defaultMessage: string) => {
    console.error('API Error:', error);
    let message = defaultMessage;
    
    if (error?.error?.message) {
      message = error.error.message;
    } else if (error?.message) {
      message = error.message;
    }
    
    dispatch({ type: 'SET_ERROR', payload: message });
    toast.error(message);
    dispatch({ type: 'SET_LOADING', payload: false });
  }, [dispatch]);

  const listModels = useCallback(async () => {
    if (!state.apiKey) {
      toast.error('Please set your API key first');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/tunedModels?key=${state.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      dispatch({ type: 'SET_MODELS', payload: data.tunedModels || [] });
      toast.success('Models loaded successfully');
    } catch (error) {
      handleApiError(error, 'Failed to load models');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.apiKey, dispatch, handleApiError]);

  const createModel = useCallback(async (
    displayName: string, 
    batchSize: number = 2, 
    learningRate: number = 0.001, 
    epochCount: number = 5
  ) => {
    if (!state.apiKey) {
      toast.error('Please set your API key first');
      return;
    }

    if (state.trainingData.length === 0) {
      toast.error('Please add training data first');
      return;
    }

    if (state.trainingData.length < 10) {
      toast.warning('Recommended to have at least 10 training examples for better results');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Validate training data
      for (const example of state.trainingData) {
        if (example.text_input.length > 40000) {
          throw new Error('Input text exceeds 40,000 character limit');
        }
        if (example.output.length > 5000) {
          throw new Error('Output text exceeds 5,000 character limit');
        }
      }

      const requestBody = {
        display_name: displayName,
        base_model: "models/gemini-1.5-flash-001-tuning",
        tuning_task: {
          hyperparameters: {
            batch_size: batchSize,
            learning_rate: learningRate,
            epoch_count: epochCount,
          },
          training_data: {
            examples: {
              examples: state.trainingData,
            },
          },
        },
      };

      console.log('Creating model with request:', requestBody);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/tunedModels?key=${state.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const operation = await response.json();
      console.log('Model creation operation:', operation);
      
      dispatch({ type: 'SET_CURRENT_OPERATION', payload: operation });
      toast.success('Model creation started! This may take 5-15 minutes.');
      
      // Monitor training progress
      monitorTraining(operation.name);
    } catch (error) {
      handleApiError(error, 'Failed to create model');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.apiKey, state.trainingData, dispatch, handleApiError]);

  const monitorTraining = useCallback(async (operationName: string) => {
    const checkProgress = async () => {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/${operationName}?key=${state.apiKey}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'Failed to check training progress');
        }

        const operation: TuningOperation = await response.json();
        dispatch({ type: 'SET_CURRENT_OPERATION', payload: operation });

        if (!operation.done) {
          setTimeout(checkProgress, 5000); // Check every 5 seconds
        } else {
          if (operation.error) {
            toast.error(`Model training failed: ${operation.error.message}`);
          } else {
            toast.success('Model training completed successfully!');
          }
          listModels(); // Refresh model list
        }
      } catch (error) {
        console.error('Training monitoring error:', error);
        handleApiError(error, 'Failed to monitor training progress');
      }
    };

    checkProgress();
  }, [state.apiKey, dispatch, handleApiError, listModels]);

  const testModel = useCallback(async (modelName: string, input: string): Promise<string | null> => {
    if (!state.apiKey) {
      toast.error('Please set your API key first');
      return null;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${state.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: input,
              }],
            }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: GenerateContentResponse = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      toast.success('Model test completed');
      return result;
    } catch (error) {
      handleApiError(error, 'Failed to test model');
      return null;
    }
  }, [state.apiKey, handleApiError]);

  const deleteModel = useCallback(async (modelName: string) => {
    if (!state.apiKey) {
      toast.error('Please set your API key first');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${modelName}?key=${state.apiKey}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      dispatch({ type: 'REMOVE_MODEL', payload: modelName });
      toast.success('Model deleted successfully');
    } catch (error) {
      handleApiError(error, 'Failed to delete model');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.apiKey, dispatch, handleApiError]);

  return {
    listModels,
    createModel,
    testModel,
    deleteModel,
    monitorTraining,
  };
}