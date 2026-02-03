"""
KuzuDB 知識圖譜管理器
"""
import kuzu
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging
import os
import json

logger = logging.getLogger(__name__)


class KuzuDBManager:
    """KuzuDB 連接與操作管理"""
    
    def __init__(self, db_path: str):
        """初始化 KuzuDB 連接"""
        # 確保使用 ASCII 相容路徑
        try:
            # 嘗試編碼測試
            db_path.encode('ascii')
            self.db_path = Path(db_path)
        except UnicodeEncodeError:
            # 如果路徑包含非 ASCII 字符，使用預設路徑
            logger.warning(f"路徑包含非 ASCII 字符，使用預設路徑")
            self.db_path = Path("C:/BruV_Data/kuzu_db")
        
        # 確保父目錄存在
        try:
            self.db_path.parent.mkdir(parents=True, exist_ok=True)
            logger.info(f"父目錄已創建: {self.db_path.parent}")
        except Exception as e:
            logger.error(f"創建父目錄失敗: {e}")
            raise
        
        # Windows 路徑修復：如果目錄已存在，刪除後重新創建
        if self.db_path.exists() and self.db_path.is_dir():
            import shutil
            try:
                logger.warning(f"檢測到已存在的目錄，嘗試清理: {self.db_path}")
                shutil.rmtree(self.db_path)
                logger.info(f"已清理舊目錄: {self.db_path}")
            except Exception as e:
                logger.warning(f"無法清理目錄: {e}，將使用新路徑")
                # 使用時間戳避免衝突
                import time
                new_path = self.db_path.parent / f"kuzu_db_{int(time.time())}"
                logger.info(f"使用新路徑: {new_path}")
                self.db_path = new_path
        
        try:
            # 使用字符串路徑並確保使用正斜杠
            db_path_str = str(self.db_path).replace('\\', '/')
            logger.info(f"嘗試初始化 KuzuDB: {db_path_str}")
            
            # KuzuDB 會自動創建目錄
            self.db = kuzu.Database(db_path_str)
            self.conn = kuzu.Connection(self.db)
            self._initialize_schema()
            logger.info(f"✅ KuzuDB 初始化成功: {db_path_str}")
        except Exception as e:
            logger.error(f"❌ KuzuDB 初始化失敗: {e}")
            raise
    
    def _initialize_schema(self):
        """初始化圖譜結構"""
        try:
            # 創建節點表 - 實體
            self.conn.execute("""
                CREATE NODE TABLE IF NOT EXISTS Entity(
                    id STRING,
                    name STRING,
                    type STRING,
                    properties STRING,
                    PRIMARY KEY(id)
                )
            """)
            
            # 創建關係表
            self.conn.execute("""
                CREATE REL TABLE IF NOT EXISTS Relation(
                    FROM Entity TO Entity,
                    relation_type STRING,
                    properties STRING
                )
            """)
            
            logger.info("✅ 圖譜結構初始化完成")
        except Exception as e:
            logger.warning(f"圖譜結構可能已存在: {e}")
    
    def add_entity(self, entity_id: str, name: str, entity_type: str, properties: Dict = None) -> bool:
        """添加實體節點"""
        try:
            props = str(properties or {})
            self.conn.execute(
                "CREATE (e:Entity {id: $id, name: $name, type: $type, properties: $props})",
                parameters={"id": entity_id, "name": name, "type": entity_type, "props": props}
            )
            logger.info(f"✅ 添加實體: {name} ({entity_type})")
            return True
        except Exception as e:
            logger.error(f"❌ 添加實體失敗: {e}")
            return False
    
    def add_relation(self, from_id: str, to_id: str, relation_type: str, properties: Dict = None) -> bool:
        """添加關係"""
        try:
            props = str(properties or {})
            query = """
                MATCH (a:Entity {id: $from_id}), (b:Entity {id: $to_id})
                CREATE (a)-[:Relation {relation_type: $rel_type, properties: $props}]->(b)
            """
            self.conn.execute(
                query,
                parameters={
                    "from_id": from_id,
                    "to_id": to_id,
                    "rel_type": relation_type,
                    "props": props
                }
            )
            logger.info(f"✅ 添加關係: {from_id} -[{relation_type}]-> {to_id}")
            return True
        except Exception as e:
            logger.error(f"❌ 添加關係失敗: {e}")
            return False
    
    def query(self, cypher_query: str, parameters: Dict = None) -> List[Dict[str, Any]]:
        """執行 Cypher 查詢"""
        try:
            result = self.conn.execute(cypher_query, parameters=parameters or {})
            return [dict(row) for row in result.get_as_df().to_dict('records')]
        except Exception as e:
            logger.error(f"❌ 查詢失敗: {e}")
            return []
    
    def get_entity(self, entity_id: str) -> Optional[Dict]:
        """獲取實體詳情"""
        result = self.query(
            "MATCH (e:Entity {id: $id}) RETURN e",
            parameters={"id": entity_id}
        )
        return result[0] if result else None
    
    def search_entities(self, keyword: str, entity_type: str = None) -> List[Dict]:
        """搜索實體"""
        if entity_type:
            query = "MATCH (e:Entity {type: $type}) WHERE e.name CONTAINS $keyword RETURN e"
            params = {"type": entity_type, "keyword": keyword}
        else:
            query = "MATCH (e:Entity) WHERE e.name CONTAINS $keyword RETURN e"
            params = {"keyword": keyword}
        
        return self.query(query, parameters=params)
    
    def get_neighbors(self, entity_id: str, depth: int = 1) -> List[Dict]:
        """獲取鄰居節點"""
        query = f"""
            MATCH (e:Entity {{id: $id}})-[r*1..{depth}]-(neighbor:Entity)
            RETURN DISTINCT neighbor, r
        """
        return self.query(query, parameters={"id": entity_id})
    
    def close(self):
        """關閉連接"""
        try:
            self.conn.close()
            logger.info("✅ KuzuDB 連接已關閉")
        except Exception as e:
            logger.error(f"❌ 關閉連接失敗: {e}")


