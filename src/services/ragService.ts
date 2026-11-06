/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * iPAS 本地端 RAG (Retrieval-Augmented Generation) 檢索增強生成引擎
 * -------------------------------------------------------------------
 * 1. 支援上傳 PDF (.pdf)、純文字 (.txt)、Markdown (.md)、CSV (.csv)、JSON (.json)
 *    之「歷年考古題」與「公版教材」。
 * 2. 採用瀏覽器 IndexedDB 持久化儲存，支援大型公版教材 PDF（不受 LocalStorage 5MB 限制）。
 * 3. 採用 BM25 + 中文字詞 Bi-gram + 淨零專業術語加權混合檢索演算法，毫秒級精準召回。
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import {
  RagChunk,
  RagDocument,
  RagDocCategory,
  RagSearchResult,
  RagCitation,
} from '../types';
import { MOCK_QUESTIONS } from '../data/mockQuestions';
import { STUDY_NOTES } from '../data/studyNotes';
import { PRELOADED_RAG_DOCS, PRELOADED_RAG_CHUNKS } from '../data/preloadedRagDocs';

// 設定 PDF.js Worker 路徑 (由 Vite 本地打包，支援 GitHub Pages 離線與子目錄運行)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const DB_NAME = 'ipas_rag_knowledge_db';
const DB_VERSION = 1;
const DOCS_STORE = 'documents';
const CHUNKS_STORE = 'chunks';

// iPAS AI 應用規劃師高權重核心術語詞典 (用於提升專業考點匹配精準度)
const DOMAIN_KEYWORDS = [
  'transformer',
  'self-attention',
  '自注意力',
  'token',
  'tokenization',
  'embedding',
  '詞嵌入',
  'chunking',
  '文本切分',
  'cnn',
  '卷積神經網路',
  'rnn',
  '循環神經網路',
  'lstm',
  '長短期記憶',
  'gru',
  'relu',
  'softmax',
  'sigmoid',
  '啟動函數',
  'supervised',
  '監督式學習',
  'unsupervised',
  '非監督式學習',
  'reinforcement learning',
  '強化式學習',
  'semi-supervised',
  '半監督式學習',
  'self-supervised',
  '自監督式學習',
  'q-learning',
  'deep q-learning',
  'dqn',
  'l1',
  'l2',
  'lasso',
  'ridge',
  '正則化',
  'regularization',
  'dropout',
  'bias-variance',
  '偏差與變異',
  'overfitting',
  '過度擬合',
  'underfitting',
  '欠擬合',
  '混淆矩陣',
  'confusion matrix',
  'accuracy',
  '準確率',
  'precision',
  '精準率',
  'recall',
  '召回率',
  'f1-score',
  'roc-auc',
  'mse',
  'mae',
  'rmse',
  'lime',
  'shap',
  'counterfactual',
  '反事實解釋',
  'saliency map',
  '顯著性圖',
  'xai',
  '可解釋性',
  'prompt engineering',
  '提示工程',
  'cot',
  'chain of thought',
  '思維鏈',
  'tot',
  'tree of thoughts',
  '思維樹',
  'graph prompting',
  'few-shot',
  'zero-shot',
  'context engineering',
  'no-code',
  'low-code',
  'citizen developer',
  '市民開發者',
  'n8n',
  'rag',
  'retrieval-augmented generation',
  '檢索增強生成',
  'vector database',
  '向量資料庫',
  'retriever',
  'multi-vector',
  'mcp',
  'model context protocol',
  'agentic ai',
  'ai agent',
  'a2a',
  'solution graph',
  '解決方案圖譜',
  'poc',
  'proof of concept',
  '概念驗證',
  'tco',
  'total cost of ownership',
  'roi',
  'token economics',
  'data drift',
  '數據漂移',
  'prompt injection',
  '提示注入',
  'synthid',
  'c2pa',
  '浮水印',
  'federated learning',
  '聯邦學習',
  'homomorphic encryption',
  '同態加密',
  '人工智慧基本法',
  'regulatory sandbox',
  '監理沙盒',
  '金融機構運用人工智慧',
  '評測中心',
  '去識別化',
  'human-in-the-loop',
  '人在迴圈',
  'weak ai',
  'narrow ai',
  'agi',
  '通用人工智慧',
  'asi',
  'peft',
  'lora',
  '低秩適配',
  '知識蒸餾',
  'knowledge distillation',
  '剪枝',
  'pruning',
  '溫度',
  'temperature',
  'top-p',
  'top-k',
  'decoder-only',
  'encoder-decoder',
  'vae',
  '變分自編碼器',
  'gan',
  'diffusion model',
  '擴散模型',
  'smote',
  '特徵交叉',
  'feature cross',
  'one-hot',
  '資料洩漏',
  'data leakage',
  '5v',
  'eda',
  '散佈圖',
  '直方圖',
  '箱型圖',
  '中位數',
  '標準差',
  '四分位距',
  'iqr',
  'z-score',
];

