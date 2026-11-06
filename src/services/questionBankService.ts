import { ExamQuestion } from '../types';
import { MOCK_QUESTIONS } from '../data/mockQuestions';

/**
 * 取得完整 iPAS AI 應用規劃師 官方真題庫 (200 題完整真題)
 */
export function getAllExamQuestions(): ExamQuestion[] {
  return [...MOCK_QUESTIONS];
}

/**
 * 取得所有可用考期梯次標籤
 */
export function getAvailableSessions(): string[] {
  const sessions = new Set<string>();
  for (const q of MOCK_QUESTIONS) {
    if (q.examSession) {
      sessions.add(q.examSession);
    }
  }
  return Array.from(sessions);
}

/**
 * 取得所有知識領域核心主題
 */
export function getAvailableTopics(subjectFilter?: '科目一' | '科目二' | '全部'): string[] {
  const topics = new Set<string>();
  for (const q of MOCK_QUESTIONS) {
    if (!subjectFilter || subjectFilter === '全部' || q.subject === subjectFilter) {
      if (q.topic) {
        topics.add(q.topic);
      }
    }
  }
  return Array.from(topics);
}

/**
 * 隨機抽取全真模擬考題 (單科標準 50 題，或自訂題數)
 */
export function getRandomSimulationExam(
  subject?: '科目一' | '科目二',
  count: number = 50
): ExamQuestion[] {
  let pool = [...MOCK_QUESTIONS];
  if (subject) {
    pool = pool.filter((q) => q.subject === subject);
  }

  // Fisher-Yates 隨機洗牌
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}

/**
 * 計算測驗得分與統計資訊
 */
export function calculateExamScore(
  userAnswers: Record<string, string>,
  questions: ExamQuestion[]
): {
  score: number;
  correctCount: number;
  totalCount: number;
  isPassed: boolean;
  topicStats: Record<string, { total: number; correct: number }>;
} {
  let correctCount = 0;
  const topicStats: Record<string, { total: number; correct: number }> = {};

  for (const q of questions) {
    const isCorrect = userAnswers[q.id] === q.answer;
    if (isCorrect) correctCount++;

    const topic = q.topic || '一般主題';
    if (!topicStats[topic]) {
      topicStats[topic] = { total: 0, correct: 0 };
    }
    topicStats[topic].total++;
    if (isCorrect) {
      topicStats[topic].correct++;
    }
  }

  const totalCount = questions.length;
  // 滿分 100 分，及格標準 70 分 (iPAS 官方標準)
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
  const isPassed = score >= 70;

  return {
    score,
    correctCount,
    totalCount,
    isPassed,
    topicStats,
  };
}
