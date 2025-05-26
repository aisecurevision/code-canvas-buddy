
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sandpack } from '@codesandbox/sandpack-react';

export const PreviewPanel = () => {
  const { files } = useProject();
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [refreshKey, setRefreshKey] = React.useState(0);
  
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

  // Convert our files to Sandpack format
  const sandpackFiles = React.useMemo(() => {
    if (!hasFiles) return {};
    
    const convertedFiles: Record<string, string> = {};
    
    files.forEach(file => {
      // Map our file paths to Sandpack expected paths
      let sandpackPath = file.path;
      
      if (file.path === 'App.tsx') {
        sandpackPath = '/App.tsx';
      } else if (file.path === 'main.tsx') {
        sandpackPath = '/index.tsx';
      } else if (file.path === 'index.css') {
        sandpackPath = '/index.css';
      } else if (file.path === 'package.json') {
        sandpackPath = '/package.json';
      } else {
        sandpackPath = `/${file.path}`;
      }
      
      convertedFiles[sandpackPath] = file.content;
    });

    // Ensure we have the required index.tsx entry point
    if (!convertedFiles['/index.tsx']) {
      convertedFiles['/index.tsx'] = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}`;
    }

    // Ensure we have basic CSS if none provided
    if (!convertedFiles['/index.css']) {
      convertedFiles['/index.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.5;
}`;
    }

    return convertedFiles;
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
        ) : (
          <div className="flex items-start justify-center h-full">
            <div className={`${getViewportClass()} max-w-full border border-slate-700 rounded-lg overflow-hidden`}>
              <Sandpack
                key={refreshKey}
                template="react-ts"
                files={sandpackFiles}
                theme="dark"
                options={{
                  showConsole: false,
                  showRefreshButton: false,
                  showNavigator: false,
                  editorHeight: 0,
                  editorWidthPercentage: 0,
                  wrapContent: true,
                  autorun: true,
                  autoReload: true,
                }}
                customSetup={{
                  dependencies: {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0",
                    "tailwindcss": "^3.3.0"
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
