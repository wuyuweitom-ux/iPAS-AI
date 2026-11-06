#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
iPAS 淨零碳規劃師備考助教 (iPAS Net-Zero Carbon Planner Study Assistant)
=============================================================================
本腳本基於 Google Gemini API (@google/genai) 開發，專為準備經濟部 iPAS「淨零碳規劃師」
能力鑑定證照之考生量身打造。

核心理念：
1. 蘇格拉底式引導：遇考古題不直接給答案，先提供觀念提示引導思考。
2. 盲點診斷與精準引證：解析錯誤原因，精確引用 ISO 14064-1、ISO 14067、
   GHG Protocol 溫室氣體盤查議定書、台灣《氣候變遷因應法》及碳費子法。
3. 支援即時網路查證 (Google Search Grounding)：獲取最新國際標準與法規動態。

安裝依賴：
    pip install -r requirements.txt
    或
    pip install google-genai python-dotenv rich

使用方法：
    1. 設定環境變數 GEMINI_API_KEY (可寫在 .env 檔案中)
    2. 執行：python ipas_tutor.py
=============================================================================
"""

import os
import sys
from dotenv import load_dotenv

# 載入 .env 檔案
load_dotenv()

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("\n[錯誤] 尚未安裝 google-genai 套件！")
    print("請先執行：pip install google-genai python-dotenv rich\n")
    sys.exit(1)

try:
    from rich.console import Console
    from rich.panel import Panel
    from rich.markdown import Markdown
    from rich.text import Text
    console = Console()
    HAS_RICH = True
except ImportError:
    HAS_RICH = False
    console = None

SYSTEM_INSTRUCTION = """你是一位專業且權威的經濟部 iPAS「AI 應用規劃師 (初級能力鑑定)」頂尖備考助教。
請協助考生準備經濟部 iPAS 初級能力鑑定兩大核心考科：
- 科目一：人工智慧基礎概論（AI定義與人在迴圈、資料前處理與特徵工程、機器學習三大範式、CNN/RNN/Transformer架構、混淆矩陣指標、XAI可解釋性、行政院《人工智慧基本法》草案與金融規範）。
- 科目二：生成式 AI 應用與規劃（No-Code/Low-Code治理、Transformer解碼器自回歸生成、提示工程CoT/ToT/Graph、RAG檢索增強、Agentic AI與MCP通訊協議、PoC評估、ROI/TCO計算、SynthID浮水印與資安防護）。

教學與回答守則：
1. 【引導思考，不直接暴雷】：當學生詢問考古題、選擇題或計算題時，請勿第一時間直接說出答案選項（如「答案是 B」）。請先提供關鍵觀念指引、演算法邏輯或解題核心關鍵字，引導學生自行判斷。
2. 【盲點診斷】：當學生回答錯誤或觀念模糊時，請直擊其盲點，解釋為何容易混淆（例如：L1 稀疏解 vs L2 平滑、召回率 Recall vs 精準率 Precision、人在迴圈內 vs 迴圈上、Decoder-only vs Encoder-Decoder、MCP 工具整合 vs RAG 知識庫、偏見檢測 vs 偏見緩解）。
3. 【精準標準引證】：每一次解釋與論證，明確引用經濟部官方學習指引、《人工智慧基本法》草案、數發部參考手冊與歷屆公告試題出處。
4. 【語言與語氣】：使用繁體中文（台灣慣用專業詞彙），語氣專業、清晰、富有激勵性，繁簡得宜，格式排版清晰（善用條列與加粗）。"""

def print_banner():
    if HAS_RICH:
        banner = """
   🤖 iPAS AI 應用規劃師 (初級) AI 備考助教 (GitHub Edition) 🤖
   ============================================================
   • 考科涵蓋：人工智慧基礎概論 | 生成式 AI 應用與規劃
   • 核心範疇：Transformer | RAG | Agentic AI | MCP 協議 | AI 基本法
   • 助教模式：啟發引導式提示 (Socratic Tutor)
        """
        console.print(Panel(banner, style="bold indigo", subtitle="輸入 /help 查看快捷指令 | 輸入 /quit 離開"))
    else:
        print("=" * 60)
        print(" 🤖 iPAS AI 應用規劃師 (初級) AI 備考助教 (GitHub Edition)")
        print("   輸入 /help 查看快捷指令 | 輸入 /quit 離開")
        print("=" * 60)

def print_help():
    help_text = """
