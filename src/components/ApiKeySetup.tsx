import React, { useState } from "react";
import { Key, Eye, EyeOff, Trash2 } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { useGemini } from "../contexts/GeminiContext";
import { toast } from "sonner";

export function ApiKeySetup() {
  const { state, dispatch } = useGemini();
  const [tempApiKey, setTempApiKey] = useState(state.apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = () => {
    if (!tempApiKey.trim()) {
      toast.error("Please enter a valid API key");
      return;
    }
    dispatch({ type: "SET_API_KEY", payload: tempApiKey.trim() });
    toast.success("API key saved successfully");
  };

  const handleDeleteApiKey = () => {
    dispatch({ type: "SET_API_KEY", payload: "" });
    setTempApiKey("");
    toast.success("API key deleted successfully");
  };

  return (
    <Card className="max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Key className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">API Key Setup</h2>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type={showApiKey ? "text" : "password"}
            placeholder="Enter your Gemini API key"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
          >
            {showApiKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSaveApiKey} className="flex-1">
            Save API Key
          </Button>
          {state.apiKey && (
            <Button
              onClick={handleDeleteApiKey}
              variant="primary"
              className="px-3"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p>
            Get your API key from the{" "}
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
          <p className="text-xs">
            Your API key is stored locally and never sent to our servers.
          </p>
        </div>
      </div>
    </Card>
  );
}
