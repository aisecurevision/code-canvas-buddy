
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProjectFile {
  path: string;
  content: string;
  type: 'component' | 'style' | 'config' | 'other';
}

interface ProjectContextType {
  files: ProjectFile[];
  selectedFile: ProjectFile | null;
  setSelectedFile: (file: ProjectFile) => void;
  generateProject: (code: string, fileStructure: any) => Promise<void>;
  isGenerating: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateProject = async (code: string, fileStructure: any) => {
    setIsGenerating(true);
    
    try {
      // Simulate processing the generated code and files
      const newFiles: ProjectFile[] = [
        {
          path: 'App.tsx',
          content: code,
          type: 'component'
        },
        {
          path: 'index.css',
          content: `
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
          `.trim(),
          type: 'style'
        },
        {
          path: 'package.json',
          content: JSON.stringify({
            name: 'generated-app',
            version: '1.0.0',
            dependencies: {
              'react': '^18.0.0',
              'react-dom': '^18.0.0',
              'tailwindcss': '^3.0.0'
            }
          }, null, 2),
          type: 'config'
        }
      ];
      
      setFiles(newFiles);
      setSelectedFile(newFiles[0]);
      
    } catch (error) {
      console.error('Error generating project:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        files,
        selectedFile,
        setSelectedFile,
        generateProject,
        isGenerating,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
