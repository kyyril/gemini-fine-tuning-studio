import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { TunedModel, TuningOperation, TrainingExample } from '../types';

interface GeminiState {
  apiKey: string;
  models: TunedModel[];
  currentOperation: TuningOperation | null;
  isLoading: boolean;
  error: string | null;
  trainingData: TrainingExample[];
}

type GeminiAction =
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_MODELS'; payload: TunedModel[] }
  | { type: 'ADD_MODEL'; payload: TunedModel }
  | { type: 'REMOVE_MODEL'; payload: string }
  | { type: 'SET_CURRENT_OPERATION'; payload: TuningOperation | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRAINING_DATA'; payload: TrainingExample[] }
  | { type: 'ADD_TRAINING_EXAMPLE'; payload: TrainingExample }
  | { type: 'REMOVE_TRAINING_EXAMPLE'; payload: number }
  | { type: 'UPDATE_TRAINING_EXAMPLE'; payload: { index: number; example: TrainingExample } };

const initialState: GeminiState = {
  apiKey: localStorage.getItem('gemini_api_key') || '',
  models: [],
  currentOperation: null,
  isLoading: false,
  error: null,
  trainingData: []
};

function geminiReducer(state: GeminiState, action: GeminiAction): GeminiState {
  switch (action.type) {
    case 'SET_API_KEY':
      localStorage.setItem('gemini_api_key', action.payload);
      return { ...state, apiKey: action.payload };
    case 'SET_MODELS':
      return { ...state, models: action.payload };
    case 'ADD_MODEL':
      return { ...state, models: [action.payload, ...state.models] };
    case 'REMOVE_MODEL':
      return { ...state, models: state.models.filter(model => model.name !== action.payload) };
    case 'SET_CURRENT_OPERATION':
      return { ...state, currentOperation: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TRAINING_DATA':
      return { ...state, trainingData: action.payload };
    case 'ADD_TRAINING_EXAMPLE':
      return { ...state, trainingData: [...state.trainingData, action.payload] };
    case 'REMOVE_TRAINING_EXAMPLE':
      return { 
        ...state, 
        trainingData: state.trainingData.filter((_, index) => index !== action.payload) 
      };
    case 'UPDATE_TRAINING_EXAMPLE':
      return {
        ...state,
        trainingData: state.trainingData.map((example, index) =>
          index === action.payload.index ? action.payload.example : example
        )
      };
    default:
      return state;
  }
}

interface GeminiContextValue {
  state: GeminiState;
  dispatch: React.Dispatch<GeminiAction>;
}

const GeminiContext = createContext<GeminiContextValue | undefined>(undefined);

export function GeminiProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(geminiReducer, initialState);

  return (
    <GeminiContext.Provider value={{ state, dispatch }}>
      {children}
    </GeminiContext.Provider>
  );
}

export function useGemini() {
  const context = useContext(GeminiContext);
  if (context === undefined) {
    throw new Error('useGemini must be used within a GeminiProvider');
  }
  return context;
}