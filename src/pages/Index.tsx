
import React, { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { CodeEditor } from '@/components/CodeEditor';
import { PreviewPanel } from '@/components/PreviewPanel';
import { FileExplorer } from '@/components/FileExplorer';
import { Header } from '@/components/Header';
import { ProjectProvider } from '@/contexts/ProjectContext';

const Index = () => {
  const [activePanel, setActivePanel] = useState<'chat' | 'code' | 'preview'>('chat');

  return (
    <ProjectProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Header />
        
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar */}
          <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700/50">
            <div className="flex flex-col h-full">
              <div className="flex border-b border-slate-700/50">
                <button
                  onClick={() => setActivePanel('chat')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activePanel === 'chat'
                      ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActivePanel('code')}
                  className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                    activePanel === 'code'
                      ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  Code
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {activePanel === 'chat' && <ChatInterface />}
                {activePanel === 'code' && <FileExplorer />}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex border-b border-slate-700/50">
              <button
                onClick={() => setActivePanel('code')}
                className={`py-3 px-6 text-sm font-medium transition-colors ${
                  activePanel === 'code'
                    ? 'bg-purple-600/20 text-purple-400 border-b-2 border-purple-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                Code Editor
              </button>
              <button
                onClick={() => setActivePanel('preview')}
                className={`py-3 px-6 text-sm font-medium transition-colors ${
                  activePanel === 'preview'
                    ? 'bg-green-600/20 text-green-400 border-b-2 border-green-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                Live Preview
              </button>
            </div>
            
            <div className="flex-1 bg-slate-900/50">
              {activePanel === 'code' && <CodeEditor />}
              {activePanel === 'preview' && <PreviewPanel />}
            </div>
          </div>
        </div>
      </div>
    </ProjectProvider>
  );
};

export default Index;