【快捷指令清單】
  /hint  <題目內容>    : 要求助教給出這題的核心概念提示（不透漏答案）
  /quiz               : 請助教出一題經典的 iPAS AI 應用規劃師模擬測驗題
  /calc               : 請助教引導一題混淆矩陣/指標或 ROI/Token 計算題
  /search <關鍵字>    : 強制開啟 Google 搜尋聯網查證最新 AI 法規與技術
  /help               : 顯示此說明文件
  /quit 或 /exit      : 結束對話
    """
    if HAS_RICH:
        console.print(Panel(help_text.strip(), title="使用說明", style="cyan"))
    else:
        print(help_text)

def main():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("\n[警告] 未偵測到 GEMINI_API_KEY 環境變數！")
        print("請在 .env 檔案中加入：GEMINI_API_KEY=\"你的API金鑰\"")
        print("或在終端機中執行：export GEMINI_API_KEY=\"你的API金鑰\"")
        api_key = input("\n請在此貼上您的 Gemini API Key: ").strip()
        if not api_key:
            print("未提供金鑰，程式結束。")
            return

    client = genai.Client(api_key=api_key)
    # 使用最新穩定版 gemini-3.8-flash
    model_name = "gemini-3.8-flash"

    print_banner()

    chat_history = []

    while True:
        try:
            if HAS_RICH:
                user_input = console.input("\n[bold yellow]考生提問 > [/bold yellow]").strip()
            else:
                user_input = input("\n考生提問 > ").strip()

            if not user_input:
                continue

            if user_input.lower() in ["/quit", "/exit", "exit", "quit", "q"]:
                if HAS_RICH:
                    console.print("[green]祝您備考順利，順利考取 iPAS 淨零碳規劃師證照！再見！[/green]")
                else:
                    print("祝您備考順利，順利考取 iPAS 淨零碳規劃師證照！再見！")
                break

            if user_input.lower() == "/help":
                print_help()
                continue

            use_search = False
            processed_input = user_input

            if user_input.startswith("/search "):
                use_search = True
                query = user_input[8:].strip()
                processed_input = f"【請使用 Google Search 查證最新資訊】考生查詢：{query}"
            elif user_input.startswith("/hint "):
                q = user_input[6:].strip()
                processed_input = f"【題目求助】請不要告訴我答案，請給予這道考題的核心解題觀念、引用的法規標準章節與思考步驟：\n{q}"
            elif user_input.lower() == "/quiz":
                processed_input = "請出一道符合 iPAS 淨零碳規劃師難度的單選模擬題（請涵蓋 ISO 14064-1 或氣候變遷因應法），列出 ABCD 四個選項，但暫時不要公布答案，等待我的回答。"
            elif user_input.lower() == "/calc":
                processed_input = "請出一道 iPAS 常考的溫室氣體活動數據與排放係數計算題（例如冷媒逸散、外購電力或生質燃料熱值計算），並提示計算步驟，讓我試算。"

            # 構建 Content 結構
            chat_history.append(
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=processed_input)]
                )
            )

            # 配置工具與系統提示詞
            tools = []
            if use_search:
                tools.append(types.Tool(googleSearch=types.GoogleSearch()))

            config = types.GenerateContentConfig(
                system_instruction=[types.Part.from_text(text=SYSTEM_INSTRUCTION)],
                tools=tools if tools else None,
            )

            if HAS_RICH:
                console.print("\n[bold green]助教回答中...[/bold green]")
            else:
                print("\n助教回答中...")

            full_reply = ""
            for chunk in client.models.generate_content_stream(
                model=model_name,
                contents=chat_history,
                config=config,
            ):
                if chunk.text:
                    if HAS_RICH:
                        sys.stdout.write(chunk.text)
                        sys.stdout.flush()
                    else:
                        print(chunk.text, end="", flush=True)
                    full_reply += chunk.text

            print() # 換行
            chat_history.append(
                types.Content(
                    role="model",
                    parts=[types.Part.from_text(text=full_reply)]
                )
            )

            # 維持適度的歷史紀錄長度
            if len(chat_history) > 12:
                chat_history = chat_history[-10:]

        except KeyboardInterrupt:
            print("\n已中斷對話。")
            break
        except Exception as e:
            if HAS_RICH:
                console.print(f"\n[bold red][API 錯誤][/bold red] {e}")
            else:
                print(f"\n[API 錯誤] {e}")

if __name__ == "__main__":
    main()
