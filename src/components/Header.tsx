import React from "react";
import { Brain, LogOut } from "lucide-react";
import { Button } from "./ui/Button";
import { useGemini } from "../contexts/GeminiContext";
import { toast } from "sonner";

export function Header() {
  const { dispatch } = useGemini();

  const handleLogout = () => {
    dispatch({ type: "SET_API_KEY", payload: "" });
    toast.success("Logged out successfully");
  };

  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Gemini Fine-tuning Studio
          </h1>
        </div>
        <Button
          variant="secondary"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Change API Key
        </Button>
      </div>
    </div>
  );
}
