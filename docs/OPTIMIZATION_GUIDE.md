# 🔧 Dify + RAGFlow 優化指南

> **更新日期**: 2026-02-14  
> **適用版本**: Dify 0.6.16 / RAGFlow v0.16.0 / Ollama (llama3)

---

## 一、RAGFlow 知識庫設定優化（Web UI）

登入 RAGFlow → 知識庫 → 選擇你的 Dataset → 設定

### 修改項目

| 參數 | 修改前 | 修改後 | 原因 |
|------|--------|--------|------|
| **自動關鍵字** | 0 | **3** | 萃取關鍵字，強化混合檢索的 keyword search 召回率 |
| **自動問題** | 0 | **1** | 自動為每個 chunk 生成問答對，提升問句式查詢精準度 |
| **塊Token數** | 128 | **256** | 128 過度碎片化導致上下文不完整；256 仍在 embedding 限制內 |
| **表格轉HTML** | OFF | **ON** | 保留表格結構以供 LLM 理解，適合 Excel/CSV 匯入場景 |
| 頁面排名 | 0 | 0（不變） | - |
| RAPTOR | OFF | OFF（不變） | 運算成本高，中小型知識庫暫不需要 |
| 佈局識別和 OCR | DeepDOC | DeepDOC（不變） | 已是最佳選項 |
| 分段標識符 | `\n!?;。；！？` | 不變 | 已適合中文分段 |

### ⚠️ 重要事項
- 修改設定後，**已存在的文檔不會自動重新解析**
- 需要到文檔列表，選擇文檔 → 「重新解析」才會套用新設定
- 新上傳的文檔將自動使用新設定

---

## 二、Dify 系統提示詞升級

登入 Dify → 工作室 → BruV AI 助手 → 編排 → 提示詞

### 替換為以下提示詞：

```
你是 BruV 知識平台的 AI 助手，專門協助使用者管理和查詢知識圖譜。

核心職責：
1. **知識檢索**：根據上下文準確回答問題，引用具體文件來源
2. **圖譜分析**：協助分析知識圖譜中的節點關聯、路徑探索
3. **文件摘要**：總結知識庫文檔的重點內容

回答規範：
- 以繁體中文回覆，語調專業且友善
- 必須使用 Markdown 格式（標題、列表、程式碼區塊、表格）
- 重要關鍵詞和術語使用**粗體**標記
- 技術術語保留英文原文（如 OAuth、JWT、API）

RAG 引用規則（最重要）：
- 回答必須基於上下文中提供的知識庫內容
- 若上下文包含相關資訊，明確引用來源（如「根據 [文件名] 所述…」）
- 若上下文中找不到答案，請明確回覆：「目前知識庫中尚無此資訊，建議您上傳相關文檔。」
- 絕對不可編造知識庫中不存在的內容（禁止幻覺）
- 可以補充通用知識作為輔助，但須標明「以下為一般說明，非來自知識庫」

回覆結構（建議）：
1. 直接回答核心問題（1-2 句）
2. 展開詳細說明（條列式）
3. 補充相關建議或注意事項

限制：
- 不回答與知識管理無關的敏感話題
- 不生成可執行的惡意程式碼
- 單次回覆控制在 500 字以內（除非使用者要求詳細說明）
```

---

## 三、Dify Retrieval Setting 優化

Dify → 工作室 → BruV AI 助手 → 編排 → 上下文 → Retrieval Setting

### 建議設定

| 參數 | 建議值 | 說明 |
|------|--------|------|
| **Retrieval Mode** | **Hybrid Search** | 同時使用向量語意 + 關鍵字搜尋（效果最佳） |
| **Top K** | **5** | 送入 LLM 的上下文 chunk 數（太多會稀釋重點） |
| **Score Threshold** | **0.5** | 最低相關度門檻（過濾低品質結果） |
| **Reranking** | 啟用（如有模型）| 使用 reranker 進一步排序 Top K 結果 |

### 如果 Retrieval Setting 只有 N of N 模式：
- Top K: **5**
- 啟用 Score Threshold: **0.5**
- 如果有多個知識庫，選擇相關的那些

