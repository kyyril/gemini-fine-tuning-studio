# Gemini Fine-tuning Studio

A modern, intuitive web application for creating and managing fine-tuned Google Gemini models. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **🔑 Secure API Key Management**: Store your Gemini API key locally
- **📝 Training Data Editor**: Create, edit, and manage training examples with a visual interface
- **📁 Flexible Data Import/Export**: Upload training data from JSON files or export your datasets
- **🚀 Model Creation**: Fine-tune Gemini models with customizable hyperparameters
- **📊 Real-time Progress Monitoring**: Track training progress with visual indicators
- **🧪 Model Testing**: Test your fine-tuned models directly in the interface
- **🗂️ Model Management**: List, test, and delete your fine-tuned models
- **🎨 Modern UI**: Beautiful, responsive design with smooth animations
- **🔔 Smart Notifications**: Real-time feedback with toast notifications

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Google AI Studio API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-fine-tuning-studio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔧 Usage

### Setting Up Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to create an API key
2. Enter your API key in the setup screen
3. The key is stored securely in your browser's local storage

### Creating Training Data

1. **Manual Entry**: Add training examples one by one using the editor
2. **JSON Upload**: Import training data from a JSON file with this format:
```json
[
  {
    "text_input": "1",
    "output": "2"
  },
  {
    "text_input": "three",
    "output": "four"
  }
]
```

### Fine-tuning a Model

1. Prepare your training data (minimum 10 examples recommended)
2. Enter a descriptive name for your model
3. Optionally adjust hyperparameters:
   - **Batch Size**: Number of examples processed together (1-32)
   - **Learning Rate**: How quickly the model learns (0.0001-0.01)
   - **Epoch Count**: Number of training iterations (1-100)
4. Click "Create Model" to start training

### Monitoring Training

- Training progress is displayed in real-time
- The process typically takes 5-15 minutes depending on data size
- You'll receive notifications when training completes

### Testing Models

1. Navigate to your models list
2. For active models, enter test input in the provided field
3. Click "Test" to see the model's output
4. Compare results with your expected outputs

## 📋 Training Data Guidelines

### Limitations

- **Input**: Maximum 40,000 characters per example
- **Output**: Maximum 5,000 characters per example
- **Format**: Only input-output pairs supported (no multi-turn conversations)
- **Model Input**: Fine-tuned models support up to 40,000 characters

### Best Practices

1. **Quality over Quantity**: 50-100 high-quality examples often work better than 1000 poor ones
2. **Consistency**: Use consistent formatting and style across examples
3. **Diversity**: Include varied examples that cover your use case comprehensively
4. **Clear Patterns**: Ensure the input-output relationship is clear and learnable

### Example Use Cases

- **Text Generation**: Creative writing, code completion, content creation
- **Classification**: Sentiment analysis, category assignment, intent recognition
- **Transformation**: Format conversion, translation, summarization
- **Question Answering**: Domain-specific Q&A, technical support

## 🛠️ API Integration

The application uses the Google Generative AI REST API with the following endpoints:

### List Models
```bash
GET https://generativelanguage.googleapis.com/v1beta/tunedModels
```

### Create Model
```bash
POST https://generativelanguage.googleapis.com/v1beta/tunedModels
```

### Monitor Training
```bash
GET https://generativelanguage.googleapis.com/v1/{operation-name}
```

### Test Model
```bash
POST https://generativelanguage.googleapis.com/v1beta/{model-name}:generateContent
```

### Delete Model
```bash
DELETE https://generativelanguage.googleapis.com/v1beta/{model-name}
```

## 🏗️ Architecture

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── ApiKeySetup.tsx # API key configuration
│   ├── TrainingDataEditor.tsx
│   ├── ModelCreator.tsx
│   ├── TrainingProgress.tsx
│   └── ModelList.tsx
├── contexts/           # React contexts
│   └── GeminiContext.tsx
├── hooks/              # Custom hooks
│   └── useGeminiApi.ts
├── types/              # TypeScript definitions
│   └── index.ts
└── App.tsx            # Main application
```

### State Management

The application uses React Context for state management with the following structure:

- **API Key**: Stored in context and localStorage
- **Models**: List of user's fine-tuned models
- **Training Data**: Current dataset for model creation
- **Training Progress**: Real-time operation status
- **UI State**: Loading states, errors, and notifications

### Key Technologies

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Sonner**: Beautiful toast notifications
- **Lucide React**: Modern icon library

## 🎨 Design System

### Colors
- **Primary**: Purple (#8B5CF6) to Blue (#3B82F6) gradients
- **Secondary**: Teal (#14B8A6) for accents
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Components
- **Cards**: Glassmorphism effect with backdrop blur
- **Buttons**: Gradient backgrounds with hover animations
- **Inputs**: Clean design with focus states
- **Badges**: Status indicators with appropriate colors

## 🔒 Security & Privacy

- API keys are stored locally in browser storage
- No data is sent to external servers except Google's API
- All communication with Google's API uses HTTPS
- Training data remains on your device until explicitly sent for training

## 🚀 Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter issues:

1. Check the [Google AI Studio documentation](https://ai.google.dev/docs)
2. Verify your API key has the necessary permissions
3. Ensure your training data follows the format guidelines
4. Check the browser console for detailed error messages

## 🔮 Roadmap

- [ ] Batch model creation
- [ ] Advanced training metrics
- [ ] Model comparison tools
- [ ] Export fine-tuned models
- [ ] Integration with other Google AI services
- [ ] Advanced data validation
- [ ] Training data templates
- [ ] Model versioning

---

Built with ❤️ using modern web technologies and Google's Gemini API.