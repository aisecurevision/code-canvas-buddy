
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Monitor, Smartphone, Tablet, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PreviewPanel = () => {
  const { files } = useProject();
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  
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

  // Generate HTML document for preview
  const generatePreviewHTML = React.useMemo(() => {
    if (!hasFiles) return null;
    
    try {
      setPreviewError(null);
      
      // Find the main App component
      const appFile = files.find(file => file.path === 'App.tsx');
      if (!appFile) {
        setPreviewError('No App.tsx file found');
        return null;
      }

      // Extract CSS content
      const cssFile = files.find(file => file.path === 'index.css');
      const cssContent = cssFile?.content || '';

      // Transform the React code to work in browser
      let appCode = appFile.content;
      
      // Remove TypeScript types and interfaces for browser compatibility
      appCode = appCode
        .replace(/: React\.FC\s*(<[^>]*>)?\s*=/g, ' =')
        .replace(/: string/g, '')
        .replace(/: number/g, '')
        .replace(/: boolean/g, '')
        .replace(/: React\.FormEvent<[^>]*>/g, '')
        .replace(/: React\.ChangeEvent<[^>]*>/g, '')
        .replace(/interface\s+\w+\s*{[^}]*}/g, '')
        .replace(/type\s+\w+\s*=[^;]*;/g, '');

      // Create the complete HTML document
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${cssContent}
        body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
        }
        * {
            box-sizing: border-box;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, Fragment } = React;
        
        ${appCode}
        
        // Render the app
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        
        try {
            root.render(React.createElement(App));
        } catch (error) {
            console.error('Preview Error:', error);
            root.render(
                React.createElement('div', {
                    style: {
                        padding: '20px',
                        backgroundColor: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        margin: '20px',
                        color: '#991b1b'
                    }
                }, 
                React.createElement('h3', {}, 'Preview Error'),
                React.createElement('p', {}, error.message || 'Failed to render component'),
                React.createElement('pre', {
                    style: { fontSize: '12px', marginTop: '10px', overflow: 'auto' }
                }, error.stack || '')
                )
            );
        }
    </script>
</body>
</html>`;

      return htmlContent;
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewError(error instanceof Error ? error.message : 'Unknown error generating preview');
      return null;
    }
  }, [files, hasFiles, refreshKey]);

  const previewUrl = React.useMemo(() => {
    if (!generatePreviewHTML) return null;
    
    const blob = new Blob([generatePreviewHTML], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [generatePreviewHTML]);

  // Cleanup blob URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setPreviewError(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Monitor className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium text-slate-300">Live Preview</span>
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
        ) : previewError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-lg font-medium text-red-300 mb-2">Preview Error</h3>
                <p className="text-sm text-red-200">{previewError}</p>
                <Button
                  onClick={handleRefresh}
                  className="mt-4 bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="flex items-start justify-center h-full">
            <div className={`${getViewportClass()} max-w-full border border-slate-700 rounded-lg overflow-hidden bg-white`}>
              <iframe
                key={refreshKey}
                src={previewUrl}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="App Preview"
                onError={() => setPreviewError('Failed to load preview iframe')}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500">
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
              <p className="text-lg font-medium mb-2">Generating Preview...</p>
              <p className="text-sm">Please wait while we prepare your app</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
