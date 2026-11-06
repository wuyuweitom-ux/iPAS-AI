import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Calculator, 
  FileCheck, 
  ShieldCheck,
  Scale,
  Sparkles,
  AlertTriangle,
  Cpu,
  Layers,
  ChevronRight,
  MessageSquareShare,
  Network,
  Binary,
  ShieldAlert,
} from 'lucide-react';
import { STUDY_NOTES } from '../data/studyNotes';

interface StudyGuideProps {
  onAskTutorWithTopic?: (topicTitle: string, summary: string) => void;
}

export const StudyGuide: React.FC<StudyGuideProps> = ({ onAskTutorWithTopic }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<'ALL' | '科目一' | '科目二'>('ALL');

  const filteredNotes = STUDY_NOTES.filter((note) => {
    const matchSubject = selectedSubject === 'ALL' || note.subject === selectedSubject;
    const matchSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.standard.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.keyPoints.some((kp) => kp.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSubject && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            經濟部官方學習指引 • 雙科考點精華速記
          </span>
          <span className="text-xs text-cyan-300 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
            涵蓋 15 大必考模組 • 混淆矩陣 • Transformer • MCP 協議 • AI 基本法
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mt-2 text-slate-100 flex items-center space-x-2">
          <span>iPAS AI 應用規劃師 (初級) 核心考點速查圖譜</span>
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          精準對標經濟部產業人才能力鑑定考試大綱：科目一（AI概念與人在迴圈、資料前處理與防洩漏、機器學習三大範式、CNN/RNN/Transformer神經網路、混淆矩陣指標、XAI可解釋性、行政院《人工智慧基本法》草案）；科目二（No-Code/Low-Code治理、Decoder-only模型、提示工程CoT/ToT/Graph、RAG架構、Agentic AI與MCP通訊協議、PoC評估、TCO/ROI計算、SynthID浮水印與資安防護）。
        </p>

        {/* Search & Subject Filter */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: `全部重點講義 (${STUDY_NOTES.length}篇)` },
              { id: '科目一', label: '科目一：人工智慧基礎概論' },
              { id: '科目二', label: '科目二：生成式 AI 應用與規劃' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedSubject(item.id as 'ALL' | '科目一' | '科目二')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedSubject === item.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-700/40 border border-indigo-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜尋 MCP、LoRA、L1、召回率、基本法..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Formula Strip (4 大 AI 核心公式與速查口訣) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: 混淆矩陣 */}
        <div className="bg-slate-900 border border-indigo-800/40 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-indigo-400 mb-1">
              <Calculator className="w-4 h-4" />
              <span className="font-bold text-xs">分類指標黃金公式</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-indigo-300 mb-1 leading-relaxed">
              Recall = TP/(TP+FN)<br />
              Precision = TP/(TP+FP)<br />
              F1 = 2PR / (P + R)
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            癌症漏診/洗錢異常首重 <strong className="text-emerald-400">Recall (召回率)</strong>；垃圾郵件首重 Precision。
          </p>
        </div>

        {/* Card 2: 正則化口訣 */}
        <div className="bg-slate-900 border border-cyan-800/40 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-cyan-400 mb-1">
              <Binary className="w-4 h-4" />
              <span className="font-bold text-xs">L1 vs L2 正則化口訣</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-cyan-300 mb-1 leading-relaxed">
              L1 (Lasso)：|w| 絕對值 ➔ 稀疏 0<br />
              L2 (Ridge)：w² 平方和 ➔ 平滑縮減
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            L1 具備特徵挑選功能，促使不重要特徵權重精確歸零產生稀疏解。
          </p>
        </div>

        {/* Card 3: MCP 協議 */}
        <div className="bg-slate-900 border border-purple-800/40 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-purple-400 mb-1">
              <Network className="w-4 h-4" />
              <span className="font-bold text-xs">Anthropic MCP 標準流程</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-purple-300 mb-1 leading-relaxed">
              Host ➔ Client ➔ Server ➔ 外部工具
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            MCP 主打「動態外部工具與 API 連接」；RAG 主打「靜態知識庫向量檢索」。
          </p>
        </div>

        {/* Card 4: ROI 回收期 */}
        <div className="bg-slate-900 border border-emerald-800/40 rounded-xl p-3.5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-400 mb-1">
              <Scale className="w-4 h-4" />
              <span className="font-bold text-xs">ROI 與投資回收期算式</span>
            </div>
            <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[11px] text-emerald-300 mb-1 leading-relaxed">
              月節省 = 原人工成本 - AI API費用<br />
              回收期 = 初期系統整合費 / 月節省
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            如月省 29,040 元，20 萬元整合費回收期 = 200,000 / 29,040 ≈ 7 個月。
          </p>
        </div>
      </div>

      {/* Notes Cards with Full Tables */}
      <div className="space-y-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all"
          >
            {/* Note Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                    {note.subject}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {note.category}
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">{note.standard}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mt-1 flex items-center space-x-2">
                  <span>{note.title}</span>
                </h3>
              </div>

              {onAskTutorWithTopic && (
                <button
                  onClick={() => onAskTutorWithTopic(note.title, note.summary)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-800/40 transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <MessageSquareShare className="w-3.5 h-3.5" />
                  <span>請教助教此考點</span>
                </button>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{note.summary}</p>

            {/* Key Bullet Points */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
              <span className="text-xs font-semibold text-indigo-400 flex items-center space-x-1 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>官方學習指引核心必考重點：</span>
              </span>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                {note.keyPoints.map((kp, kIdx) => (
                  <li key={kIdx} className="leading-relaxed">{kp}</li>
                ))}
              </ul>
            </div>

            {/* Table if exists */}
            {note.tableHeaders && note.tableRows && (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                    <tr>
                      {note.tableHeaders.map((th, thIdx) => (
                        <th key={thIdx} className="px-4 py-3">
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 text-xs">
                    {note.tableRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 whitespace-nowrap sm:whitespace-normal">
                            {cIdx === 0 ? (
                              <strong className="text-indigo-300">{cell}</strong>
                            ) : cIdx === row.length - 1 && cell.includes('【') ? (
                              <span className="text-amber-400 font-semibold">{cell}</span>
                            ) : (
                              <span className="text-slate-300">{cell}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Exam Trap Alert Notice */}
            {note.examTrapNotice && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-amber-300 font-semibold">真題常考陷阱避雷針：</strong>
                  <span>{note.examTrapNotice}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
