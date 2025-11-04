import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { isHarmful, getHarmType, safeAssistantResponse } from "@/lib/contentSafety";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Apple,
  Droplet,
  Brain,
  Send,
  Bot,
  User
} from "lucide-react";

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const PreventiveAICoach = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "👋 Namaste! I'm your AI Health Coach powered by MedAid. I can help you with:\n\n✅ Personalized health tips\n✅ Diet & nutrition advice\n✅ Exercise plans\n✅ Stress management\n✅ Sleep improvement\n✅ General wellness questions\n\nHow can I help you live healthier today?",
      timestamp: new Date()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const navigate = useNavigate();

  const healthScore = 75; // Overall health score out of 100
  const [harmWarning, setHarmWarning] = useState<{
    visible: boolean;
    type: string | null;
    message: string;
  }>({ visible: false, type: null, message: '' });

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    // Check for harmful content first
    if (isHarmful(userInput)) {
      const type = getHarmType(userInput);
      const assistantText = safeAssistantResponse(type);
      // Do not forward to AI - show safe assistant overlay instead of redirecting immediately
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: assistantText,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setUserInput("");
      toast.error("Request blocked for safety reasons.");
      setHarmWarning({ visible: true, type: type, message: assistantText });
      return;
    }

    // Add user message
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput("");
    
    // Simulate AI response
    setTimeout(() => {
      let response = "";
      const lowerInput = userInput.toLowerCase();
      
      if (lowerInput.includes('diet') || lowerInput.includes('food') || lowerInput.includes('eat')) {
        response = "🥗 For a healthy diet, I recommend:\n\n• Include more vegetables and fruits (5 servings/day)\n• Choose whole grains over refined grains\n• Drink plenty of water (8-10 glasses)\n• Limit processed foods and sugar\n• Include protein in every meal\n\nWould you like a personalized meal plan?";
      } else if (lowerInput.includes('exercise') || lowerInput.includes('workout') || lowerInput.includes('fitness')) {
        response = "💪 Exercise recommendations:\n\n• Start with 30 minutes daily walking\n• Include strength training 2-3 times/week\n• Try yoga for flexibility (15 min/day)\n• Take stairs instead of elevator\n• Stay consistent - exercise at the same time daily\n\nShall I create a workout schedule for you?";
      } else if (lowerInput.includes('sleep') || lowerInput.includes('tired') || lowerInput.includes('rest')) {
        response = "😴 Better sleep tips:\n\n• Maintain consistent sleep schedule (7-8 hours)\n• Avoid screens 1 hour before bed\n• Keep bedroom dark and cool\n• No caffeine after 4 PM\n• Try relaxation exercises before bed\n\nGood sleep is crucial for health!";
      } else if (lowerInput.includes('stress') || lowerInput.includes('anxiety') || lowerInput.includes('mental')) {
        response = "🧘 Stress management tips:\n\n• Practice deep breathing exercises\n• Try 10 minutes daily meditation\n• Regular physical activity\n• Connect with friends and family\n• Take short breaks during work\n• Consider professional help if needed\n\nYour mental health matters!";
      } else if (lowerInput.includes('water') || lowerInput.includes('hydration')) {
        response = "💧 Hydration is vital!\n\n• Drink 8-10 glasses (2.5-3L) daily\n• Start your day with a glass of water\n• Drink before you feel thirsty\n• Increase intake during exercise\n• Limit sugary drinks\n\nStay hydrated for better health!";
      } else {
        response = `I understand you're asking about "${userInput}". Here are some general health tips:\n\n• Maintain balanced diet with variety\n• Exercise regularly (30 min/day)\n• Get adequate sleep (7-8 hours)\n• Stay hydrated\n• Regular health checkups\n• Manage stress effectively\n\nCould you be more specific about what you'd like to know? I can help with diet, exercise, sleep, or stress management!`;
      }
      
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <Card className="shadow-md h-full flex flex-col">
      {/* Harm warning overlay */}
      {harmWarning.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-lg w-full p-6 shadow-lg border">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Caution</h3>
                <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{harmWarning.message}</p>
              </div>
              <div>
                <Button variant="destructive" size="sm" onClick={() => {
                  setHarmWarning({ visible: false, type: null, message: '' });
                }}>
                  <span className="mr-2">✕</span>Dismiss
                </Button>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => navigate('/emergency')}>
                <span className="mr-2">🆘</span>Emergency Help
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => {
                // Provide safer resources inline and close the overlay
                setHarmWarning({ visible: false, type: null, message: '' });
                toast.success('If you are struggling, please consider contacting local helplines or a trusted person.');
              }}>
                Need Support Info
              </Button>
            </div>
          </div>
        </div>
      )}
      <CardHeader className="p-4 md:p-6 border-b">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-base md:text-lg">AI Health Chatbot</CardTitle>
              <CardDescription className="text-xs md:text-sm flex items-center gap-1">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                Online - Ask me anything
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
            Score: {healthScore}/100
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4 flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-[400px] max-h-[500px] pr-2">
          {chatMessages.map((message, index) => (
            <div 
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              } rounded-lg p-3`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString('en-IN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUserInput("What should I eat for better health?")}
            className="text-xs"
          >
            <Apple className="h-3 w-3 mr-1" />
            Diet Tips
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUserInput("How can I exercise daily?")}
            className="text-xs"
          >
            <Activity className="h-3 w-3 mr-1" />
            Exercise
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUserInput("How to manage stress?")}
            className="text-xs"
          >
            <Brain className="h-3 w-3 mr-1" />
            Stress
          </Button>
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask about diet, exercise, sleep, health tips..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!userInput.trim()}
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreventiveAICoach;

