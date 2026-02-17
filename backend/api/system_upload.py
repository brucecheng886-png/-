"""
檔案上傳功能 — system.py 拆分

包含 /upload 路由及其完整的四階段上傳管線：
1. meta.json 預先寫入
2. RAGFlow 上傳 + chunking
3. 回填 meta.json
4. 主檔案寫入（觸發 Watcher）
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from typing import Optional
import os
import re
import logging
import asyncio
from pathlib import Path
from datetime import datetime

from backend.core.config import get_current_api_keys, settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload")
async def upload_file(
    raw_request: Request,
    file: UploadFile = File(...),
    graph_id: str = Form(None),
    graph_mode: str = Form("existing"),
    graph_name: str = Form(None),
    enable_ai_link: str = Form("false"),
    ragflow_dataset_id: str = Form(None)
):
    """
    上傳檔案到監控資料夾，自動觸發 WatcherService 處理

    Args:
        file: 上傳的檔案
        graph_id: 目標圖譜 ID
        graph_mode: 圖譜模式 ("new" 或 "existing")
        graph_name: 新圖譜名稱 (當 graph_mode="new" 時使用)
        enable_ai_link: 是否啟用 AI 智能連線 ("true" 或 "false")
        ragflow_dataset_id: RAGFlow 知識庫 ID (當 enable_ai_link="true" 時使用)
    """
    try:
        ai_enabled = enable_ai_link.lower() == "true"
        ragflow_doc_ids = []
        logger.info(f"收到文件上傳請求: {file.filename}, graph_mode={graph_mode}, graph_id={graph_id}")

        # 檔案大小限制
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE:
            max_mb = settings.MAX_UPLOAD_SIZE // (1024 * 1024)
            raise HTTPException(status_code=413, detail=f"檔案大小超過限制（最大 {max_mb} MB）")

        upload_dir = Path(settings.AUTO_IMPORT_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)

        if not file.filename:
            raise HTTPException(status_code=400, detail="檔案名稱不能為空")

        safe_filename = re.sub(r'[\\/:*?"<>|]', '_', Path(file.filename).name)
        if safe_filename.startswith('.'):
            safe_filename = '_' + safe_filename

        file_path = upload_dir / safe_filename

        if file_path.exists():
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_stem = file_path.stem
            file_suffix = file_path.suffix
            file_path = upload_dir / f"{file_stem}_{timestamp}{file_suffix}"

        # ── 階段 1: 先寫 meta.json ──
        import json
        metadata_file = file_path.with_suffix(file_path.suffix + '.meta.json')
        metadata = {
            "graph_id": graph_id,
            "graph_mode": graph_mode,
            "graph_name": graph_name,
            "upload_time": datetime.now().isoformat(),
            "ai_enabled": ai_enabled,
            "ragflow_dataset_id": ragflow_dataset_id if ai_enabled else None,
            "ragflow_result": None,
            "ragflow_doc_ids": None
        }
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        logger.info(f"📋 圖譜元數據已預寫入: graph_id={graph_id}, path={metadata_file.name}")

        # ── 階段 2: RAGFlow 上傳 ──
        ragflow_result = None
        temp_file_for_ragflow = None
        if ai_enabled and ragflow_dataset_id:
            try:
                logger.info(f"🤖 正在上傳到 RAGFlow 知識庫: {ragflow_dataset_id}")
                from backend.rag_client import RAGFlowClient

                api_keys = get_current_api_keys()

                if not api_keys['RAGFLOW_API_KEY']:
                    logger.warning("⚠️ RAGFlow API Key 未配置，跳過 RAGFlow 上傳")
                else:
                    import tempfile
                    temp_dir = tempfile.gettempdir()
                    temp_file_for_ragflow = Path(temp_dir) / file_path.name
                    with open(temp_file_for_ragflow, "wb") as tmp:
                        tmp.write(content)

                    ragflow_api_url = api_keys['RAGFLOW_API_URL']
                    rag_client = RAGFlowClient(
                        api_key=api_keys['RAGFLOW_API_KEY'],
                        base_url=ragflow_api_url,
                        http_client=getattr(raw_request.app.state, 'http_client', None),
                    )

                    ragflow_result = await rag_client.async_upload_file(
                        dataset_id=ragflow_dataset_id,
                        file_path=str(temp_file_for_ragflow)
                    )
                    logger.info(f"✅ RAGFlow 上傳成功: {ragflow_result}")

                    # 自動觸發文檔解析
                    uploaded_docs = ragflow_result.get("data", [])
                    if uploaded_docs:
                        doc_ids = [d["id"] for d in uploaded_docs if "id" in d]
                        if doc_ids:
                            chunk_token_num = settings.RAGFLOW_CHUNK_TOKEN_NUM
                            logger.info(f"📋 準備設定 {len(doc_ids)} 份文檔 chunk_token_num={chunk_token_num}")

                            for doc_id in doc_ids:
                                try:
                                    await rag_client.async_update_document(
                                        dataset_id=ragflow_dataset_id,
                                        document_id=doc_id,
                                        chunk_method="naive",
                                        parser_config={"chunk_token_num": chunk_token_num}
                                    )
                                    logger.info(f"✅ 已設定文檔 {doc_id} chunk_token_num={chunk_token_num}")
                                except Exception as cfg_err:
                                    logger.warning(f"⚠️ 設定 parser_config 失敗: {cfg_err}")

                            await asyncio.sleep(2)
                            for doc_id in doc_ids:
                                try:
                                    doc_status = await rag_client.async_get_document_status(
                                        dataset_id=ragflow_dataset_id,
                                        document_id=doc_id
                                    )
                                    actual_config = doc_status.get('parser_config', {})
                                    actual_chunk = actual_config.get('chunk_token_num', '未知')
                                    logger.info(f"🔍 驗證文檔 {doc_id}: chunk_token_num={actual_chunk} (預期={chunk_token_num})")
                                    if actual_chunk != chunk_token_num and actual_chunk != '未知':
                                        logger.warning(f"⚠️ chunk_token_num 不符! 重試設定...")
                                        await rag_client.async_update_document(
                                            dataset_id=ragflow_dataset_id,
                                            document_id=doc_id,
                                            chunk_method="naive",
                                            parser_config={"chunk_token_num": chunk_token_num}
                                        )
                                        await asyncio.sleep(1)
                                except Exception as verify_err:
                                    logger.warning(f"⚠️ 驗證 parser_config 失敗: {verify_err}")

                            import httpx
                            async with httpx.AsyncClient(timeout=300) as parse_client:
                                parse_resp = await parse_client.post(
                                    f"{ragflow_api_url}/datasets/{ragflow_dataset_id}/chunks",
                                    headers={
                                        "Authorization": f"Bearer {api_keys['RAGFLOW_API_KEY']}",
                                        "Content-Type": "application/json"
                                    },
                                    json={"document_ids": doc_ids}
                                )
                                parse_resp.raise_for_status()
                                logger.info(f"✅ 已觸發 RAGFlow 文檔解析: {doc_ids} (chunk_token_num={chunk_token_num})")
                                ragflow_doc_ids = doc_ids
            except Exception as e:
                logger.warning(f"⚠️ RAGFlow 上傳失敗（繼續處理）: {e}")
            finally:
                if temp_file_for_ragflow and temp_file_for_ragflow.exists():
                    try:
                        temp_file_for_ragflow.unlink()
                    except OSError:
                        pass

        # ── 階段 3: 回填 meta.json ──
        metadata["ragflow_result"] = ragflow_result
        metadata["ragflow_doc_ids"] = ragflow_doc_ids if ai_enabled else None
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        # ── 階段 3.5: ragflow_dataset_id 回寫圖譜 ──
        if ai_enabled and ragflow_dataset_id and graph_id:
            try:
                from backend.api.graph import get_kuzu_manager
                kuzu_mgr = get_kuzu_manager()
                if kuzu_mgr:
                    existing_meta = kuzu_mgr.get_graph_metadata(graph_id)
                    if existing_meta and not existing_meta.get('ragflow_dataset_id'):
                        kuzu_mgr.update_graph_metadata(graph_id, ragflow_dataset_id=ragflow_dataset_id)
                        logger.info(f"📌 已將 ragflow_dataset_id={ragflow_dataset_id} 寫入圖譜 {graph_id}")
            except Exception as e:
                logger.warning(f"⚠️ 回寫 ragflow_dataset_id 失敗（不影響上傳）: {e}")

        # ── 階段 4: 寫入主檔案（觸發 Watcher） ──
        with open(file_path, "wb") as buffer:
            buffer.write(content)

        logger.info(f"✅ 檔案上傳成功，已進入監控佇列: {file_path}")

        message = "檔案已送入神經網路，正在解析中..."
        if ai_enabled:
            if ragflow_result:
                message = "✨ 檔案已上傳到 RAGFlow 並送入神經網路，正在 AI 分析中..."
            else:
                message = "⚠️ 檔案已送入神經網路（RAGFlow 上傳失敗），正在解析中..."

        return {
            "success": True,
            "message": message,
            "filename": file.filename,
            "saved_path": str(file_path),
            "size": os.path.getsize(file_path),
            "upload_time": datetime.now().isoformat(),
            "ai_enabled": ai_enabled,
            "ragflow_processed": ragflow_result is not None,
            "ragflow_dataset_id": ragflow_dataset_id if ai_enabled else None,
            "ragflow_doc_ids": ragflow_doc_ids if ai_enabled else []
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 檔案上傳失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"檔案上傳失敗: {str(e)}")
