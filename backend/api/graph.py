"""
知識圖譜 API 路由
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


def get_kuzu_manager(request: Request = None):
    """獲取 KuzuDB 管理器（透過 app.state，避免循環引用）"""
    if request and hasattr(request.app.state, 'kuzu_manager'):
        return request.app.state.kuzu_manager
    # 退路：保持舊行為以防單元測試
    import sys
    if 'app_anytype' in sys.modules:
        mod = sys.modules['app_anytype']
        if hasattr(mod, 'app') and hasattr(mod.app.state, 'kuzu_manager'):
            return mod.app.state.kuzu_manager
    return None


class EntityCreate(BaseModel):
    """實體創建模型"""
    id: str
    name: str
    type: str
    properties: Optional[Dict[str, Any]] = {}
    graph_id: Optional[str] = "1"  # 所屬圖譜 ID


class RelationCreate(BaseModel):
    """關係創建模型"""
    from_id: str
    to_id: str
    relation_type: str
    properties: Optional[Dict[str, Any]] = {}


class CypherQuery(BaseModel):
    """Cypher 查詢模型"""
    query: str
    parameters: Optional[Dict[str, Any]] = {}


class GraphMetadataCreate(BaseModel):
    """圖譜元數據創建模型"""
    name: str
    description: Optional[str] = ""
    icon: Optional[str] = "🌐"
    color: Optional[str] = "#3b82f6"


class GraphMetadataUpdate(BaseModel):
    """圖譜元數據更新模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


def _clean_graph_metadata(graph: dict) -> dict:
    """移除 KuzuDB 內部欄位（_id, _label），避免序列化問題"""
    if graph:
        graph.pop('_id', None)
        graph.pop('_label', None)
    return graph


class EntityUpdate(BaseModel):
    """實體更新模型"""
    name: Optional[str] = None
    type: Optional[str] = None
    link: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    color: Optional[str] = None
    size: Optional[int] = None


@router.post("/entities")
async def create_entity(request: Request, entity: EntityCreate):
    """創建實體節點"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    success = kuzu_manager.add_entity(
        entity.id,
        entity.name,
        entity.type,
        entity.properties or {},
        graph_id=entity.graph_id or "1"
    )
    
    if success:
        return {"status": "success", "entity_id": entity.id}
    else:
        raise HTTPException(status_code=500, detail="創建實體失敗")


@router.put("/entities/{entity_id}")
async def update_entity(request: Request, entity_id: str, entity_data: EntityUpdate):
    """更新實體節點（支持更新名稱、類型及屬性欄位）"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    try:
        # 構建屬性更新 dict（link, description, image 等存入 properties）
        properties_update = {}
        if entity_data.link is not None:
            properties_update["link"] = entity_data.link
        if entity_data.description is not None:
            properties_update["description"] = entity_data.description
        if entity_data.image is not None:
            properties_update["image"] = entity_data.image
        if entity_data.color is not None:
            properties_update["color"] = entity_data.color
        if entity_data.size is not None:
            properties_update["size"] = entity_data.size
        
        success = kuzu_manager.update_entity(
            entity_id,
            name=entity_data.name,
            entity_type=entity_data.type,
            properties=properties_update if properties_update else None
        )
        
        if not success:
            raise HTTPException(status_code=404, detail=f"實體 {entity_id} 不存在或更新失敗")
        
        return {
            "success": True,
            "message": f"實體 {entity_id} 已更新",
            "entity_id": entity_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 更新實體失敗: {e}")
        raise HTTPException(status_code=500, detail=f"更新實體失敗: {str(e)}")


@router.delete("/entities/{entity_id}")
async def delete_entity(request: Request, entity_id: str):
    """刪除實體節點（同時刪除所有相關連線）"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    try:
        # 先確認實體存在
        entity = kuzu_manager.get_entity(entity_id)
        if not entity:
            raise HTTPException(status_code=404, detail=f"實體 {entity_id} 不存在")
        
        success = kuzu_manager.delete_entity(entity_id)
        
        if not success:
            raise HTTPException(status_code=500, detail="刪除實體失敗")
        
        entity_data = entity.get('e', {})
        return {
            "success": True,
            "message": f"實體「{entity_data.get('name', entity_id)}」及相關連線已刪除",
            "entity_id": entity_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 刪除實體失敗: {e}")
        raise HTTPException(status_code=500, detail=f"刪除實體失敗: {str(e)}")


@router.post("/relations")
async def create_relation(request: Request, relation: RelationCreate):
    """創建關係"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    success = kuzu_manager.add_relation(
        relation.from_id,
        relation.to_id,
        relation.relation_type,
        relation.properties or {}
    )
    
    if success:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=500, detail="創建關係失敗")


