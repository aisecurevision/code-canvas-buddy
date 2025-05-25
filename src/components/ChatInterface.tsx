
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Paperclip, Sparkles, Download } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { llmService } from '@/services/llmService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isGenerating?: boolean;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI development assistant. Describe the web application you'd like to build, and I'll generate the complete React code for you with live preview.\n\nFor example, try:\n• \"Build a todo app with add, delete, and mark complete features\"\n• \"Create a weather dashboard with city search\"\n• \"Make a recipe manager with categories and search\"",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { generateProject, files, projectName, setProjectName } = useProject();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleExport = () => {
    if (files.length === 0) return;
    
    // Create a zip-like structure by downloading each file
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.path;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: '',
      sender: 'ai',
      timestamp: new Date(),
      isGenerating: true,
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    const currentInput = input;
    setInput('');
    setIsGenerating(true);

    try {
      const response = await llmService.generateCode(currentInput);
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id 
          ? { ...msg, content: `✅ Generated a complete React application!\n\n**Features created:**\n${response.explanation}\n\nCheck the **Live Preview** tab to see your app in action, or visit the **Code** tab to explore the generated files.`, isGenerating: false }
          : msg
      ));

      // Generate project files
      await generateProject(response);
      
      // Auto-set project name based on user input
      const appName = currentInput.toLowerCase().includes('app') ? 
        currentInput.split(' ').slice(0, 3).join(' ') : 
        'Generated App';
      setProjectName(appName);
      
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id 
          ? { 
              ...msg, 
              content: "❌ I couldn't connect to the LM Studio API. Please make sure:\n\n1. LM Studio is running\n2. A model is loaded\n3. The server is started on http://127.0.0.1:1234\n\nThen try your request again.", 
              isGenerating: false 
            }
          : msg
      ));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Export Button */}
      {files.length > 0 && (
        <div className="p-4 border-b border-slate-700/50">
          <Button
            onClick={handleExport}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Project Files
          </Button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-slate-700/50 text-slate-200 border border-slate-600/50'
              }`}
            >
              {message.isGenerating ? (
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 animate-pulse text-blue-400" />
                  <span className="text-sm">Generating your React app...</span>
                </div>
              ) : (
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <Paperclip className="w-4 h-4" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your app idea... (e.g., 'Build a todo app with categories')"
              className="bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 pr-12"
              disabled={isGenerating}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              size="sm"
              className="absolute right-1 top-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
