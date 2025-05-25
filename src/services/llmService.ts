
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

CRITICAL REQUIREMENTS:
- Generate ONLY the React component code for App.tsx
- Use React hooks (useState, useEffect) for interactivity
- Use Tailwind CSS for ALL styling (no custom CSS classes)
- Make it fully functional with working buttons, forms, etc.
- Include proper TypeScript types
- The component should be responsive and modern
- Don't include any imports for external libraries except React hooks
- Make it a complete, working application, not just a basic layout
- Ensure all interactive elements actually work
- Use proper event handlers and state management

CODE STRUCTURE:
- Start with: import React, { useState } from 'react';
- End with: export default App;
- Component name must be "App"
- Use functional components only
- Include real functionality, not just placeholder text

STYLING GUIDELINES:
- Use Tailwind's utility classes extensively
- Make it visually appealing with proper spacing, colors, and typography
- Ensure responsive design with proper breakpoints
- Use hover states and transitions for interactivity

Return ONLY the component code without any explanations, markdown formatting, or code blocks.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Clean and extract React code from the response
      let extractedCode = content;
      
      // Remove markdown code blocks if present
      const codeMatch = content.match(/```(?:tsx?|jsx?)\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        extractedCode = codeMatch[1];
      }
      
      // Remove any leading/trailing whitespace and ensure proper formatting
      extractedCode = extractedCode.trim();
      
      // Validate that it's a proper React component
      if (!extractedCode.includes('export default') || !extractedCode.includes('const App')) {
        console.warn('Generated code might not be a valid React component');
      }
      
      return {
        explanation: "Generated a complete React application based on your requirements.",
        code: extractedCode,
        files: []
      };
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error('Failed to connect to LM Studio API. Please ensure it\'s running on http://127.0.0.1:1234');
    }
  }
}

export const llmService = new LLMService();