class MockKuzuManager:
    """Mock KuzuDB 管理器 - 用於開發環境當 KuzuDB 不可用時"""
    
    def __init__(self, db_path: str = None):
        """初始化 Mock 管理器"""
        self.entities = {}  # 記憶體中的實體存儲 {id: entity_data}
        self.relations = []  # 記憶體中的關係存儲
        logger.warning("⚠️ 使用 MockKuzuManager（記憶體模式）")
        logger.info("✅ MockKuzuManager 初始化成功")
        
        # 預設一些範例資料
        self._load_sample_data()
    
    def _load_sample_data(self):
        """載入範例資料"""
        sample_entities = [
            {"id": "ENT-0001", "name": "企業知識庫", "type": "System", "properties": {"status": "active"}},
            {"id": "ENT-0002", "name": "AI 模型", "type": "Technology", "properties": {"version": "1.0"}},
            {"id": "ENT-0003", "name": "RAGFlow", "type": "System", "properties": {"status": "running"}},
            {"id": "ENT-0004", "name": "Dify", "type": "Platform", "properties": {"status": "running"}},
            {"id": "ENT-0005", "name": "知識圖譜", "type": "Database", "properties": {"type": "graph"}},
        ]
        
        for entity in sample_entities:
            self.entities[entity["id"]] = entity
        
        # 範例關係
        self.relations = [
            {"from": "ENT-0001", "to": "ENT-0002", "type": "uses", "properties": {}},
            {"from": "ENT-0002", "to": "ENT-0003", "type": "integrates", "properties": {}},
            {"from": "ENT-0004", "to": "ENT-0001", "type": "manages", "properties": {}},
            {"from": "ENT-0001", "to": "ENT-0005", "type": "stores_in", "properties": {}},
        ]
        
        logger.info(f"已載入 {len(self.entities)} 個範例實體和 {len(self.relations)} 個關係")
    
    def _initialize_schema(self):
        """Mock 初始化結構（不需要實際操作）"""
        pass
    
    def add_entity(self, entity_id: str, name: str, entity_type: str, properties: Dict = None) -> bool:
        """添加實體節點（記憶體模式）"""
        try:
            self.entities[entity_id] = {
                "id": entity_id,
                "name": name,
                "type": entity_type,
                "properties": properties or {}
            }
            logger.info(f"✅ [Mock] 添加實體: {name} ({entity_type})")
            return True
        except Exception as e:
            logger.error(f"❌ [Mock] 添加實體失敗: {e}")
            return False
    
    def add_relation(self, from_id: str, to_id: str, relation_type: str, properties: Dict = None) -> bool:
        """添加關係（記憶體模式）"""
        try:
            self.relations.append({
                "from": from_id,
                "to": to_id,
                "type": relation_type,
                "properties": properties or {}
            })
            logger.info(f"✅ [Mock] 添加關係: {from_id} -[{relation_type}]-> {to_id}")
            return True
        except Exception as e:
            logger.error(f"❌ [Mock] 添加關係失敗: {e}")
            return False
    
    def query(self, cypher_query: str, parameters: Dict = None) -> List[Dict[str, Any]]:
        """執行查詢（返回 Mock 資料）"""
        logger.info(f"🔍 [Mock] 執行查詢: {cypher_query[:100]}...")
        
        # 簡單的 Mock 查詢邏輯
        if "MATCH (n)-[r]->(m)" in cypher_query:
            # 返回所有關係和節點
            results = []
            for rel in self.relations[:25]:  # LIMIT 25
                from_entity = self.entities.get(rel["from"])
                to_entity = self.entities.get(rel["to"])
                if from_entity and to_entity:
                    results.append({
                        "n": from_entity,
                        "r": rel,
                        "m": to_entity
                    })
            return results
        else:
            # 返回所有實體
            return [{"e": entity} for entity in list(self.entities.values())[:10]]
    
    def get_entity(self, entity_id: str) -> Optional[Dict]:
        """獲取實體詳情（記憶體模式）"""
        return self.entities.get(entity_id)
    
    def search_entities(self, keyword: str, entity_type: str = None) -> List[Dict]:
        """搜索實體（記憶體模式）"""
        results = []
        for entity in self.entities.values():
            # 名稱匹配
            if keyword.lower() in entity["name"].lower():
                # 類型過濾
                if entity_type is None or entity["type"] == entity_type:
                    results.append(entity)
        
        logger.info(f"🔍 [Mock] 搜索 '{keyword}' 找到 {len(results)} 個結果")
        return results
    
    def get_neighbors(self, entity_id: str, depth: int = 1) -> List[Dict]:
        """獲取鄰居節點（記憶體模式）"""
        neighbors = []
        
        # 查找所有相關關係
        for rel in self.relations:
            if rel["from"] == entity_id:
                neighbor = self.entities.get(rel["to"])
                if neighbor:
                    neighbors.append({
                        "node": neighbor,
                        "relation": rel
                    })
            elif rel["to"] == entity_id:
                neighbor = self.entities.get(rel["from"])
                if neighbor:
                    neighbors.append({
                        "node": neighbor,
                        "relation": rel
                    })
        
        logger.info(f"🔍 [Mock] 找到 {len(neighbors)} 個鄰居節點")
        return neighbors
    
    def close(self):
        """關閉連接（Mock 無需操作）"""
        logger.info("✅ [Mock] MockKuzuManager 已關閉")
