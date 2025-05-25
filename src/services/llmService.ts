
interface LLMResponse {
  explanation: string;
  code: string;
  files: any[];
}

class LLMService {
  private baseUrl = 'http://127.0.0.1:1234/v1/chat/completions';

  async generateCode(prompt: string): Promise<LLMResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'local-model',
          messages: [
            {
              role: 'system',
              content: `You are an expert web developer. Generate clean, modern React code with Tailwind CSS styling based on user requirements. Always provide:
1. A brief explanation of what you're building
2. Clean, production-ready React component code
3. Responsive design using Tailwind CSS
4. Modern best practices

Format your response as a JSON object with:
{
  "explanation": "Brief explanation of the app",
  "code": "React component code",
  "files": []
}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        return parsed;
      } catch {
        // Fallback if the response isn't properly formatted JSON
        return {
          explanation: "I've generated a basic React component based on your request.",
          code: `
import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Generated App
        </h1>
        <p className="text-gray-600 mb-6">
          ${prompt}
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default App;
          `.trim(),
          files: []
        };
      }
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error('Failed to connect to LM Studio API. Please ensure it\'s running on http://127.0.0.1:1234');
    }
  }
}

export const llmService = new LLMService();
