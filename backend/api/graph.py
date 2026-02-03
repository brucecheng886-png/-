"""
知識圖譜 API 路由
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


class EntityCreate(BaseModel):
    """實體創建模型"""
    id: str
    name: str
    type: str
    properties: Optional[Dict[str, Any]] = {}


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


@router.post("/entities")
async def create_entity(entity: EntityCreate):
    """創建實體節點"""
    from app_anytype import kuzu_manager
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    success = kuzu_manager.add_entity(
        entity.id,
        entity.name,
        entity.type,
        entity.properties
    )
    
    if success:
        return {"status": "success", "entity_id": entity.id}
    else:
        raise HTTPException(status_code=500, detail="創建實體失敗")


@router.post("/relations")
async def create_relation(relation: RelationCreate):
    """創建關係"""
    from app_anytype import kuzu_manager
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    success = kuzu_manager.add_relation(
        relation.from_id,
        relation.to_id,
        relation.relation_type,
        relation.properties
    )
    
    if success:
        return {"status": "success"}
    else:
        raise HTTPException(status_code=500, detail="創建關係失敗")


@router.get("/entities/{entity_id}")
async def get_entity(entity_id: str):
    """獲取實體詳情"""
    from app_anytype import kuzu_manager
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    entity = kuzu_manager.get_entity(entity_id)
    
    if entity:
        return entity
    else:
        raise HTTPException(status_code=404, detail="實體不存在")


@router.get("/entities")
async def search_entities(keyword: str, entity_type: Optional[str] = None):
    """搜索實體"""
    from app_anytype import kuzu_manager
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    results = kuzu_manager.search_entities(keyword, entity_type)
    return {"results": results, "count": len(results)}


@router.get("/entities/{entity_id}/neighbors")
async def get_neighbors(entity_id: str, depth: int = 1):
    """獲取鄰居節點"""
    from app_anytype import kuzu_manager
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    neighbors = kuzu_manager.get_neighbors(entity_id, depth)
    return {"neighbors": neighbors, "count": len(neighbors)}


@router.post("/query")
async def execute_query(query_request: CypherQuery):
    """執行 Cypher 查詢"""
    from app_anytype import kuzu_manager
    
    if not kuzu_manager:
        raise HTTPException(status_code=503, detail="圖譜服務未就緒")
    
    try:
        results = kuzu_manager.query(query_request.query, query_request.parameters)
        return {"results": results, "count": len(results)}
    except Exception as e:
        logger.error(f"查詢執行失敗: {e}")
        raise HTTPException(status_code=500, detail=f"查詢執行失敗: {str(e)}")
