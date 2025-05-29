import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Monitor, Smartphone, Tablet, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import Babel for in-browser compilation
declare global {
  interface Window {
    Babel: any;
  }
}

export const PreviewPanel = () => {
  const { files } = useProject();
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const hasFiles = files.length > 0;

  const getViewportClass = () => {
    switch (viewMode) {
      case 'tablet':
        return 'w-[768px] h-[600px]';
      case 'mobile':
        return 'w-[375px] h-[667px]';
      default:
        return 'w-full h-[600px]';
    }
  };

  // Load Babel if not already loaded
  useEffect(() => {
    if (!window.Babel) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
      script.onload = () => {
        console.log('Babel loaded successfully');
      };
      document.head.appendChild(script);
    }
  }, []);

  // Convert TypeScript/JSX code to pure JavaScript
  const convertCodeToJS = (code: string): string => {
    console.log('Input code:', code);
    
    // Clean up the code more carefully
    let cleanCode = code.trim();
    
    // Remove any markdown code blocks
    cleanCode = cleanCode.replace(/```(?:tsx?|jsx?|javascript|typescript)?\n?/g, '');
    
    // If the code already has React import, keep it
    if (!cleanCode.includes('import React') && !cleanCode.includes('const { useState') && cleanCode.includes('useState')) {
      cleanCode = `import React, { useState } from 'react';\n\n${cleanCode}`;
    }
    
    // Handle export default properly - convert to regular function and add render call
    if (cleanCode.includes('export default App')) {
      // Replace export default with just the function
      cleanCode = cleanCode.replace('export default App;', '');
      cleanCode = cleanCode.replace(/export\s+default\s+function\s+App/g, 'function App');
      cleanCode = cleanCode.replace(/export\s+default\s+App/g, '');
    } else if (cleanCode.includes('export default')) {
      // Handle other export default patterns
      cleanCode = cleanCode.replace(/export\s+default\s+/g, '');
    }
    
    // Add rendering code at the end if not present
    if (!cleanCode.includes('ReactDOM.createRoot') && !cleanCode.includes('ReactDOM.render')) {
      cleanCode += `\n\n// Render the component\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(React.createElement(App));`;
    }
    
    console.log('Cleaned code before Babel:', cleanCode);
    return cleanCode;
  };

  // Compile and render the React code
  useEffect(() => {
    if (!hasFiles || !window.Babel) return;

    setIsLoading(true);
    setCompilationError(null);

    try {
      // Find the main App component
      const appFile = files.find(file => file.path === 'App.tsx');
      if (!appFile) {
        setCompilationError('No App.tsx file found');
        setIsLoading(false);
        return;
      }

      console.log('Original code:', appFile.content);

      // Clean the code and convert TypeScript to JavaScript
      const cleanedCode = convertCodeToJS(appFile.content);
      console.log('Cleaned code:', cleanedCode);

      // Compile JSX to JavaScript using Babel with proper configuration
      const compiledCode = window.Babel.transform(cleanedCode, {
        filename: 'App.tsx',
        presets: [
          ['react', { 
            runtime: 'classic',
            pragma: 'React.createElement',
            pragmaFrag: 'React.Fragment'
          }]
        ],
        plugins: []
      }).code;

      console.log('Compiled code:', compiledCode);

      // Create the HTML template for the iframe
      const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Live Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: white;
    }
    .error {
      color: red;
      padding: 20px;
      font-family: monospace;
      white-space: pre-wrap;
      background: #fff5f5;
      border: 1px solid #fed7d7;
      border-radius: 4px;
      margin: 20px;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    try {
      ${compiledCode}
    } catch (error) {
      console.error('Runtime error:', error);
      document.getElementById('root').innerHTML = 
        '<div class="error">Runtime Error: ' + error.message + '\\n\\n' + error.stack + '</div>';
    }
  </script>
</body>
</html>`;

      // Update iframe content
      if (iframeRef.current) {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(htmlTemplate);
          iframeDoc.close();
        }
      }

      console.log('Code compiled and rendered successfully');
    } catch (error) {
      console.error('Compilation error:', error);
      setCompilationError(error instanceof Error ? error.message : 'Unknown compilation error');
    } finally {
      setIsLoading(false);
    }
  }, [files, hasFiles, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium text-slate-300">Live Preview</span>
          {isLoading && (
            <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex border border-slate-600 rounded-lg overflow-hidden">
            <Button
              onClick={() => setViewMode('desktop')}
              variant="ghost"
              size="sm"
              className={`px-3 py-1 rounded-none ${
                viewMode === 'desktop' ? 'bg-slate-600 text-white' : 'text-slate-400'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('tablet')}
              variant="ghost"
              size="sm"
              className={`px-3 py-1 rounded-none ${
                viewMode === 'tablet' ? 'bg-slate-600 text-white' : 'text-slate-400'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setViewMode('mobile')}
              variant="ghost"
              size="sm"
              className={`px-3 py-1 rounded-none ${
                viewMode === 'mobile' ? 'bg-slate-600 text-white' : 'text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
            onClick={handleRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {compilationError && (
        <div className="p-4 border-b border-slate-700/50">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div className="text-red-300 text-sm">
              <div className="font-medium mb-1">Compilation Error:</div>
              <div className="font-mono">{compilationError}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Preview Content */}
      <div className="flex-1 bg-slate-900 overflow-auto p-4">
        {!hasFiles ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500">
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No Preview Available</p>
              <p className="text-sm">Generate code through the chat to see a live preview</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-center h-full">
            <div className={`${getViewportClass()} max-w-full border border-slate-700 rounded-lg overflow-hidden bg-white`}>
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="Live Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