---

## 四、Ollama 模型升級建議

### 目前：llama3（8B）

### 推薦升級路線

| 模型 | 大小 | VRAM | 優勢 | 指令 |
|------|------|------|------|------|
| **llama3.1:8b** | 4.7GB | ~6GB | 128K context window、改進中文 | `ollama pull llama3.1:8b` |
| **llama3.2:3b** | 2.0GB | ~3GB | 超快推理、適合即時對話 | `ollama pull llama3.2:3b` |
| **qwen2.5:7b** | 4.7GB | ~6GB | 中文能力最強、reasoning 優異 | `ollama pull qwen2.5:7b` |
| **qwen2.5:14b** | 8.9GB | ~11GB | 你的 RTX 4070 Super 12GB 能跑 | `ollama pull qwen2.5:14b` |

### 🔥 推薦配置（RTX 4070 Super 12GB）

**最佳中文效果**：`qwen2.5:14b`（接近 14B 全量，12GB VRAM 剛好放得下）
```powershell
# 下載模型
ollama pull qwen2.5:14b

# 測試推理
ollama run qwen2.5:14b "用繁體中文解釋什麼是知識圖譜"
```

**最佳平衡**：`qwen2.5:7b`（快速 + 中文好）
```powershell
ollama pull qwen2.5:7b
```

### 在 Dify 中切換模型

1. Dify → 工作室 → BruV AI 助手
2. 右上角模型選擇器 → 選擇新模型（如 `qwen2.5:14b`）
3. 點擊「發佈」

### 在 RAGFlow 中使用 Ollama

RAGFlow 的 Embedding 模型和 LLM 可以分別設定：
1. RAGFlow → 系統設定 → 模型管理
2. 添加 Ollama provider（API Base: `http://ollama:11434`）
3. 選擇對話模型（如 `qwen2.5:14b`）
4. Embedding 模型建議保留 RAGFlow 內建的

---

## 五、後端程式碼已自動更新

以下參數已在程式碼中修改完畢（無需手動操作）：

### `backend/api/ragflow.py` — 混合檢索預設值
```python
similarity_threshold: float = 0.4    # ↑ 0.2→0.4 過濾低品質結果
vector_similarity_weight: float = 0.6  # ↑ 0.3→0.6 偏向語意搜尋
top_k: int = 256                       # ↓ 1024→256 降低延遲
```

### `backend/rag_client.py` — 檢索客戶端預設值
（同步更新，與 ragflow.py 一致）

### `backend/core/config.py` — 分塊大小
```python
RAGFLOW_CHUNK_TOKEN_NUM: int = 256   # 128→256 兼顧上下文完整性
```

---

## 六、優化前後對比

| 指標 | 優化前 | 優化後 | 預期提升 |
|------|--------|--------|----------|
| 關鍵字召回率 | 低（無關鍵字索引）| 高（自動萃取 3 個/chunk）| +30~50% |
| 問句查詢精準度 | 低 | 中（自動問答對）| +20~30% |
| 上下文完整性 | 碎片化（128 token）| 適中（256 token）| 更連貫 |
| 低品質結果過濾 | 弱（threshold 0.2）| 強（threshold 0.4）| 減少雜訊 |
| LLM 中文能力 | 一般（llama3）| 優（qwen2.5:14b）| 顯著提升 |
| 幻覺防護 | 無 | Prompt 明確禁止 | 降低幻覺率 |

---

## ⚡ 快速執行清單

```
□ RAGFlow UI：自動關鍵字 → 3
□ RAGFlow UI：自動問題 → 1
□ RAGFlow UI：塊Token數 → 256
□ RAGFlow UI：表格轉HTML → ON
□ RAGFlow：重新解析已有文檔
□ Dify：貼上新系統提示詞
□ Dify：Retrieval Setting → Hybrid, TopK=5, Threshold=0.5
□ Ollama：ollama pull qwen2.5:14b (或 qwen2.5:7b)
□ Dify：模型切換為 qwen2.5 → 發佈
```