/**
 * 內建預設公版教材與歷屆公告真題 RAG 資料（確保開箱即具備官方知識庫）
 */
function getBuiltInDocsAndChunks(): { docs: RagDocument[]; chunks: RagChunk[] } {
  const docs: RagDocument[] = [
    {
      id: 'builtin-textbook-ai-s1',
      name: '【內建速查講義】科目一：人工智慧基礎概論（全考點精華與法規規範）',
      category: '官方學習指引',
      createdAt: '2026-04-10',
      chunkCount: 8,
      charCount: 9600,
      isBuiltIn: true,
    },
    {
      id: 'builtin-textbook-ai-s2',
      name: '【內建速查講義】科目二：生成式 AI 應用與規劃（架構、提示工程、RAG、MCP 與導入）',
      category: '官方學習指引',
      createdAt: '2026-04-10',
      chunkCount: 7,
      charCount: 9800,
      isBuiltIn: true,
    },
    {
      id: 'builtin-pastexam-ai-all',
      name: '【內建歷屆真題庫】iPAS AI 應用規劃師 115-1 & 114-4 雙科 200 題真題詳解庫',
      category: '歷屆公告試題',
      createdAt: '2026-04-10',
      chunkCount: MOCK_QUESTIONS.length,
      charCount: 42000,
      isBuiltIn: true,
    },
  ];

  const chunks: RagChunk[] = [];

  // 將 STUDY_NOTES 轉入速查講義 Chunks
  STUDY_NOTES.forEach((note, idx) => {
    const docId = note.subject === '科目一' ? 'builtin-textbook-ai-s1' : 'builtin-textbook-ai-s2';
    const docName = note.subject === '科目一' 
      ? '【內建速查講義】科目一：人工智慧基礎概論（全考點精華與法規規範）'
      : '【內建速查講義】科目二：生成式 AI 應用與規劃（架構、提示工程、RAG、MCP 與導入）';

    chunks.push({
      id: `builtin-note-${idx}`,
      docId,
      docName,
      category: '官方學習指引',
      pageOrSection: `重點講義：${note.title}`,
      content: `【${note.subject}・${note.category}】${note.title}\n依據標準：${note.standard}\n摘要核心：${note.summary}\n關鍵重點：\n${note.keyPoints.join('\n')}\n${note.examTrapNotice ? '⚠️ ' + note.examTrapNotice : ''}`,
    });
  });

  // 將 MOCK_QUESTIONS 轉入歷屆真題 Chunks
  MOCK_QUESTIONS.forEach((q, idx) => {
    const optsText = q.options.map((o) => `(${o.key}) ${o.text}`).join(' ');
    chunks.push({
      id: `builtin-q-${idx}`,
      docId: 'builtin-pastexam-ai-all',
      docName: '【內建歷屆真題庫】iPAS AI 應用規劃師 115-1 & 114-4 雙科 200 題真題詳解庫',
      category: '歷屆公告試題',
      pageOrSection: `${q.examSession || ''} ${q.subject} - 第 ${idx % 50 + 1} 題 (${q.topic})`,
      content: `【官方真題】考試梯次：${q.examSession || '歷屆真題'}｜科目：${q.subject}（${q.subjectTitle}）｜主題：${q.topic}\n題目：${q.question}\n選項：${optsText}\n解題提示：${q.hint}\n正確解答：${q.answer}\n詳細解析：${q.explanation}\n出處依據：${q.standardCitation}`,
    });
  });

  return {
    docs: [...PRELOADED_RAG_DOCS, ...docs],
    chunks: [...PRELOADED_RAG_CHUNKS, ...chunks],
  };
}