@router.get("/entities/{entity_id}")
async def get_entity(request: Request, entity_id: str):
    """獲取實體詳情"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    entity = kuzu_manager.get_entity(entity_id)
    
    if entity:
        return entity
    else:
        raise HTTPException(status_code=404, detail="實體不存在")


@router.get("/entities")
async def search_entities(request: Request, keyword: str, entity_type: Optional[str] = None):
    """搜索實體"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    results = kuzu_manager.search_entities(keyword, entity_type or "")
    return {"results": results, "count": len(results)}


@router.get("/entities/{entity_id}/neighbors")
async def get_neighbors(request: Request, entity_id: str, depth: int = 1):
    """獲取鄰居節點"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    neighbors = kuzu_manager.get_neighbors(entity_id, depth)
    return {"neighbors": neighbors, "count": len(neighbors)}


@router.get("/list")
async def list_graphs_legacy(request: Request):
    """獲取所有圖譜列表（已改用 /metadata 端點，此接口為相容保留）"""
    kuzu_manager = get_kuzu_manager(request)
    
    try:
        # 使用真實的圖譜元數據
        if kuzu_manager:
            graphs = kuzu_manager.list_graph_metadata()
            # 清理 KuzuDB 內部欄位
            graphs = [_clean_graph_metadata(g) for g in graphs]
            if graphs:
                # 補充節點/連結統計（使用參數化查詢）
                for g in graphs:
                    try:
                        gid = g.get('id', '')
                        nodes_result = kuzu_manager.query(
                            "MATCH (n:Entity) WHERE n.graph_id = $gid OR (n.graph_id IS NULL AND $gid = '1') RETURN count(n) as count",
                            parameters={"gid": gid}
                        )
                        g['nodeCount'] = nodes_result[0].get('count', 0) if nodes_result else 0
                        links_result = kuzu_manager.query(
                            "MATCH (a:Entity)-[r:Relation]->(b:Entity) WHERE a.graph_id = $gid RETURN count(r) as count",
                            parameters={"gid": gid}
                        )
                        g['linkCount'] = links_result[0].get('count', 0) if links_result else 0
                    except Exception:
                        g['nodeCount'] = 0
                        g['linkCount'] = 0
                return {"graphs": graphs}
        
        # fallback：返回空列表
        return {"graphs": []}
        
    except Exception as e:
        logger.error(f"❌ 獲取圖譜列表失敗: {e}")
        return {"graphs": []}


# Cypher 查詢白名單 — 只允許讀取操作
CYPHER_ALLOWED_KEYWORDS = {"MATCH", "RETURN", "WHERE", "WITH", "ORDER", "LIMIT", "SKIP", "UNWIND", "OPTIONAL", "DISTINCT", "COUNT", "AS", "BY", "DESC", "ASC", "AND", "OR", "NOT", "IN", "IS", "NULL", "CONTAINS", "STARTS", "ENDS"}
CYPHER_BLOCKED_KEYWORDS = {"CREATE", "DELETE", "DETACH", "SET", "REMOVE", "MERGE", "DROP", "ALTER", "CALL", "COPY", "LOAD"}

def _validate_cypher_query(query: str) -> bool:
    """驗證 Cypher 查詢是否安全（僅允許讀取操作）"""
    # 將查詢轉為大寫並提取所有關鍵字
    upper_query = query.upper().strip()
    for blocked in CYPHER_BLOCKED_KEYWORDS:
        # 檢查是否以 blocked keyword 開頭，或在查詢中作為獨立詞出現
        if upper_query.startswith(blocked) or f" {blocked} " in f" {upper_query} ":
            return False
    return True


@router.post("/query")
async def execute_query(request: Request, query_request: CypherQuery):
    """執行 Cypher 查詢（僅允許讀取操作）"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    # 驗證查詢安全性（禁止寫入/刪除操作）
    if not _validate_cypher_query(query_request.query):
        raise HTTPException(
            status_code=403,
            detail="安全限制：僅允許讀取查詢（MATCH/RETURN），禁止 CREATE/DELETE/DROP/SET 等寫入操作"
        )
    
    try:
        results = kuzu_manager.query(query_request.query, query_request.parameters or {})
        return {"results": results, "count": len(results)}
    except Exception as e:
        logger.error(f"查詢執行失敗: {e}")
        raise HTTPException(status_code=500, detail=f"查詢執行失敗: {str(e)}")


