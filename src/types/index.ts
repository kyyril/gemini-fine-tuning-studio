export interface TrainingExample {
  text_input: string;
  output: string;
}

export interface TuningTask {
  hyperparameters: {
    batch_size: number;
    learning_rate: number;
    epoch_count: number;
  };
  training_data: {
    examples: {
      examples: TrainingExample[];
    };
  };
}

export interface TunedModel {
  name: string;
  display_name: string;
  base_model: string;
  state: 'CREATING' | 'ACTIVE' | 'FAILED';
  tuning_task: TuningTask;
  create_time: string;
  update_time: string;
}

export interface TuningOperation {
  name: string;
  metadata: {
    tunedModel?: string;
    completedPercent?: number;
    snapshots?: Array<{
      step: number;
      epoch: number;
      meanLoss: number;
      computeTime: string;
    }>;
  };
  done: boolean;
  error?: {
    code: number;
    message: string;
  };
  response?: {
    name: string;
    display_name: string;
    state: string;
  };
}

export interface GenerateContentResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason?: string;
    index?: number;
  }>;
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  };
}

export interface ApiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

export interface SampleDataset {
  name: string;
  description: string;
  examples: TrainingExample[];
}