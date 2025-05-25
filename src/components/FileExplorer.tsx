
import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { File, Folder, FolderOpen } from 'lucide-react';

export const FileExplorer = () => {
  const { files, selectedFile, setSelectedFile } = useProject();

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
      return <File className="w-4 h-4 text-blue-400" />;
    }
    if (filename.endsWith('.css') || filename.endsWith('.scss')) {
      return <File className="w-4 h-4 text-pink-400" />;
    }
    if (filename.endsWith('.js') || filename.endsWith('.ts')) {
      return <File className="w-4 h-4 text-yellow-400" />;
    }
    return <File className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-4">
        <FolderOpen className="w-5 h-5 text-blue-400" />
        <span className="text-sm font-medium text-slate-300">Project Files</span>
      </div>
      
      <div className="space-y-1">
        {files.length === 0 ? (
          <div className="text-sm text-slate-500 italic">
            No files generated yet. Start a conversation to create your project!
          </div>
        ) : (
          files.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
                selectedFile?.path === file.path
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              {getFileIcon(file.path)}
              <span className="truncate">{file.path}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