# ===== 圖譜元數據 API =====

@router.post("/metadata", status_code=201)
async def create_graph(request: Request, graph_data: GraphMetadataCreate):
    """創建新圖譜元數據"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    try:
        # 生成圖譜 ID
        import uuid
        graph_id = f"graph_{uuid.uuid4().hex[:12]}"
        
        # 創建圖譜元數據
        success = kuzu_manager.create_graph_metadata(
            graph_id=graph_id,
            name=graph_data.name,
            description=graph_data.description or "",
            icon=graph_data.icon or "🌐",
            color=graph_data.color or "#3b82f6"
        )
        
        if not success:
            raise HTTPException(status_code=500, detail="創建圖譜失敗")
        
        # 獲取創建的圖譜
        graph = kuzu_manager.get_graph_metadata(graph_id)
        
        return {
            "success": True,
            "message": f"圖譜「{graph_data.name}」創建成功",
            "graph": _clean_graph_metadata(graph)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 創建圖譜失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"創建圖譜失敗: {str(e)}")


@router.get("/metadata")
async def list_graphs(request: Request):
    """獲取所有圖譜元數據列表"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    try:
        graphs = kuzu_manager.list_graph_metadata()
        # 清理 KuzuDB 內部欄位
        graphs = [_clean_graph_metadata(g) for g in graphs]
        
        return {
            "success": True,
            "graphs": graphs,
            "count": len(graphs)
        }
        
    except Exception as e:
        logger.error(f"❌ 獲取圖譜列表失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"獲取圖譜列表失敗: {str(e)}")


@router.get("/metadata/{graph_id}")
async def get_graph(request: Request, graph_id: str):
    """獲取指定圖譜元數據"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    try:
        graph = kuzu_manager.get_graph_metadata(graph_id)
        
        if not graph:
            raise HTTPException(status_code=404, detail=f"圖譜 {graph_id} 不存在")
        
        return {
            "success": True,
            "graph": _clean_graph_metadata(graph)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 獲取圖譜失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"獲取圖譜失敗: {str(e)}")


@router.put("/metadata/{graph_id}")
async def update_graph(request: Request, graph_id: str, graph_data: GraphMetadataUpdate):
    """更新圖譜元數據"""
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    try:
        # 檢查圖譜是否存在
        existing = kuzu_manager.get_graph_metadata(graph_id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"圖譜 {graph_id} 不存在")
        
        # 只更新提供的字段
        updates = {}
        if graph_data.name is not None:
            updates['name'] = graph_data.name
        if graph_data.description is not None:
            updates['description'] = graph_data.description
        if graph_data.icon is not None:
            updates['icon'] = graph_data.icon
        if graph_data.color is not None:
            updates['color'] = graph_data.color
        
        if not updates:
            raise HTTPException(status_code=400, detail="未提供更新字段")
        
        success = kuzu_manager.update_graph_metadata(graph_id, **updates)
        
        if not success:
            raise HTTPException(status_code=500, detail="更新圖譜失敗")
        
        # 獲取更新後的圖譜
        graph = kuzu_manager.get_graph_metadata(graph_id)
        
        return {
            "success": True,
            "message": f"圖譜更新成功",
            "graph": _clean_graph_metadata(graph)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 更新圖譜失敗: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"更新圖譜失敗: {str(e)}")


@router.delete("/metadata/{graph_id}")
async def delete_graph(request: Request, graph_id: str, cascade: bool = False):
    """刪除圖譜元數據
    
    Args:
        graph_id: 圖譜 ID
        cascade: 是否級聯刪除該圖譜下的所有節點（預設：否）
    """
    kuzu_manager = get_kuzu_manager(request)
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    try:
        # 檢查圖譜是否存在
        existing = kuzu_manager.get_graph_metadata(graph_id)
        if not existing:
            raise HTTPException(status_code=404, detail=f"圖譜 {graph_id} 不存在")
        
        success = kuzu_manager.delete_graph_metadata(graph_id, cascade=cascade)
        
        if not success:
            raise HTTPException(status_code=500, detail="刪除圖譜失敗")
        
        return {
            "success": True,
            "message": f"圖譜「{existing.get('name', graph_id)}」已刪除"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ 刪除圖譜失敗: {e}")
        raise HTTPException(status_code=500, detail=f"刪除圖譜失敗: {str(e)}")
