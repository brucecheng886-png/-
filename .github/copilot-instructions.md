# Copilot Instructions — BruV_Project

## 技能包 (Skill Packs)

以下文件為「技能包」，在對話中提到相關關鍵字時，請自動讀取對應文件作為上下文：

### 📦 上傳邏輯
- **關鍵字**: `上傳邏輯`、`上傳流程`、`匯入邏輯`、`import logic`、`upload logic`、`ImportPage`、`上傳錯誤`、`RAGFlow 上傳`、`Excel 匯入`
- **文件**: `docs/UPLOAD_LOGIC.md`
- **說明**: 完整的檔案上傳管線技術參考，涵蓋前端 ImportPage、後端 system.py / graph_import.py、RAGFlow 整合、Watcher Saga 流程、錯誤處理與診斷。
- **維護規則**: 修改上傳相關程式碼後，必須同步更新 `docs/UPLOAD_LOGIC.md`。

## 專案架構快速參考

- **前端**: Vue 3 + Pinia + Element Plus + Tailwind CSS + 3D/2D Force Graph
- **後端**: FastAPI + KuzuDB + Dify (LLM) + RAGFlow (RAG) + httpx
- **主要入口**: `app_anytype.py`
- **前端 Store**: `frontend/src/stores/graphStore.js`
- **圖譜 API**: `backend/api/graph.py`
- **上傳管線**: `backend/api/graph_import.py` + `backend/api/system.py`
- **RAGFlow 客戶端**: `backend/rag_client.py`
- **檔案監控**: `backend/services/watcher.py`
