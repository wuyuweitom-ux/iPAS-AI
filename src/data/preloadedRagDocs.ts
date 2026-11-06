import { RagDocument, RagChunk } from '../types';

export const PRELOADED_RAG_DOCS: RagDocument[] = [
  {
    "id": "preload-ipas-ai-s1-guide",
    "name": "經濟部 iPAS 初級能力鑑定學習指引【科目一：人工智慧基礎概論】官方核心指引",
    "category": "官方學習指引",
    "createdAt": "經濟部產業人才能力鑑定推動小組最新版",
    "chunkCount": 8,
    "charCount": 16800,
    "isBuiltIn": true
  },
  {
    "id": "preload-ipas-ai-s2-guide",
    "name": "經濟部 iPAS 初級能力鑑定學習指引【科目二：生成式 AI 應用與規劃】官方核心指引",
    "category": "官方學習指引",
    "createdAt": "經濟部產業人才能力鑑定推動小組最新版",
    "chunkCount": 8,
    "charCount": 17200,
    "isBuiltIn": true
  },
  {
    "id": "preload-moda-ai-handbook",
    "name": "數位發展部《公部門人工智慧應用參考手冊》與 AI 評測中心指引",
    "category": "政策法規與手冊",
    "createdAt": "數位發展部 (MODA) 公告標準",
    "chunkCount": 6,
    "charCount": 12500,
    "isBuiltIn": true
  },
  {
    "id": "preload-seed-course-slides",
    "name": "產業 AI 人才種子培訓教材精華 (工程實務、電腦視覺、NLP 與企業導入)",
    "category": "種子師資實務教材",
    "createdAt": "產業 AI 種子培訓系列教材",
    "chunkCount": 6,
    "charCount": 13400,
    "isBuiltIn": true
  },
  {
    "id": "preload-exam-115-1",
    "name": "【115年第一次公告真題】雙科 100 題完整題庫與官方標準解答庫",
    "category": "歷屆公告試題",
    "createdAt": "115/03/21 官方公告試題",
    "chunkCount": 10,
    "charCount": 22000,
    "isBuiltIn": true
  },
  {
    "id": "preload-exam-114-4",
    "name": "【114年第四次公告真題】雙科 100 題完整題庫與官方標準解答庫",
    "category": "歷屆公告試題",
    "createdAt": "114/11/01 官方公告試題",
    "chunkCount": 10,
    "charCount": 23100,
    "isBuiltIn": true
  }
];

