
interface PreviewResponse {
  id: string;
  previewUrl: string;
  success: boolean;
  error?: string;
}

interface CodeExecutionResult {
  success: boolean;
  error?: string;
  compiledCode?: string;
}

class PreviewService {
  private baseUrl = 'http://localhost:3001'; // Backend server URL
  
  async generatePreview(code: string): Promise<PreviewResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Preview generation error:', error);
      return {
        id: '',
        previewUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async validateCode(code: string): Promise<CodeExecutionResult> {
    try {
      // Basic validation checks
      if (!code.trim()) {
        return { success: false, error: 'Code cannot be empty' };
      }

      // Check for basic React component structure
      const hasComponent = /(?:function|const|class)\s+(?:App|Component|Main)/.test(code);
      const hasExport = /export\s+default/.test(code);
      
      if (!hasComponent) {
        return { success: false, error: 'Code must contain a component named App, Component, or Main' };
      }

      if (!hasExport) {
        return { success: false, error: 'Component must have a default export' };
      }

      return { success: true, compiledCode: code };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Code validation failed'
      };
    }
  }
}

export const previewService = new PreviewService();
