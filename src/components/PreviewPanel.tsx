
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PreviewPanel = () => {
  const { files } = useProject();
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = React.useState(0);
  
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

  // Create a blob URL for the preview
  const createPreviewUrl = React.useMemo(() => {
    if (!hasFiles) return null;
    
    const appFile = files.find(file => file.path === 'App.tsx');
    const indexCss = files.find(file => file.path === 'index.css');
    
    if (!appFile) return null;

    // Create a complete HTML document with React
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
        ${indexCss?.content || `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.5; }
          #root { min-height: 100vh; }
        `}
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useRef, useCallback, useMemo } = React;
        
        // Transform the App component code
        ${appFile.content.replace('export default App;', '')}
        
        // Render the app
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        root.render(React.createElement(App));
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [files, hasFiles, previewKey]);

  const handleRefresh = () => {
    setPreviewKey(prev => prev + 1);
  };

  // Clean up blob URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (createPreviewUrl) {
        URL.revokeObjectURL(createPreviewUrl);
      }
    };
  }, [createPreviewUrl]);

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
        ) : createPreviewUrl ? (
          <div className="flex items-start justify-center h-full">
            <div className={`${getViewportClass()} max-w-full border border-slate-700 rounded-lg overflow-hidden bg-white`}>
              <iframe
                key={previewKey}
                src={createPreviewUrl}
                className="w-full h-full"
                title="Preview"
                sandbox="allow-scripts allow-same-origin"
                style={{ border: 'none' }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500">
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">Preview Error</p>
              <p className="text-sm">Unable to generate preview from current files</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