export const PRELOADED_RAG_CHUNKS: RagChunk[] = [
  {
    "id": "chunk-s1-concepts",
    "docId": "preload-ipas-ai-s1-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目一：人工智慧基礎概論】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 3.1 節 人工智慧概念與能力範疇",
    "content": "【人工智慧定義與能力層級分類】：\n1. 弱 AI (Weak / Narrow AI)：專注於特定單一受限任務，藉由演算法優化特定指標 (如電路板瑕疵視覺檢測、AlphaGo、推薦系統)。現行商業與工業部署之 AI 皆屬弱 AI。\n2. 強 AI (Strong AI / AGI, 通用人工智慧)：具備如同人類之全面性推理、常識學習與自適應跨領域解決未知問題之能力，目前尚處於前沿研究探索階段。\n3. 超級 AI (ASI)：在全方位智慧、科學創造與決策能力上超越人類大腦之假想型智能。\n4. 功能型劃分：分析型 AI (洞察隱含規律與分佈)、預測型 AI (基於歷史數據推算未來趨勢，如房價或銷售量預測)、生成型 AI (依據提示詞產生多媒體與程式碼)。\n5. 人在迴圈 (Human-in-the-loop) 治理監督機制：\n   - Human-in-the-loop (人在迴圈內)：每一步行動執行前均須經人類審查確認。\n   - Human-over-the-loop (人在迴圈上)：人類日常監督，AI 具自主運行能力，但人類可於異常時立即介入干預中斷。\n   - Human-out-of-the-loop (人在迴圈外)：完全自主運作，人類不介入。"
  },
  {
    "id": "chunk-s1-data-prep",
    "docId": "preload-ipas-ai-s1-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目一：人工智慧基礎概論】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 3.2 節 資料前處理與特徵工程",
    "content": "【資料整理與特徵工程規範】：\n1. 大數據 5V 特性：Volume (大量)、Velocity (高速/即時)、Variety (多樣，涵蓋結構/半結構/非結構)、Veracity (真實可靠)、Value (價值)。\n2. ETL 處理架構：Extract (自各資料庫擷取) ➔ Transform (清理、格式轉換、單位統一、正規化) ➔ Load (載入分析倉儲)。\n3. 遺缺值 (Missing Value) 處理：數值欄位可採均值、中位數、插值法或模型預測補值；類別欄位採眾數補值；遺失比例過高則刪除欄位。\n4. 離群值 (Outliers) 判定：常態分佈採 Z-score (|Z| > 3)，偏態分佈採 IQR 四分位距 (Q1 - 1.5*IQR 至 Q3 + 1.5*IQR)；可採截尾 (Trimming) 或蓋帽；嚴禁使用 One-hot 編碼處理離群值！\n5. 類別特徵編碼：無序類別使用 One-hot Encoding (獨熱編碼)；有序類別使用 Ordinal Encoding。\n6. 特徵交叉 (Feature Cross)：組合兩個不同維度特徵 (例如星期幾 × 24小時制時間)，使模型具備捕捉非線性交互時空規律之能力。\n7. 資料洩漏 (Data Leakage) 防範黃金原則：必須先切分訓練集與測試集，僅使用訓練集計算均值與標準差，再套用於測試集！"
  },
  {
    "id": "chunk-s1-ml-basics",
    "docId": "preload-ipas-ai-s1-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目一：人工智慧基礎概論】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 3.3 節 機器學習原理與評估指標",
    "content": "【機器學習核心範式與評估指標】：\n1. 監督式學習 (Supervised)：需標註資料 (X ➔ Y)。分類任務預測離散類別 (如是否洗錢、是否流失)；迴歸任務預測連續數值 (如房價預測、銷量推估)。\n2. 非監督式學習 (Unsupervised)：無標籤，探索資料內在幾何分群 (如 K-Means 分群、階層分群) 或主成分分析降維 (PCA)。\n3. 半監督式學習 (Semi-supervised)：少量標註資料 (如 30%) 搭配大量未標註資料 (如 70%) 進行協同訓練。\n4. 強化學習 (Reinforcement Learning)：Agent 與環境互動，依獎勵/懲罰訊號動態調整策略 (Policy) 函數，如 Q-Learning 與 DQN (以深度神經網路近似 Q 值)。\n5. 混淆矩陣與指標：\n   - 準確率 Accuracy = (TP + TN) / Total (資料極度不平衡時不可靠)。\n   - 精準率 Precision = TP / (TP + FP) (重視不能抓錯，如垃圾郵件)。\n   - 召回率 Recall = TP / (TP + FN) (重視不能漏抓，如癌症篩檢、洗錢異常)。\n   - F1-Score = 2*P*R / (P + R) (類別不平衡綜合評估)。\n6. 偏差與變異權衡 (Bias-Variance Tradeoff)：高偏差導致欠擬合，高變異導致過度擬合 (訓練集 98% 但測試集 72%)；正則化 L1 (Lasso, 促成稀疏解權重歸零) 與 L2 (Ridge) 可控制複雜度防範過擬合。"
  },
  {
    "id": "chunk-s1-deep-learning",
    "docId": "preload-ipas-ai-s1-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目一：人工智慧基礎概論】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 3.4 節 深度學習架構與生成基礎",
    "content": "【深度神經網路核心架構】：\n1. 卷積神經網路 (CNN)：卷積層透過局部感受野與權重共享提取空間特徵，池化層降維，為影像分類、物件偵測與缺陷檢測首選。\n2. 循環神經網路 (RNN) 與限制：具有隱藏狀態傳遞序列資訊，但面對長序列容易出現梯度消失或爆炸；LSTM 透過輸入門、遺忘門、輸出門與細胞狀態保留長程記憶。\n3. Transformer 架構：捨棄遞歸循環，採用自注意力機制 (Self-Attention) 實現全程並行計算，能直接捕捉全局上下文依賴關係。\n4. 啟動函數：ReLU (max(0, x)) 改善深層網路梯度消失；Softmax 將多類別未正規化數值轉換為機率總和為 1 之分佈。\n5. 生成模型原理：變分自編碼器 (VAE) 將資料對應至潛在空間機率分佈並採樣重建；生成對抗網路 (GAN) 由生成器與判別器零和博弈；擴散模型 (Diffusion) 透過逐步加噪與逆向去噪生成超高畫質穩定影像。"
  },
  {
    "id": "chunk-s1-xai",
    "docId": "preload-ipas-ai-s1-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目一：人工智慧基礎概論】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 3.4 節 可解釋性 AI (XAI) 技術實務",
    "content": "【可解釋性人工智慧 (Explainable AI, XAI)】：\n1. 核心宗旨：在高風險應用 (金融審貸、醫療診斷、司法輔助) 中化解深度黑箱疑慮，提供人類專家可理解之決策依據，建立互信並滿足監管合規。\n2. LIME (Local Interpretable Model-agnostic Explanations)：\n   - 屬於「後處理模型解釋 (Post-hoc)」與「局部解釋」技術。\n   - 透過在目標樣本周圍產生隨機擾動樣本並觀察黑箱模型輸出，訓練局部簡單模型 (如線性模型) 近似局部決策邊界。\n3. SHAP (SHapley Additive exPlanations)：\n   - 基於賽局理論之夏普利值，保證邊際貢獻可加性。\n   - 能精確量化單一預測結果中，每個輸入特徵對最終預測輸出產生的正負貢獻分配值。\n4. 反事實解釋 (Counterfactual Explanation)：\n   - 探討「在模型維持不變之前提下，輸入特徵需要發生哪些最小變動，才能翻轉決策結果？」\n   - 實務挑戰：生成的反事實樣本必須滿足特徵因果約束與現實可操作性 (如無法改變性別或年齡)，並符合公平放貸等法規要求。\n5. 顯著性圖 (Saliency Map)：以熱圖視覺化標示出輸入影像中對神經網路分類輸出影響最大的像素區域。"
  },
  {
    "id": "chunk-s2-nocode-lowcode",
    "docId": "preload-ipas-ai-s2-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目二：生成式 AI 應用與規劃】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 1 章 No-Code / Low-Code 概念與企業治理",
    "content": "【No-Code / Low-Code 平台與企業應用】：\n1. 核心定位：\n   - No-Code (無程式碼)：純圖形拖拉配置，讓非技術業務同仁 (市民開發者 Citizen Developer) 快速建立行政表單、審批流與資訊看板。\n   - Low-Code (低程式碼)：視覺化框架加上程式碼擴展點，支援進階演算法、自訂 API 調用與企業系統深度整合。\n2. 平台中的「模型 (Model)」：抽象描述資料結構、業務實體與介面邏輯之核心架構，非單純 UI 輔助工具。\n3. 企業導入挑戰與治理對策：部門自主開發若缺乏統一管理機制，容易衍生黑箱系統 (Shadow IT) 與資料定義衝突，企業必須建立統一之開發指引、資安審核與上線治理框架。\n4. 系統可靠度與測試性：整合外部財務、庫存與物流 API 時，最佳策略為建立自動化測試流程，結合 API 模擬 (Mocking) 與可重複執行之整合測試。\n5. 邊緣裝置部署限制：Low-Code 監控應用部署至工廠邊緣硬體出現延遲，主要因邊緣裝置受限於硬體算力與記憶體資源。"
  },
  {
    "id": "chunk-s2-llm-fine-tune",
    "docId": "preload-ipas-ai-s2-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目二：生成式 AI 應用與規劃】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 2 章 生成式 AI 架構、微調與調優技術",
    "content": "【生成式 AI 架構與模型調優】：\n1. 模型架構差異：\n   - Decoder-only (如 GPT、Gemini、LLaMA)：自回歸單一模型同時負責理解上下文與序列生成，文字與對話能力極強。\n   - Encoder-Decoder (如 T5、BART)：嚴格區分編碼與解碼兩階段，擅長翻譯與序列變換。\n2. 文本生成原理：基於機率分佈預測下一個 Token，透過巨量文本統計規律生成，不保證事實絕對正確。\n3. 生成控制參數：\n   - 溫度 (Temperature)：控制隨機性。低溫 (如 0.2) 輸出保守嚴謹、格式高度一致；高溫 (如 0.8) 增加創意多樣性。\n   - Top-p (核採樣)：僅從累積機率達到 p 之候選詞中進行採樣。\n4. 參數高效微調 (PEFT / LoRA)：低秩適配 (Low-Rank Adaptation) 凍結大模型權重，僅在旁路插入低秩矩陣分解進行訓練，以極少 GPU 顯存達成高質量領域適配。\n5. 知識蒸餾 (Knowledge Distillation, KD)：以小型學生模型學習大型教師模型之機率分佈，在保持生成品質下顯著降低推論延遲與伺服器調用成本。\n6. 模型剪枝 (Pruning)：移除模型中冗餘或對預測影響極小之權重參數，減少模型體積並提速。"
  },
  {
    "id": "chunk-s2-prompt-rag",
    "docId": "preload-ipas-ai-s2-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目二：生成式 AI 應用與規劃】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 2 章 提示工程與 RAG 檢索增強生成架構",
    "content": "【提示工程與 RAG 架構全景】：\n1. 提示工程 (Prompt Engineering) 技術矩陣：\n   - Zero-shot：無範例直接指示。\n   - Few-shot：提供 2~3 組示範案例，對齊格式與回覆風格。新領域遷移時若範例過少易泛化不足。\n   - Chain-of-Thought (CoT)：要求逐步展開推理，降低邏輯錯誤 (如查詢退換貨規範)。\n   - Tree of Thoughts (ToT)：多分支樹狀探索與回溯比選 (如多約束行銷活動企劃方案比較)。\n   - Graph Prompting：以圖結構描述實體關聯，適合處理非線性複雜關係 (如門市補貨多條件互鎖)。\n2. RAG (檢索增強生成) 機制：\n   - 核心價值：消除大模型幻覺、引入即時私有文件。\n   - 文本切分 (Chunking)：提升向量檢索語意對齊精準度，降低長篇無關噪音干擾。\n   - 增量更新 (Incremental Indexing)：文件異動時採分段增量更新向量索引，避免全量重建導致服務停機。\n   - 多向量檢索 (Multi-vector Retriever)：為同一文件片段維護摘要與全文多種向量表示，強化檢索完整性。\n3. RAG 與 Fine-Tuning 最佳分工：Prompt/微調控制回覆語氣風格，RAG 動態檢索最新促銷與規章，避免每週頻繁微調。"
  },
  {
    "id": "chunk-s2-agent-mcp",
    "docId": "preload-ipas-ai-s2-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目二：生成式 AI 應用與規劃】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 2 章 Agentic AI、MCP 協議與多代理協同",
    "content": "【Agentic AI、MCP 協議與多代理協同】：\n1. Agentic AI 核心要素：大模型大腦 + 規劃器 (Task Planning) + 記憶體 (Memory) + 工具呼叫 (Tool / API Calling)。\n2. Model Context Protocol (MCP) 架構流程：\n   - Anthropic 提出的標準化開源工具連接協議。\n   - 呼叫順序：AI Host (宿主介面) ➔ MCP Client (協議客戶端) ➔ MCP Server (工具伺服器) ➔ 執行資料庫查詢或 API 調用 ➔ 結果回傳至 AI Host。\n   - 定位差異：MCP 著重於「動態工具與系統互聯」；RAG 著重於「靜態向量知識庫補充」。\n3. Agent-to-Agent (A2A) 協同流程：Client Agent 發起任務需求，Remote Agent 負責特定子任務執行並回傳成果。\n4. 解決方案圖譜 (Solution Graph)：定義代理在跨部門複雜決策中的任務分解架構與決策路徑，透過搜尋演算法探索最優解。\n5. 程式碼輔助 (GitHub Copilot / Codex)：基於大規模代碼預訓練之自回歸模型預測下一個代碼符號，不保證代碼絕對正確；Vibe Coding 必須納入程式碼審查、重構與安全性測試。"
  },
  {
    "id": "chunk-s2-poc-roi-security",
    "docId": "preload-ipas-ai-s2-guide",
    "docName": "經濟部 iPAS 初級能力鑑定學習指引【科目二：生成式 AI 應用與規劃】官方核心指引",
    "category": "官方學習指引",
    "pageOrSection": "第 3 章 導入評估 (PoC/TCO/ROI) 與資安風險管理",
    "content": "【企業導入評估與資安風險管理】：\n1. 導入四階段：構想評估 ➔ 設計驗證 ➔ 概念驗證 (PoC) ➔ 營運上線。\n   - PoC 階段核心：驗證模型實際品質與業務適配度，評估技術限制。【不應在此階段制定長期跨部門治理框架】。\n2. 總體擁有成本 (TCO) 全貌：涵蓋 API Token 調用、基礎設施算力、內部工程維護、教育訓練、系統整合與資安合規稽核成本。\n3. 投資報酬率 (ROI) 與回收期計算：\n   - 月節省 = 原人工作業費 - AI 運營費。\n   - 投資回收期 = 系統整合初期成本 / 每月淨節省額。\n4. Token 經濟學 (Token Economics)：關注推論階段輸入與輸出 Token 量與計費，不包含訓練階段 GPU 記憶體硬體成本。\n5. 風險管理與資安防護：\n   - 提示注入攻擊 (Prompt Injection)：必須在輸入端與輸出端佈設安全護欄 (Guardrails) 審核過濾。\n   - 數據漂移 (Data Drift)：線上輸入資料統計特性隨時間偏離訓練分佈，導致模型效能衰退。\n   - 聯邦學習 (Federated Learning)：資料保留於本地，僅上傳聚合模型梯度與參數。\n   - 同態加密 (Homomorphic Encryption)：在密文狀態下直接執行模型運算，資料零暴露。\n   - 出處溯源技術：Google SynthID 在每一幀影片與圖像中嵌入不可見浮水印；C2PA 記錄元數據出處。"
  },
  {
    "id": "chunk-moda-handbook-core",
    "docId": "preload-moda-ai-handbook",
    "docName": "數位發展部《公部門人工智慧應用參考手冊》與 AI 評測中心指引",
    "category": "政策法規與手冊",
    "pageOrSection": "公部門生成式 AI 導入規劃與安全指引",
    "content": "【公部門生成式 AI 應用三大指引與評測標準】：\n1. 公部門公務使用原則：公務人員使用生成式 AI 撰寫公文書或輔助決策時，必須對最終產出內容進行實質核對查證，由公務人員負最終實質當責 (Accountability)。\n2. 機密敏感資訊防護：嚴禁將未公開之國家機密、機敏公文、未去識別化之民眾個人資料直接輸入未經私有化核准之外部雲端 AI 服務。\n3. AI 產品與系統評測中心評測面向：\n   - 當責性 (Accountability)、可靠性 (Reliability)、隱私及資安 (Privacy & Security)、透明性 (Transparency)、公平性 (Fairness)。\n   - 模型安全四大使用指標：事實正確性、偏見與歧視、惡意與濫用可能性、合法合規性。\n   - 注意：資料複雜性與互動性並非安全評測核心指標！\n4. 隱私增強技術 (PETs)：推動差分隱私 (Differential Privacy)、同態加密 (Homomorphic Encryption) 與合成數據 (Synthetic Data) 促進數據安全利用。"
  },
  {
    "id": "chunk-seed-course-cv-nlp",
    "docId": "preload-seed-course-slides",
    "docName": "產業 AI 人才種子培訓教材精華 (工程實務、電腦視覺、NLP 與企業導入)",
    "category": "種子師資實務教材",
    "pageOrSection": "電腦視覺、NLP 與邊緣推論工程",
    "content": "【工程與產業實務關鍵技術】：\n1. 電腦視覺四大任務光譜：\n   - 影像分類 (Image Classification)：判斷整張影像中是否有目標 (如是否有煙霧)。\n   - 物件偵測 (Object Detection)：找出目標並以邊界框 (Bounding Box) 標示位置。\n   - 語意分割 (Semantic Segmentation)：逐像素標記目標區域範圍 (如精確標示出煙霧像素輪廓)。\n   - 實例分割 (Instance Segmentation)：區分同類別中不同實體之像素輪廓。\n2. 批次推論 vs 即時推論 (Batch vs Real-time Inference)：\n   - 批次推論 (Batch Inference)：著重整體吞吐量 (Throughput) 最佳化，容忍較高延遲，處理海量離線資料。批次增大可提升 GPU/TPU 加速器資源利用率，但會犧牲單筆延遲。\n   - 即時推論 (Real-time Inference)：著重極低延遲 (Latency) 與即時互動反應時間穩定性。\n3. 自然語言處理資料去偏 (Data Debiasing)：透過平衡不同群體或類別的訓練語料比例，消除系統性偏見，避免模型偏袒高頻類別。"
  }
];