/**
 * 開啟 IndexedDB 資料庫
 */
function openRagDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DOCS_STORE)) {
        db.createObjectStore(DOCS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CHUNKS_STORE)) {
        const chunkStore = db.createObjectStore(CHUNKS_STORE, { keyPath: 'id' });
        chunkStore.createIndex('docId', 'docId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 取得所有已儲存的 RAG 文件清單 (含內建與使用者上傳)
 */
export async function getAllRagDocuments(): Promise<RagDocument[]> {
  const { docs: builtInDocs } = getBuiltInDocsAndChunks();
  try {
    const db = await openRagDb();
    const userDocs = await new Promise<RagDocument[]>((resolve, reject) => {
      const tx = db.transaction(DOCS_STORE, 'readonly');
      const store = tx.objectStore(DOCS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    // 使用者上傳的排在最前面
    return [...userDocs.reverse(), ...builtInDocs];
  } catch (e) {
    console.warn('IndexedDB read fallback to built-in docs:', e);
    return builtInDocs;
  }
}

/**
 * 取得所有 RAG Chunks (含使用者上傳與內建教材)
 */
export async function getAllRagChunks(): Promise<RagChunk[]> {
  const { chunks: builtInChunks } = getBuiltInDocsAndChunks();
  try {
    const db = await openRagDb();
    const userChunks = await new Promise<RagChunk[]>((resolve, reject) => {
      const tx = db.transaction(CHUNKS_STORE, 'readonly');
      const store = tx.objectStore(CHUNKS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    return [...userChunks, ...builtInChunks];
  } catch {
    return builtInChunks;
  }
}

/**
 * 取得特定文件的所有 Chunks 供預覽
 */
export async function getChunksByDocId(docId: string): Promise<RagChunk[]> {
  const all = await getAllRagChunks();
  return all.filter((c) => c.docId === docId);
}

/**
 * 儲存新上傳的 RAG 文件與切分後的 Chunks 至 IndexedDB
 */
export async function saveRagDocumentAndChunks(
  doc: RagDocument,
  chunks: RagChunk[]
): Promise<void> {
  const db = await openRagDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([DOCS_STORE, CHUNKS_STORE], 'readwrite');
    tx.objectStore(DOCS_STORE).put(doc);
    const chunkStore = tx.objectStore(CHUNKS_STORE);
    for (const chunk of chunks) {
      chunkStore.put(chunk);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * 刪除指定的使用者上傳 RAG 文件及其所有 Chunks
 */
export async function deleteRagDocument(docId: string): Promise<void> {
  const db = await openRagDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([DOCS_STORE, CHUNKS_STORE], 'readwrite');
    tx.objectStore(DOCS_STORE).delete(docId);

    const chunkStore = tx.objectStore(CHUNKS_STORE);
    const index = chunkStore.index('docId');
    const req = index.openCursor(IDBKeyRange.only(docId));
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * 將長文本切分為具重疊區的語意段落 Chunks (支援題目切分與章節切分)
 */
export function splitTextIntoChunks(
  rawText: string,
  docId: string,
  docName: string,
  category: RagDocCategory,
  defaultLabelPrefix = '段落'
): RagChunk[] {
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (!cleaned) return [];

  const chunks: RagChunk[] = [];
  const chunkSize = 550;
  const overlap = 90;

  // 若為考古題，嘗試優先依題號切分 (例如 "1."、"第1題"、"一、")
  const paragraphs = cleaned.split(/\n{2,}/);
  let currentBuffer = '';
  let sectionIndex = 1;

  for (const para of paragraphs) {
    const p = para.trim();
    if (!p) continue;

    if ((currentBuffer + '\n\n' + p).length <= chunkSize) {
      currentBuffer = currentBuffer ? `${currentBuffer}\n\n${p}` : p;
    } else {
      if (currentBuffer) {
        chunks.push({
          id: `${docId}-c-${sectionIndex}`,
          docId,
          docName,
          category,
          pageOrSection: `${defaultLabelPrefix} #${sectionIndex}`,
          content: currentBuffer,
        });
        sectionIndex++;
        const tail = currentBuffer.slice(-overlap);
        currentBuffer = `${tail}\n${p}`;
      } else {
        // 單一段落超長時，依固定長度切分
        let start = 0;
        while (start < p.length) {
          const slice = p.slice(start, start + chunkSize);
          chunks.push({
            id: `${docId}-c-${sectionIndex}`,
            docId,
            docName,
            category,
            pageOrSection: `${defaultLabelPrefix} #${sectionIndex}`,
            content: slice,
          });
          sectionIndex++;
          start += chunkSize - overlap;
        }
        currentBuffer = '';
      }
    }
  }

  if (currentBuffer.trim()) {
    chunks.push({
      id: `${docId}-c-${sectionIndex}`,
      docId,
      docName,
      category,
      pageOrSection: `${defaultLabelPrefix} #${sectionIndex}`,
      content: currentBuffer.trim(),
    });
  }

  return chunks;
}

/**
 * 解析上傳之檔案 (.pdf, .txt, .md, .csv, .json) 為 RAG 文件與 Chunks
 */
export async function parseUploadedFileToRag(
  file: File,
  category: RagDocCategory,
  onProgress?: (msg: string) => void
): Promise<{ doc: RagDocument; chunks: RagChunk[] }> {
  const docId = `user-doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const docName = file.name;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  let chunks: RagChunk[] = [];
  let totalChars = 0;

  if (ext === 'pdf') {
    onProgress?.(`正在載入 PDF 檔案：${file.name}...`);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onProgress?.(`正在解析 PDF 第 ${pageNum} / ${numPages} 頁...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (pageText.length > 15) {
        totalChars += pageText.length;
        // 若單頁超過 650 字，拆分為子片段並保留頁碼
        if (pageText.length <= 650) {
          chunks.push({
            id: `${docId}-p${pageNum}`,
            docId,
            docName,
            category,
            pageOrSection: `第 ${pageNum} 頁`,
            content: pageText,
          });
        } else {
          let start = 0;
          let part = 1;
          while (start < pageText.length) {
            const slice = pageText.slice(start, start + 580);
            chunks.push({
              id: `${docId}-p${pageNum}-${part}`,
              docId,
              docName,
              category,
              pageOrSection: `第 ${pageNum} 頁 (片段 ${part})`,
              content: slice,
            });
            part++;
            start += 490;
          }
        }
      }
    }

    if (chunks.length === 0) {
      throw new Error(
        `無法從「${file.name}」提取文字內容。請確認該 PDF 為文字型 PDF（非純掃描圖片檔）。`
      );
    }
  } else if (ext === 'json') {
    onProgress?.(`正在解析 JSON 題庫/教材：${file.name}...`);
    const raw = await file.text();
    totalChars = raw.length;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((item, idx) => {
          const text =
            typeof item === 'string'
              ? item
              : JSON.stringify(item, null, 2);
          chunks.push({
            id: `${docId}-json-${idx + 1}`,
            docId,
            docName,
            category,
            pageOrSection: `條目 #${idx + 1}`,
            content: text,
          });
        });
      } else {
        chunks = splitTextIntoChunks(raw, docId, docName, category, 'JSON 段落');
      }
    } catch {
      chunks = splitTextIntoChunks(raw, docId, docName, category, '段落');
    }
  } else {
    // .txt, .md, .csv 等純文字檔案
    onProgress?.(`正在解析文字教材：${file.name}...`);
    const raw = await file.text();
    totalChars = raw.length;
    chunks = splitTextIntoChunks(
      raw,
      docId,
      docName,
      category,
      category === '歷屆公告試題' ? '考題段落' : '教材章節'
    );
  }

  const doc: RagDocument = {
    id: docId,
    name: docName,
    category,
    createdAt: new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    chunkCount: chunks.length,
    charCount: totalChars,
    isBuiltIn: false,
  };

  await saveRagDocumentAndChunks(doc, chunks);
  return { doc, chunks };
}

/**
 * 將使用者手動貼上的文字新增至 RAG 知識庫
 */
export async function addCustomTextToRag(
  title: string,
  category: RagDocCategory,
  textContent: string
): Promise<{ doc: RagDocument; chunks: RagChunk[] }> {
  const docId = `user-paste-${Date.now()}`;
  const chunks = splitTextIntoChunks(
    textContent,
    docId,
    title.trim(),
    category,
    category === '歷屆公告試題' ? '考題段落' : '教材段落'
  );

  const doc: RagDocument = {
    id: docId,
    name: title.trim(),
    category,
    createdAt: new Date().toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    chunkCount: chunks.length,
    charCount: textContent.length,
    isBuiltIn: false,
  };

  await saveRagDocumentAndChunks(doc, chunks);
  return { doc, chunks };
}

/**
 * 將查詢字串切分為檢索 Token (支援中文字元 Bi-gram + 英文數字詞彙 + 領域專有名詞)
 */
function tokenizeForSearch(text: string): string[] {
  const normalized = text.toLowerCase().trim();
  const tokens = new Set<string>();

  // 1. 提取領域核心關鍵詞
  for (const kw of DOMAIN_KEYWORDS) {
    if (normalized.includes(kw)) {
      tokens.add(kw);
    }
  }

  // 2. 提取英文與數字組合 (如 iso, 14064-1, 14067, cbam, ar5, gwp, 2050, r-134a)
  const alphaNumMatches = normalized.match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) || [];
  for (const m of alphaNumMatches) {
    if (m.length >= 2) {
      tokens.add(m);
    }
  }

  // 3. 提取中文連續字詞並產生 2-gram 與 3-gram (排除常見無意義虛詞)
  const stopWords = new Set([
    '請問',
    '什麼',
    '如何',
    '為什麼',
    '可以',
    '一個',
    '哪些',
    '下列',
    '何者',
    '關於',
    '依據',
    '根據',
    '我們',
    '你們',
    '這個',
    '那個',
    '是否',
    '進行',
    '請教',
    '助教',
    '告訴',
    '答案',
    '題目',
    '選項',
  ]);

  const cjkBlocks = normalized.match(/[\u4e00-\u9fa5]{2,}/g) || [];
  for (const block of cjkBlocks) {
    for (let i = 0; i < block.length - 1; i++) {
      const bigram = block.slice(i, i + 2);
      if (!stopWords.has(bigram)) {
        tokens.add(bigram);
      }
    }
    for (let i = 0; i < block.length - 2; i++) {
      const trigram = block.slice(i, i + 3);
      tokens.add(trigram);
    }
  }

  return Array.from(tokens);
}

/**
 * RAG 核心檢索函數：從所有已上傳與內建的「公版教材」及「歷年考古題」中檢索最相關的段落
 */
export async function retrieveRagContext(
  query: string,
  topK = 4
): Promise<{
  results: RagSearchResult[];
  citations: RagCitation[];
  hasRagMatch: boolean;
  formattedPromptContext: string;
}> {
  const allChunks = await getAllRagChunks();
  const queryTokens = tokenizeForSearch(query);

  if (queryTokens.length === 0 || allChunks.length === 0) {
    return { results: [], citations: [], hasRagMatch: false, formattedPromptContext: '' };
  }

  const scoredResults: RagSearchResult[] = [];

  for (const chunk of allChunks) {
    const contentLower = `${chunk.docName} ${chunk.pageOrSection} ${chunk.content}`.toLowerCase();
    let score = 0;
    const matchedTerms: string[] = [];

    for (const token of queryTokens) {
      if (contentLower.includes(token)) {
        matchedTerms.push(token);
        // 領域專有名詞與 3-gram 給予更高權重
        const isDomainTerm = DOMAIN_KEYWORDS.includes(token);
        const weight = isDomainTerm ? 4.5 : token.length >= 3 ? 2.5 : 1.2;

        // 計算出現頻率加成 (BM25 飽和概念)
        const occurrences = contentLower.split(token).length - 1;
        const tfBoost = Math.min(2.2, 1 + Math.log1p(occurrences));
        score += weight * tfBoost;
      }
    }

    // 使用者自行上傳的文件與預載入之 115 年官方公告考古題給予優先權重加成，確保優先引用官方真題與上傳教材
    if (!chunk.docId.startsWith('builtin-')) {
      score *= 1.3;
    }

    if (score >= 3.2 && matchedTerms.length >= 2) {
      scoredResults.push({
        chunk,
        score: Math.round(score * 10) / 10,
        matchedTerms: Array.from(new Set(matchedTerms)).slice(0, 8),
      });
    }
  }

  scoredResults.sort((a, b) => b.score - a.score);
  const topResults = scoredResults.slice(0, topK);

  const citations: RagCitation[] = topResults.map((r) => ({
    chunkId: r.chunk.id,
    docName: r.chunk.docName,
    category: r.chunk.category,
    pageOrSection: r.chunk.pageOrSection,
    snippet:
      r.chunk.content.length > 220
        ? r.chunk.content.slice(0, 220) + '...'
        : r.chunk.content,
    score: r.score,
  }));

  const formattedPromptContext =
    topResults.length > 0
      ? `【本地 RAG 知識庫檢索結果（共 ${topResults.length} 處高關聯教材/考古題段落）】：\n` +
        topResults
          .map(
            (r, idx) =>
              `--- [檢索段落 ${idx + 1}] 出處：《${r.chunk.docName}》(${r.chunk.category} - ${r.chunk.pageOrSection}) ---\n${r.chunk.content}`
          )
          .join('\n\n')
      : '';

  return {
    results: topResults,
    citations,
    hasRagMatch: topResults.length > 0,
    formattedPromptContext,
  };
}

/**
 * 便捷上傳檔案並回傳建立之 RagDocument
 */
export async function uploadFileToRag(
  file: File,
  category: RagDocCategory,
  onProgress?: (msg: string) => void
): Promise<RagDocument> {
  const { doc } = await parseUploadedFileToRag(file, category, onProgress);
  return doc;
}

/**
 * 清除所有使用者自行上傳的 RAG 文件與段落（保留系統內建核心教材與題庫）
 */
export async function clearUserUploadedRag(): Promise<void> {
  const db = await openRagDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([DOCS_STORE, CHUNKS_STORE], 'readwrite');
    tx.objectStore(DOCS_STORE).clear();
    tx.objectStore(CHUNKS_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * 匯出使用者已上傳的所有 RAG 文件與段落為 JSON 知識包檔案
 * 方便備份、分享給其他考生，或交由開發者寫入預設啟動知識庫
 */
export async function exportUserRagBundle(): Promise<void> {
  const db = await openRagDb();
  const docs = await new Promise<RagDocument[]>((resolve, reject) => {
    const req = db.transaction(DOCS_STORE, 'readonly').objectStore(DOCS_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
  const chunks = await new Promise<RagChunk[]>((resolve, reject) => {
    const req = db.transaction(CHUNKS_STORE, 'readonly').objectStore(CHUNKS_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    docs,
    chunks,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `iPAS_RAG_知識庫備份包_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 匯入先前匯出的 RAG JSON 知識包檔案
 */
export async function importUserRagBundle(
  file: File
): Promise<{ importedDocs: number; importedChunks: number }> {
  const raw = await file.text();
  const parsed = JSON.parse(raw);
  if (!parsed || !Array.isArray(parsed.docs) || !Array.isArray(parsed.chunks)) {
    throw new Error('非有效的 iPAS RAG 知識包格式（缺少 docs 或 chunks 欄位）');
  }

  const db = await openRagDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([DOCS_STORE, CHUNKS_STORE], 'readwrite');
    const docStore = tx.objectStore(DOCS_STORE);
    const chunkStore = tx.objectStore(CHUNKS_STORE);
    for (const d of parsed.docs) {
      docStore.put({ ...d, isBuiltIn: false });
    }
    for (const c of parsed.chunks) {
      chunkStore.put(c);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  return {
    importedDocs: parsed.docs.length,
    importedChunks: parsed.chunks.length,
  };
}


