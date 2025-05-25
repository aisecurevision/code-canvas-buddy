
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
  generateProject: (response: any) => Promise<void>;
  isGenerating: boolean;
  projectName: string;
  setProjectName: (name: string) => void;
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
  const [projectName, setProjectName] = useState('Generated App');

  const generateProject = async (response: any) => {
    setIsGenerating(true);
    
    try {
      // Parse the LLM response to extract components and create file structure
      const appCode = response.code || response.generatedText || '';
      
      // Create a complete project structure
      const newFiles: ProjectFile[] = [
        {
          path: 'App.tsx',
          content: appCode,
          type: 'component'
        },
        {
          path: 'main.tsx',
          content: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);`,
          type: 'component'
        },
        {
          path: 'index.html',
          content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
          type: 'other'
        },
        {
          path: 'index.css',
          content: `@tailwind base;
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
}`,
          type: 'style'
        },
        {
          path: 'package.json',
          content: JSON.stringify({
            name: projectName.toLowerCase().replace(/\s+/g, '-'),
            version: '1.0.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview'
            },
            dependencies: {
              'react': '^18.2.0',
              'react-dom': '^18.2.0'
            },
            devDependencies: {
              '@types/react': '^18.2.0',
              '@types/react-dom': '^18.2.0',
              '@vitejs/plugin-react': '^4.0.0',
              'typescript': '^5.0.0',
              'vite': '^4.0.0',
              'tailwindcss': '^3.3.0',
              'autoprefixer': '^10.4.0',
              'postcss': '^8.4.0'
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
        projectName,
        setProjectName,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
