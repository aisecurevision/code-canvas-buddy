
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share, Settings, Github } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

export const Header = () => {
  const { files, projectName } = useProject();
  
  const handleExport = () => {
    if (files.length === 0) return;
    
    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.path;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <header className="h-16 bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CodeCraft AI
          </h1>
        </div>
        
        <div className="h-6 w-px bg-slate-600" />
        
        <div className="text-sm text-slate-400">
          <span className="text-green-400">●</span> Connected to LM Studio
        </div>

        {projectName && (
          <>
            <div className="h-6 w-px bg-slate-600" />
            <div className="text-sm text-slate-300 font-medium">
              {projectName}
            </div>
          </>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
          <Github className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
          <Share className="w-4 h-4" />
        </Button>
        <Button 
          onClick={handleExport}
          disabled={files.length === 0}
          size="sm" 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
    </header>
  );
};
