
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
              content: `You are an expert React developer. Generate a complete, working React component with Tailwind CSS styling based on user requirements. 

IMPORTANT REQUIREMENTS:
- Generate ONLY the React component code for App.tsx
- Use React hooks (useState, useEffect) for interactivity
- Use Tailwind CSS for ALL styling (no custom CSS)
- Make it fully functional with working buttons, forms, etc.
- Include proper TypeScript types
- The component should be responsive and modern
- Don't include any imports for external libraries except React hooks
- Make it a complete, working application, not just a basic layout

Example structure:
\`\`\`tsx
import React, { useState } from 'react';

const App = () => {
  const [state, setState] = useState('');
  
  const handleAction = () => {
    // Working functionality here
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Complete functional UI here */}
    </div>
  );
};

export default App;
\`\`\`

Return only the React component code, no explanations.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Extract React code from the response
      const codeMatch = content.match(/```(?:tsx?|jsx?)\n([\s\S]*?)\n```/);
      const extractedCode = codeMatch ? codeMatch[1] : content;
      
      return {
        explanation: "Generated a complete React application based on your requirements.",
        code: extractedCode.trim(),
        files: []
      };
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error('Failed to connect to LM Studio API. Please ensure it\'s running on http://127.0.0.1:1234');
    }
  }
}

export const llmService = new LLMService();
