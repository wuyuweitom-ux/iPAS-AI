import React, { useState, useMemo, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ArrowRight, 
  BookOpen, 
  Filter, 
  Sparkles, 
  MessageSquareShare, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  Sliders,
  Shuffle,
  FileQuestion,
  HelpCircle,
  Database,
  Timer,
  Award,
  Search,
  Check,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { ExamQuestion } from '../types';
import { getAllExamQuestions } from '../services/questionBankService';

interface QuestionBankProps {
  onAskTutorWithQuestion: (questionText: string) => void;
}

export type QuizCountMode = 10 | 20 | 50 | 'ALL';

export const QuestionBank: React.FC<QuestionBankProps> = ({
  onAskTutorWithQuestion,
}) => {
  // 取得完整 200 題官方真題 (115-1 雙科 100 題 + 114-4 雙科 100 題)
  const allAvailableQuestions = useMemo(() => getAllExamQuestions(), []);

  // 測驗題數模式：10 題、20 題、50 題 或 全部 (200 題)
  const [quizCountMode, setQuizCountMode] = useState<QuizCountMode>(20);
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedExamSource, setSelectedExamSource] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [onlyMistakes, setOnlyMistakes] = useState<boolean>(false);
  const [randomSeed, setRandomSeed] = useState<number>(1);

  // 模擬考計時器 (60 分鐘倒數)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60 * 60);

  // 作答狀態
  const [userAnswers, setUserAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [submittedStatus, setSubmittedStatus] = useState<Record<string, boolean>>({});
  const [shownHints, setShownHints] = useState<Record<string, boolean>>({});

  // 成果總結彈窗狀態
  const [showExamReport, setShowExamReport] = useState<boolean>(false);

  // 計時器邏輯
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // 1. 條件篩選 (科目、考期、難度、關鍵字、錯題本)
  const basePool = useMemo(() => {
    return allAvailableQuestions.filter((q) => {
      const matchSubject = selectedSubject === 'ALL' || q.subject === selectedSubject;
      const matchDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
      const matchSource =
        selectedExamSource === 'ALL'
          ? true
          : selectedExamSource === '115-1'
          ? q.examSession?.includes('115年第一次')
          : q.examSession?.includes('114年第四次');

      const matchSearch =
        !searchKeyword.trim() ||
        q.question.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        q.options.some((o) => o.text.toLowerCase().includes(searchKeyword.toLowerCase()));

      const matchMistake = !onlyMistakes || (submittedStatus[q.id] && userAnswers[q.id] !== q.answer);

      return matchSubject && matchDiff && matchSource && matchSearch && matchMistake;
    });
  }, [
    allAvailableQuestions,
    selectedSubject,
    selectedDifficulty,
    selectedExamSource,
    searchKeyword,
    onlyMistakes,
    submittedStatus,
    userAnswers,
  ]);

  // 2. 依題數與種子洗牌切出作答清單
  const activeQuestions = useMemo(() => {
    if (quizCountMode === 'ALL') {
      return basePool;
    }
    const poolCopy = [...basePool];
    let s = randomSeed;
    for (let i = poolCopy.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
    }
    return poolCopy.slice(0, Math.min(quizCountMode, poolCopy.length));
  }, [basePool, quizCountMode, randomSeed]);

  // 計分統計
  const totalInSet = activeQuestions.length;
  const currentSetAnswered = activeQuestions.filter((q) => submittedStatus[q.id]).length;
  const currentSetCorrect = activeQuestions.filter(
    (q) => submittedStatus[q.id] && userAnswers[q.id] === q.answer
  ).length;
  const currentSetWrong = currentSetAnswered - currentSetCorrect;
  const accuracy =
    currentSetAnswered > 0 ? Math.round((currentSetCorrect / currentSetAnswered) * 100) : 0;
  const isPassed = accuracy >= 70;

  const handleSelectOption = (questionId: string, optionKey: 'A' | 'B' | 'C' | 'D') => {
    if (submittedStatus[questionId]) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitAnswer = (questionId: string) => {
    if (!userAnswers[questionId]) return;
    setSubmittedStatus((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleSubmitAllAnswers = () => {
    const newStatus = { ...submittedStatus };
    activeQuestions.forEach((q) => {
      if (userAnswers[q.id]) {
        newStatus[q.id] = true;
      }
    });
    setSubmittedStatus(newStatus);
    setIsTimerRunning(false);
    setShowExamReport(true);
  };

  const toggleHint = (questionId: string) => {
    setShownHints((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleShuffleNewQuestions = () => {
    setRandomSeed((prev) => prev + 1);
    setUserAnswers({});
    setSubmittedStatus({});
    setShownHints({});
    setShowExamReport(false);
    setSecondsRemaining(60 * 60);
  };

  const handleResetQuiz = () => {
    if (window.confirm('確定要清除當前作答紀錄嗎？')) {
      setUserAnswers({});
      setSubmittedStatus({});
      setShownHints({});
      setShowExamReport(false);
      setSecondsRemaining(60 * 60);
      setIsTimerRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>全真官方題庫已就緒 (共 {allAvailableQuestions.length} 道公告真題)</span>
              </span>
              <span className="text-xs text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
                115年第一次 & 114年第四次雙科試題
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mt-2 text-slate-100 flex items-center space-x-2">
              <span>iPAS AI 應用規劃師 (初級) 全真模擬題庫與智能評測</span>
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              全數採用經濟部官方初級能力鑑定真實公告題目與官方解答。支援自由切換 <strong className="text-indigo-300">10 題</strong>（通勤精選）、<strong className="text-indigo-300">20 題</strong>（單元強化）或 <strong className="text-indigo-300">50 題</strong>（標準全真模考・60分鐘計時），含詳盡解析、觀念引導與錯題筆記本！
            </p>
          </div>

          {/* Stats & Timer Badges */}
          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {/* Timer */}
            <div className="flex items-center space-x-2 bg-slate-950/80 px-3.5 py-2.5 rounded-xl border border-indigo-900/60 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center space-x-2">
                <Timer className={`w-4 h-4 ${isTimerRunning ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
                <span className="text-sm font-mono font-bold text-slate-100">
                  {formatTime(secondsRemaining)}
                </span>
              </div>
              <button
                onClick={() => setIsTimerRunning((prev) => !prev)}
                className={`text-xs px-2.5 py-1 rounded font-semibold cursor-pointer transition-all ${
                  isTimerRunning
                    ? 'bg-amber-900/70 text-amber-200 border border-amber-700/50 hover:bg-amber-800'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {isTimerRunning ? '暫停計時' : '開始計時'}
              </button>
            </div>

            {/* Scorecard */}
            <div className="flex items-center space-x-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800 w-full sm:w-auto justify-center">
              <div className="text-center px-2.5 border-r border-slate-800">
                <span className="block text-[11px] text-slate-400">已作答</span>
                <span className="text-base font-bold text-white">
                  {currentSetAnswered} / {totalInSet}
                </span>
              </div>
              <div className="text-center px-2.5 border-r border-slate-800">
                <span className="block text-[11px] text-slate-400">正確數</span>
                <span className="text-base font-bold text-emerald-400">{currentSetCorrect}</span>
              </div>
              <div className="text-center px-2.5">
                <span className="block text-[11px] text-slate-400">正確率</span>
                <span className={`text-base font-bold ${accuracy >= 70 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {accuracy}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Count Selector: 10, 20, 50, ALL */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-300 mr-1">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>測驗模式：</span>
            </div>
            {([10, 20, 50, 'ALL'] as QuizCountMode[]).map((mode) => {
              const isSelected = quizCountMode === mode;
              const label =
                mode === 10
                  ? '⚡ 10 題 (通勤快篩)'
                  : mode === 20
                  ? '🎯 20 題 (章節精煉)'
                  : mode === 50
                  ? '🏆 50 題 (全真模考・單科標竿)'
                  : `📚 全部題庫 (${basePool.length} 題)`;
              return (
                <button
                  key={String(mode)}
                  onClick={() => {
                    setQuizCountMode(mode);
                    setUserAnswers({});
                    setSubmittedStatus({});
                    setShownHints({});
                    setShowExamReport(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-700/40 border border-indigo-400 ring-2 ring-indigo-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSubmitAllAnswers}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
              title="立即結算已作答試題並產出成績單"
            >
              <Award className="w-3.5 h-3.5" />
              <span>結算成績單</span>
            </button>

            {quizCountMode !== 'ALL' && (
              <button
                onClick={handleShuffleNewQuestions}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 transition-all cursor-pointer"
                title="重新隨機抽取一組新考題"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>換一組全新 {quizCountMode} 題</span>
              </button>
            )}

            <button
              onClick={handleResetQuiz}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-red-300 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
              title="重設作答"
            >
              <RotateCcw className="w-3 h-3" />
              <span>清空重練</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Subject, Exam Source, Difficulty & Search */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Subject Filter */}
            <div className="flex items-center space-x-1 text-slate-400 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>科目：</span>
            </div>
            {['ALL', '科目一', '科目二'].map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  selectedSubject === subj
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {subj === 'ALL'
                  ? '雙科全部 (200題)'
                  : subj === '科目一'
                  ? '科目一：人工智慧基礎概論'
                  : '科目二：生成式 AI 應用與規劃'}
              </button>
            ))}

            {/* Exam Session Filter */}
            <div className="flex items-center space-x-1 text-slate-400 ml-2 mr-1">
              <span>考試梯次：</span>
            </div>
            {[
              { id: 'ALL', label: '全部梯次' },
              { id: '115-1', label: '115年第一次公告真題 (100題)' },
              { id: '114-4', label: '114年第四次公告真題 (100題)' },
            ].map((src) => (
              <button
                key={src.id}
                onClick={() => setSelectedExamSource(src.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  selectedExamSource === src.id
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {src.label}
              </button>
            ))}

            {/* Difficulty Filter */}
            <div className="flex items-center space-x-1 text-slate-400 ml-2 mr-1">
              <span>難度：</span>
            </div>
            {['ALL', '基礎', '中等', '進階'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {diff === 'ALL' ? '不限' : diff}
              </button>
            ))}

            {/* Mistake filter */}
            <label className="flex items-center space-x-1.5 ml-3 px-2.5 py-1 bg-red-950/40 border border-red-800/50 rounded-md text-red-300 hover:bg-red-950/70 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={onlyMistakes}
                onChange={(e) => setOnlyMistakes(e.target.checked)}
                className="rounded border-red-700 text-red-600 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold">📕 僅看錯題筆記</span>
            </label>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="搜尋關鍵字 (如 SMOTE, MCP, L1, 召回率)..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Exam Result Report Modal */}
      {showExamReport && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-700/60 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPassed ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-600/20 text-amber-400 border border-amber-500/40'}`}>
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  模擬測驗成績結算報告
                </h3>
                <p className="text-xs text-slate-400">
                  依據經濟部 iPAS 能力鑑定評分標準：滿分 100 分，及格標準為 70 分
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowExamReport(false)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg cursor-pointer"
            >
              收合報告
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-xs text-slate-400 mb-1">評鑑得分</span>
              <span className={`text-2xl font-black ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {accuracy} 分
              </span>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-xs text-slate-400 mb-1">判定結果</span>
              <span className={`text-lg font-bold ${isPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPassed ? '🎉 檢定及格' : '💪 尚需補強'}
              </span>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-xs text-slate-400 mb-1">答對題數</span>
              <span className="text-xl font-bold text-emerald-400">{currentSetCorrect} 題</span>
            </div>
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-xs text-slate-400 mb-1">答錯題數</span>
              <span className="text-xl font-bold text-red-400">{currentSetWrong} 題</span>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {activeQuestions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <FileQuestion className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-300">查無符合目前篩選條件的試題</p>
            <p className="text-xs">請嘗試將關鍵字清空，或調整科目為「雙科全部」，即可載入官方試題！</p>
          </div>
        ) : (
          activeQuestions.map((q, index) => {
            const isSubmitted = submittedStatus[q.id];
            const selectedOption = userAnswers[q.id];
            const isCorrect = isSubmitted && selectedOption === q.answer;
            const isHintOpen = shownHints[q.id];

            return (
              <div
                key={q.id}
                className={`bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all ${
                  isSubmitted
                    ? isCorrect
                      ? 'border-emerald-600/50 bg-slate-900/95'
                      : 'border-red-600/50 bg-slate-900/95'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-400 font-bold text-xs flex items-center justify-center border border-slate-700">
                      {index + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                      {q.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {q.topic}
                    </span>
                    {q.examSession && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                        {q.examSession}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        q.difficulty === '基礎'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800/40'
                          : q.difficulty === '中等'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/40'
                          : 'bg-purple-950 text-purple-300 border border-purple-800/40'
                      }`}
                    >
                      難度：{q.difficulty}
                    </span>
                  </div>

                  {isSubmitted && (
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {isCorrect ? (
                        <span className="flex items-center space-x-1 text-emerald-400 font-bold text-sm bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>回答正確</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 text-red-400 font-bold text-sm bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-800/60">
                          <XCircle className="w-4 h-4" />
                          <span>回答錯誤</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Question Body */}
                <p className="text-slate-100 font-medium text-base mb-4 leading-relaxed whitespace-pre-line">
                  {q.question}
                </p>

                {/* Options */}
                <div className="space-y-2 mb-4">
                  {q.options.map((opt) => {
                    const isThisSelected = selectedOption === opt.key;
                    let optionStyle =
                      'bg-slate-800/60 border-slate-700/80 text-slate-200 hover:bg-slate-800 cursor-pointer';

                    if (isSubmitted) {
                      if (opt.key === q.answer) {
                        optionStyle =
                          'bg-emerald-950/80 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (isThisSelected && opt.key !== q.answer) {
                        optionStyle = 'bg-red-950/80 border-red-500 text-red-200 line-through';
                      } else {
                        optionStyle = 'bg-slate-900 border-slate-800 text-slate-500';
                      }
                    } else if (isThisSelected) {
                      optionStyle =
                        'bg-indigo-950/60 border-indigo-500 text-indigo-200 font-semibold ring-1 ring-indigo-500/50';
                    }

                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(q.id, opt.key)}
                        disabled={isSubmitted}
                        className={`w-full text-left p-3 rounded-xl border flex items-center space-x-3 transition-all ${optionStyle}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 border ${
                            isThisSelected
                              ? 'bg-indigo-500 text-slate-900 border-indigo-400'
                              : 'bg-slate-700/50 text-slate-300 border-slate-600'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-sm leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Action Buttons: Submit / Hint / Ask Tutor */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleHint(q.id)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-950/70 border border-amber-800/40 transition-all cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isHintOpen ? '隱藏提示' : '💡 觀念思考提示 (不公布答案)'}</span>
                      {isHintOpen ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() =>
                        onAskTutorWithQuestion(
                          `【向助教請教試題考點】\n題目：${q.question}\n選項：\n${q.options
                            .map((o) => `(${o.key}) ${o.text}`)
                            .join('\n')}\n請問這題的關鍵考點與概念是什麼？能引導我如何推導並避開干擾選項嗎？`
                        )
                      }
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/50 transition-all cursor-pointer"
                    >
                      <MessageSquareShare className="w-3.5 h-3.5" />
                      <span>向 AI 助教深入提問</span>
                    </button>
                  </div>

                  {!isSubmitted ? (
                    <button
                      onClick={() => handleSubmitAnswer(q.id)}
                      disabled={!selectedOption}
                      className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedOption
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-700/30 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>送出作答</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      正確答案：
                      <strong className="text-emerald-400 font-bold text-sm ml-1">
                        ({q.answer})
                      </strong>
                    </span>
                  )}
                </div>

                {/* Socratic Hint Box */}
                {isHintOpen && (
                  <div className="mt-3 p-3.5 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200/90 space-y-1">
                    <div className="font-semibold text-amber-300 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>思考關鍵導引：</span>
                    </div>
                    <p className="leading-relaxed">{q.hint}</p>
                  </div>
                )}

                {/* Detailed Explanation upon Submission */}
                {isSubmitted && (
                  <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
                      <span className="font-semibold text-indigo-300 flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>官方試題精闢解析</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        依據：{q.standardCitation}
                      </span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
