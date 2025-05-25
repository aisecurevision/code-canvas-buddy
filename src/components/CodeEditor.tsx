
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Code, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CodeEditor = () => {
  const { selectedFile } = useProject();

  const copyToClipboard = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.content);
    }
  };

  if (!selectedFile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-slate-500">
          <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No File Selected</p>
          <p className="text-sm">Select a file from the explorer to view its code</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-medium text-slate-300">{selectedFile.path}</span>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={copyToClipboard}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm text-slate-300 font-mono leading-relaxed">
          <code>{selectedFile.content}</code>
        </pre>
      </div>
    </div>
  );
};
