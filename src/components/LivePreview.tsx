
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Play, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { previewService } from '@/services/previewService';

const DEFAULT_CODE = `import React, { useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('');

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        Interactive React Component
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Counter: {count}</h2>
        <button 
          onClick={() => setCount(count + 1)}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Increment
        </button>
        <button 
          onClick={() => setCount(count - 1)}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Decrement
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Name Input:</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            marginRight: '10px'
          }}
        />
        {name && <p>Hello, {name}!</p>}
      </div>

      <div>
        <h3>List Example:</h3>
        <ul>
          {['Apple', 'Banana', 'Orange'].map((fruit, index) => (
            <li key={index} style={{ margin: '5px 0' }}>
              {fruit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;`;

export const LivePreview = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounced preview generation
  const generatePreview = useCallback(async (codeToCompile: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      // First validate the code
      const validation = await previewService.validateCode(codeToCompile);
      if (!validation.success) {
        setError(validation.error || 'Code validation failed');
        setIsGenerating(false);
        return;
      }

      // Generate preview
      const result = await previewService.generatePreview(codeToCompile);
      if (result.success) {
        setPreviewUrl(result.previewUrl);
        setError(null);
      } else {
        setError(result.error || 'Failed to generate preview');
        setPreviewUrl('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setPreviewUrl('');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Debounce effect for auto-update
  useEffect(() => {
    const timer = setTimeout(() => {
      if (code.trim()) {
        generatePreview(code);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, generatePreview]);

  const handleManualRefresh = () => {
    setRefreshKey(prev => prev + 1);
    generatePreview(code);
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Live React Preview
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="text-slate-600 dark:text-slate-300"
          >
            Reset
          </Button>
          <Button
            onClick={handleManualRefresh}
            variant="outline"
            size="sm"
            disabled={isGenerating}
            className="text-slate-600 dark:text-slate-300"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </Button>
          <Button
            onClick={() => generatePreview(code)}
            disabled={isGenerating || !code.trim()}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Error:</span>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal">
          {/* Code Editor Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Code Editor
                </h3>
              </div>
              <div className="flex-1 p-4">
                <Textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full font-mono text-sm resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                  placeholder="Enter your React component code here..."
                  style={{ minHeight: '400px' }}
                />
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Live Preview
                  </h3>
                  {isGenerating && (
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs">Generating...</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-white dark:bg-slate-900">
                {previewUrl ? (
                  <iframe
                    key={refreshKey}
                    src={previewUrl}
                    className="w-full h-full border-none"
                    title="Live Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                    <div className="text-center">
                      <Play className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No Preview Available</p>
                      <p className="text-sm">
                        {error ? 'Fix the errors and try again' : 'Write some React code to see the preview'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};
