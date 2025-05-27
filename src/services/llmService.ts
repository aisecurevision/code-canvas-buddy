
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
- Generate ONLY plain JavaScript React code (NO TypeScript annotations)
- Use React hooks (useState, useEffect) for interactivity
- Use Tailwind CSS for ALL styling (no custom CSS classes)
- Make it fully functional with working buttons, forms, etc.
- DO NOT include TypeScript types like : string, : number, : React.FC, etc.
- DO NOT include interface or type declarations
- The component should be responsive and modern
- Don't include any imports for external libraries except React hooks
- Make it a complete, working application, not just a basic layout
- Ensure all interactive elements actually work
- Use proper event handlers and state management

CODE STRUCTURE:
- Start with: function App() {
- End with: export default App;
- Component name must be "App"
- Use functional components only
- Include real functionality, not just placeholder text
- NO TypeScript syntax whatsoever
- NO interface declarations
- NO type annotations on variables, parameters, or return types

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
      let content = data.choices[0].message.content;
      
      // Clean and extract React code from the response
      let extractedCode = content;
      
      // Remove markdown code blocks if present
      const codeMatch = content.match(/```(?:tsx?|jsx?|javascript)\n?([\s\S]*?)\n?```/);
      if (codeMatch) {
        extractedCode = codeMatch[1];
      }
      
      // Remove any leading/trailing whitespace and ensure proper formatting
      extractedCode = extractedCode.trim();
      
      // Aggressively clean TypeScript annotations that might have slipped through
      extractedCode = extractedCode
        // Remove interface declarations
        .replace(/interface\s+\w+\s*{[^}]*}/gs, '')
        // Remove type declarations
        .replace(/type\s+\w+\s*=[^;]*;/g, '')
        // Remove React.FC and similar types
        .replace(/:\s*React\.FC[^>]*>/g, '')
        // Remove parameter type annotations
        .replace(/:\s*string(?=[\s,\)])/g, '')
        .replace(/:\s*number(?=[\s,\)])/g, '')
        .replace(/:\s*boolean(?=[\s,\)])/g, '')
        .replace(/:\s*any(?=[\s,\)])/g, '')
        .replace(/:\s*void(?=[\s,\)])/g, '')
        // Remove return type annotations
        .replace(/\):\s*\w+(\[\])?\s*=>/g, ') =>')
        .replace(/\):\s*\w+(\[\])?\s*{/g, ') {')
        // Remove variable type annotations
        .replace(/const\s+(\w+):\s*\w+(\[\])?\s*=/g, 'const $1 =')
        .replace(/let\s+(\w+):\s*\w+(\[\])?\s*=/g, 'let $1 =')
        // Remove useState type annotations
        .replace(/useState<[^>]*>/g, 'useState')
        // Remove useEffect type annotations
        .replace(/useEffect<[^>]*>/g, 'useEffect');
      
      // Validate that it's a proper React component
      if (!extractedCode.includes('function App') && !extractedCode.includes('const App')) {
        console.warn('Generated code might not be a valid React component');
      }
      
      return {
        explanation: "Generated a complete React application with live preview capability.",
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
