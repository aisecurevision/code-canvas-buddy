
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
  error: string | null;
  setError: (error: string | null) => void;
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
  const [error, setError] = useState<string | null>(null);

  const generateProject = async (response: any) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Parse the LLM response to extract components and create file structure
      const appCode = response.code || response.generatedText || '';
      
      // Clean up the code to ensure it's valid React/TypeScript
      let cleanedCode = appCode
        .replace(/```(?:tsx?|jsx?|typescript)\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Validate that we have valid React code
      if (!cleanedCode || cleanedCode.length < 10) {
        throw new Error('Generated code is empty or too short');
      }

      // Ensure the component has proper React imports and exports
      if (!cleanedCode.includes('import React') && !cleanedCode.includes('from \'react\'')) {
        cleanedCode = `import React, { useState } from 'react';\n\n${cleanedCode}`;
      }

      if (!cleanedCode.includes('export default')) {
        cleanedCode += '\n\nexport default App;';
      }

      // Create a complete project structure optimized for Sandpack
      const newFiles: ProjectFile[] = [
        {
          path: 'App.tsx',
          content: cleanedCode,
          type: 'component'
        },
        {
          path: 'index.css',
          content: `@import url('https://cdn.tailwindcss.com');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif;
  line-height: 1.6;
  color: #333;
}

#root {
  min-height: 100vh;
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
              'vite': '^4.0.0'
            }
          }, null, 2),
          type: 'config'
        }
      ];
      
      setFiles(newFiles);
      setSelectedFile(newFiles[0]);
      
      console.log('Project generated successfully with files:', newFiles.map(f => f.path));
      console.log('App.tsx content:', newFiles[0].content);
      
    } catch (error) {
      console.error('Error generating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate project');
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
        error,
        setError,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
