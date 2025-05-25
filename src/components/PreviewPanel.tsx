
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Monitor, Smartphone, Tablet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PreviewPanel = () => {
  const { files } = useProject();
  const [viewMode, setViewMode] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const hasFiles = files.length > 0;

  const getViewportClass = () => {
    switch (viewMode) {
      case 'tablet':
        return 'w-[768px] h-[1024px]';
      case 'mobile':
        return 'w-[375px] h-[667px]';
      default:
        return 'w-full h-full';
    }
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
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 bg-slate-900 overflow-auto">
        {!hasFiles ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-500">
              <Monitor className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No Preview Available</p>
              <p className="text-sm">Generate code through the chat to see a live preview</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <div className={`bg-white rounded-lg shadow-2xl ${getViewportClass()} max-w-full max-h-full`}>
              <div className="w-full h-full rounded-lg border border-slate-300 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center text-slate-600">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">🚀</span>
                  </div>
                  <p className="text-lg font-semibold mb-2">Generated Application</p>
                  <p className="text-sm opacity-70">Your AI-generated app will appear here</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
