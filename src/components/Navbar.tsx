import React from 'react';
import {
  Bot,
  BookOpen,
  HelpCircle,
  Sparkles,
  Key,
  Database,
  Cpu,
} from 'lucide-react';

export type NavTab = 'chat' | 'exam' | 'guide' | 'rag';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasApiKey,
  onOpenApiKeyModal,
}) => {
  return (
    <header className="bg-slate-900 border-b border-indigo-900/40 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 tracking-tight">
                  iPAS
                </span>
                <span className="font-semibold text-slate-100 text-sm sm:text-base">
                  AI 應用規劃師 (初級) 備考助教
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                  200題真題全收錄
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                115年第一次 & 114年第四次公告試題 • 官方學習指引 • 蘇格拉底式引導
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>AI 備考助教</span>
            </button>

            <button
              onClick={() => setActiveTab('exam')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'exam'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>全真考題庫 (200題)</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>考點重點速查</span>
            </button>

            <button
              onClick={() => setActiveTab('rag')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'rag'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>RAG 知識手冊庫</span>
            </button>
          </nav>

          {/* Status Badge & API Key Setting */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                hasApiKey
                  ? 'bg-indigo-950/80 border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60 shadow-sm'
                  : 'bg-amber-950/70 border-amber-700/60 text-amber-300 hover:bg-amber-900/60 animate-pulse'
              }`}
              title="點擊設定個人 Gemini API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{hasApiKey ? 'Gemini Key 已配置' : '設定 API Key'}</span>
              <span className="sm:hidden">{hasApiKey ? '已設Key' : '設Key'}</span>
            </button>

            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span>{hasApiKey ? 'Gemini + RAG 雙引擎' : 'RAG 本地高精檢索'}</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden border-t border-slate-800 py-2 space-x-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI 助教</span>
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'exam'
                ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>真題題庫</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span>考點速查</span>
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'rag'
                ? 'bg-indigo-600/30 text-indigo-300 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>RAG 知識庫</span>
          </button>
        </div>
      </div>
    </header>
  );
};
