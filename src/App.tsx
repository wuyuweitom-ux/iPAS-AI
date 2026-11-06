/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ChatTutor } from './components/ChatTutor';
import { RagKnowledgeBase } from './components/RagKnowledgeBase';
import { QuestionBank } from './components/QuestionBank';
import { StudyGuide } from './components/StudyGuide';
import { ApiKeyModal } from './components/ApiKeyModal';
import { hasApiKey } from './services/geminiService';
import { ShieldCheck, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const [pendingPromptForChat, setPendingPromptForChat] = useState<string>('');
  const [isKeyConfigured, setIsKeyConfigured] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);

  const checkKeyStatus = () => {
    setIsKeyConfigured(hasApiKey());
  };

  useEffect(() => {
    checkKeyStatus();
  }, []);

  const handleAskTutorWithQuestion = (questionText: string) => {
    setPendingPromptForChat(questionText);
    setActiveTab('chat');
  };

  const handleAskTutorWithTopic = (topicTitle: string, summary: string) => {
    setPendingPromptForChat(
      `【向助教請教重點考點】\n主題：${topicTitle}\n核心概念：${summary}\n\n請針對這個主題，以經濟部 iPAS AI 應用規劃師 (初級) 的考試考核角度，為我深入剖析核心演算法/技術原理、常考情境與容易混淆的干擾選項陷阱！`
    );
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={isKeyConfigured}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      {/* Main Tab Content */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'chat' && (
          <ChatTutor
            initialPrompt={pendingPromptForChat}
            onClearInitialPrompt={() => setPendingPromptForChat('')}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            onOpenRagTab={() => setActiveTab('rag')}
          />
        )}

        {activeTab === 'exam' && (
          <QuestionBank onAskTutorWithQuestion={handleAskTutorWithQuestion} />
        )}

        {activeTab === 'guide' && (
          <StudyGuide onAskTutorWithTopic={handleAskTutorWithTopic} />
        )}

        {activeTab === 'rag' && (
          <RagKnowledgeBase onAskTutorWithQuestion={handleAskTutorWithQuestion} />
        )}
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={checkKeyStatus}
      />

      {/* Sticky Bottom Status Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800/80 py-2.5 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-slate-300 font-semibold">iPAS AI 應用規劃師 (初級) 備考助教系統</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">
              經濟部官方學習指引 • 115-1 & 114-4 雙科 200 題真題全收錄 • 蘇格拉底式引導解析
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>本機端 Zero-Leak 隱私架構：API Key 與 RAG 學習紀錄存於個人本機瀏覽器</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
