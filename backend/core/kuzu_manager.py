"""
KuzuDB 知識圖譜管理器
"""
import asyncio
import kuzu
from concurrent.futures import ThreadPoolExecutor
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
        
        # 直接開啟已存在的數據庫，KuzuDB 原生支持開啟已有目錄
        if self.db_path.exists() and self.db_path.is_dir():
            logger.info(f"檢測到已存在的數據庫目錄，將直接開啟: {self.db_path}")
        
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
            # 創建圖譜元數據表
            self.conn.execute("""
                CREATE NODE TABLE IF NOT EXISTS GraphMetadata(
                    id STRING,
                    name STRING,
                    description STRING,
                    icon STRING,
                    color STRING,
                    cover_image STRING,
                    created_at STRING,
                    updated_at STRING,
                    node_count INT64,
                    link_count INT64,
                    PRIMARY KEY(id)
                )
            """)
            
            # 擴展 GraphMetadata：增加 ragflow_dataset_id 欄位（向下相容）
            try:
                self.conn.execute("""
                    ALTER TABLE GraphMetadata ADD ragflow_dataset_id STRING DEFAULT ''
                """)
                logger.info("📌 GraphMetadata 新增 ragflow_dataset_id 欄位")
            except Exception:
                pass  # 欄位已存在則忽略

            # 創建節點表 - 實體（增加 graph_id 支持多圖譜）
            self.conn.execute("""
                CREATE NODE TABLE IF NOT EXISTS Entity(
                    id STRING,
                    name STRING,
                    type STRING,
                    properties STRING,
                    graph_id STRING,
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
            
            # 遷移：為已有的 GraphMetadata 表新增 cover_image 欄位
            try:
                self.conn.execute("ALTER TABLE GraphMetadata ADD cover_image STRING DEFAULT ''")
                logger.info("✅ GraphMetadata 新增 cover_image 欄位")
            except Exception:
                pass  # 欄位已存在，忽略
                
        except Exception as e:
            logger.warning(f"圖譜結構可能已存在: {e}")
    
    def add_entity(self, entity_id: str, name: str, entity_type: str, properties: Dict = None, graph_id: str = "1") -> bool:
        """添加實體節點
        
        Args:
            entity_id: 節點 ID
            name: 節點名稱
            entity_type: 節點類型
            properties: 節點屬性
            graph_id: 所屬圖譜 ID (預設為 "1" 主腦圖譜)
        """
        try:
            props = str(properties or {})
            # 使用 MERGE 實現 upsert：主鍵已存在時更新，不存在時建立
            self.conn.execute(
                "MERGE (e:Entity {id: $id}) "
                "SET e.name = $name, e.type = $type, e.properties = $props, e.graph_id = $graph_id",
                parameters={"id": entity_id, "name": name, "type": entity_type, "props": props, "graph_id": graph_id}
            )
            logger.info(f"✅ 添加實體: {name} ({entity_type})")
            return True
        except Exception as e:
            logger.error(f"❌ 添加實體失敗: {e}")
            return False
    
    def add_relation(self, source_id: str, target_id: str, relation_type: str = "related_to", properties: Dict = None) -> bool:
        """建立兩個節點之間的連線
        
        Args:
            source_id: 源節點 ID
            target_id: 目標節點 ID
            relation_type: 關係類型 (預設 "related_to")
            properties: 關係屬性 (預設 {})
            
        Returns:
            bool: 成功返回 True，失敗返回 False
        """
        try:
            props = str(properties or {})
            query = """
                MATCH (a:Entity {id: $source_id}), (b:Entity {id: $target_id})
                CREATE (a)-[:Relation {relation_type: $rel_type, properties: $props}]->(b)
            """
            self.conn.execute(
                query,
                parameters={
                    "source_id": source_id,
                    "target_id": target_id,
                    "rel_type": relation_type,
                    "props": props
                }
            )
            logger.info(f"✅ 添加關係: {source_id} -[{relation_type}]-> {target_id}")
            return True
        except RuntimeError as e:
            logger.error(f"❌ 添加關係失敗（節點可能不存在）: {source_id} -> {target_id} - {e}")
            return False
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
    
    def update_entity(self, entity_id: str, name: Optional[str] = None, entity_type: Optional[str] = None, 
                      properties: Optional[Dict] = None) -> bool:
        """更新實體節點
        
        Args:
            entity_id: 節點 ID
            name: 新名稱（可選）
            entity_type: 新類型（可選）
            properties: 新屬性 dict（會與現有屬性合併）
        
        Returns:
            bool: 成功返回 True
        """
        try:
            # 先檢查實體是否存在
            existing = self.get_entity(entity_id)
            if not existing:
                logger.error(f"❌ 實體不存在: {entity_id}")
                return False
            
            # 構建動態 SET 子句
            set_parts = []
            params = {"id": entity_id}
            
            if name is not None:
                set_parts.append("e.name = $name")
                params["name"] = name
            
            if entity_type is not None:
                set_parts.append("e.type = $type")
                params["type"] = entity_type
            
            if properties is not None:
                # 合併現有屬性
                import json
                existing_entity = existing.get('e', {})
                existing_props_str = existing_entity.get('properties', '{}')
                try:
                    if isinstance(existing_props_str, str):
                        existing_props = json.loads(existing_props_str.replace("'", '"'))
                    else:
                        existing_props = existing_props_str or {}
                except (json.JSONDecodeError, AttributeError):
                    existing_props = {}
                
                # 合併屬性
                merged_props = {**existing_props, **properties}
                set_parts.append("e.properties = $props")
                params["props"] = str(merged_props)
            
            if not set_parts:
                return True  # 沒有要更新的欄位
            
            query = f"MATCH (e:Entity {{id: $id}}) SET {', '.join(set_parts)}"
            self.conn.execute(query, parameters=params)
            
            logger.info(f"✅ 實體已更新: {entity_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ 更新實體失敗: {e}")
            return False
    
    def delete_entity(self, entity_id: str) -> bool:
        """刪除實體節點（同時刪除所有相關連線）
        
        Args:
            entity_id: 節點 ID
        
        Returns:
            bool: 成功返回 True
        """
        try:
            # 先刪除所有關聯的連線
            self.conn.execute(
                "MATCH (e:Entity {id: $id})-[r:Relation]-() DELETE r",
                parameters={"id": entity_id}
            )
            
            # 刪除節點本身
            self.conn.execute(
                "MATCH (e:Entity {id: $id}) DELETE e",
                parameters={"id": entity_id}
            )
            
            logger.info(f"🗑️ 實體已刪除: {entity_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ 刪除實體失敗: {e}")
            return False
    
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
        # 限制深度範圍，防止資源耗盡
        depth = max(1, min(depth, 5))
        query = f"""
            MATCH (e:Entity {{id: $id}})-[r*1..{depth}]-(neighbor:Entity)
            RETURN DISTINCT neighbor, r
        """
        return self.query(query, parameters={"id": entity_id})
    
    # ===== 圖譜元數據管理 =====
    
    def create_graph_metadata(self, graph_id: str, name: str, description: str = "", 
                              icon: str = "🌐", color: str = "#3b82f6", cover_image: str = "",
                              ragflow_dataset_id: str = "") -> bool:
        """創建圖譜元數據
        
        Args:
            graph_id: 圖譜唯一 ID
            name: 圖譜名稱
            description: 圖譜描述
            icon: 圖標 emoji
            color: 主題顏色
            cover_image: 封面圖片（base64 DataURL 或 URL）
            ragflow_dataset_id: 關聯的 RAGFlow 知識庫 ID
        
        Returns:
            是否創建成功
        """
        try:
            from datetime import datetime
            now = datetime.now().isoformat()
            
            self.conn.execute("""
                CREATE (g:GraphMetadata {
                    id: $id,
                    name: $name,
                    description: $description,
                    icon: $icon,
                    color: $color,
                    cover_image: $cover_image,
                    created_at: $created_at,
                    updated_at: $updated_at,
                    node_count: $node_count,
                    link_count: $link_count,
                    ragflow_dataset_id: $ragflow_dataset_id
                })
            """, parameters={
                "id": graph_id,
                "name": name,
                "description": description,
                "icon": icon,
                "color": color,
                "cover_image": cover_image,
                "created_at": now,
                "updated_at": now,
                "node_count": 0,
                "link_count": 0,
                "ragflow_dataset_id": ragflow_dataset_id
            })
            
            logger.info(f"✅ 圖譜元數據創建成功: {name} (ID: {graph_id})")
            return True
            
        except Exception as e:
            logger.error(f"❌ 創建圖譜元數據失敗: {e}")
            return False
    
    def get_graph_metadata(self, graph_id: str) -> Optional[Dict]:
        """獲取圖譜元數據
        
        Args:
            graph_id: 圖譜 ID
        
        Returns:
            圖譜元數據字典，不存在則返回 None
        """
        try:
            result = self.query("""
                MATCH (g:GraphMetadata {id: $id})
                RETURN g
            """, parameters={"id": graph_id})
            
            if result and len(result) > 0:
                return result[0].get('g', {})
            return None
            
        except Exception as e:
            logger.error(f"❌ 獲取圖譜元數據失敗: {e}")
            return None
    
    def list_graph_metadata(self) -> List[Dict]:
        """列出所有圖譜元數據
        
        Returns:
            圖譜元數據列表
        """
        try:
            result = self.query("""
                MATCH (g:GraphMetadata)
                RETURN g
                ORDER BY g.created_at DESC
            """)
            
            graphs = []
            for row in result:
                graph_data = row.get('g', {})
                if graph_data:
                    graphs.append(graph_data)
            
            logger.info(f"📋 查詢到 {len(graphs)} 個圖譜")
            return graphs
            
        except Exception as e:
            logger.error(f"❌ 列出圖譜元數據失敗: {e}")
            return []
    
    def update_graph_metadata(self, graph_id: str, **updates) -> bool:
        """更新圖譜元數據
        
        Args:
            graph_id: 圖譜 ID
            **updates: 要更新的字段（name, description, icon, color, node_count, link_count）
        
        Returns:
            是否更新成功
        """
        try:
            from datetime import datetime
            updates['updated_at'] = datetime.now().isoformat()
            
            # 構建 SET 語句
            set_clauses = [f"g.{key} = ${key}" for key in updates.keys()]
            set_statement = ", ".join(set_clauses)
            
            query = f"""
                MATCH (g:GraphMetadata {{id: $id}})
                SET {set_statement}
            """
            
            params = {"id": graph_id, **updates}
            self.conn.execute(query, parameters=params)
            
            logger.info(f"✅ 圖譜元數據更新成功: {graph_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ 更新圖譜元數據失敗: {e}")
            return False
    
    def delete_graph_metadata(self, graph_id: str, cascade: bool = False) -> bool:
        """刪除圖譜元數據
        
        Args:
            graph_id: 圖譜 ID
            cascade: 是否級聯刪除該圖譜下的所有節點和關係
        
        Returns:
            是否刪除成功
        """
        try:
            if cascade:
                # 先刪除圖譜下的所有實體
                self.conn.execute("""
                    MATCH (e:Entity {graph_id: $graph_id})
                    DETACH DELETE e
                """, parameters={"graph_id": graph_id})
                logger.info(f"🗑️  已級聯刪除圖譜 {graph_id} 的所有節點")
            
            # 刪除圖譜元數據
            self.conn.execute("""
                MATCH (g:GraphMetadata {id: $id})
                DELETE g
            """, parameters={"id": graph_id})
            
            logger.info(f"✅ 圖譜元數據刪除成功: {graph_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ 刪除圖譜元數據失敗: {e}")
            return False
    
    def update_graph_stats(self, graph_id: str) -> bool:
        """更新圖譜統計信息（節點數、連線數）
        
        Args:
            graph_id: 圖譜 ID
        
        Returns:
            是否更新成功
        """
        try:
            # 統計節點數
            node_result = self.query("""
                MATCH (e:Entity {graph_id: $graph_id})
                RETURN count(e) as count
            """, parameters={"graph_id": graph_id})
            
            node_count = node_result[0].get('count', 0) if node_result else 0
            
            # 統計連線數
            link_result = self.query("""
                MATCH (e1:Entity {graph_id: $graph_id})-[r:Relation]->(e2:Entity {graph_id: $graph_id})
                RETURN count(r) as count
            """, parameters={"graph_id": graph_id})
            
            link_count = link_result[0].get('count', 0) if link_result else 0
            
            # 更新元數據
            return self.update_graph_metadata(
                graph_id, 
                node_count=node_count, 
                link_count=link_count
            )
            
        except Exception as e:
            logger.error(f"❌ 更新圖譜統計失敗: {e}")
            return False
    
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
        self.relations = []  # 記憶體中的關係存儲（舊格式）
        self.edges = []  # 記憶體中的連線存儲（前端 link 格式）
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
    
    def add_entity(self, entity_id: str, name: str, entity_type: str, properties: Dict = None, graph_id: str = "1") -> bool:
        """添加實體節點（記憶體模式）"""
        try:
            self.entities[entity_id] = {
                "id": entity_id,
                "name": name,
                "type": entity_type,
                "properties": properties or {},
                "graph_id": graph_id
            }
            logger.info(f"✅ [Mock] 添加實體: {name} ({entity_type})")
            return True
        except Exception as e:
            logger.error(f"❌ [Mock] 添加實體失敗: {e}")
            return False
    
    def add_relation(self, source_id: str, target_id: str, relation_type: str = "related_to", properties: Dict = None) -> bool:
        """建立兩個節點之間的連線（記憶體模式）
        
        Args:
            source_id: 源節點 ID
            target_id: 目標節點 ID
            relation_type: 關係類型 (預設 "related_to")
            properties: 關係屬性 (預設 {})
            
        Returns:
            bool: 成功返回 True，失敗返回 False
        """
        try:
            # 存入舊格式（保持相容性）
            self.relations.append({
                "from": source_id,
                "to": target_id,
                "type": relation_type,
                "properties": properties or {}
            })
            
            # 存入前端 link 格式
            self.edges.append({
                "source": source_id,
                "target": target_id,
                "label": relation_type,
                "properties": properties or {}
            })
            
            logger.info(f"✅ [Mock] 添加關係: {source_id} -[{relation_type}]-> {target_id}")
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


class AsyncKuzuWrapper:
    """
    為 KuzuDBManager 加入 async 安全層

    設計原則：
    1. 寫入操作序列化 — asyncio.Lock 確保同一時間只有一個寫入
    2. 讀取操作可並行 — 透過 Semaphore 限制並發數
    3. 同步呼叫隔離 — run_in_executor 避免阻塞事件迴圈

    使用方式：
        wrapper = AsyncKuzuWrapper(kuzu_manager)
        result = await wrapper.safe_write("MERGE ...", params)
        result = await wrapper.safe_read("MATCH ...", params)
        # 同步方法依然可用 (向後相容)
        wrapper.add_entity(...)
    """

    def __init__(self, manager: KuzuDBManager, max_workers: int = 4):
        self._manager = manager
        self._write_lock = asyncio.Lock()
        self._read_semaphore = asyncio.Semaphore(max_workers)
        self._executor = ThreadPoolExecutor(
            max_workers=max_workers,
            thread_name_prefix="kuzu"
        )
        logger.info(f"✅ AsyncKuzuWrapper 初始化完成 (max_workers={max_workers})")

    # ---------- 內部同步輔助方法 (在 executor 中執行) ----------

    def _sync_execute(self, cypher: str, parameters: dict):
        """在執行緒池中執行的同步寫入"""
        self._manager.conn.execute(cypher, parameters=parameters)

    def _sync_query(self, cypher: str, parameters: dict) -> list:
        """在執行緒池中執行的同步查詢"""
        result = self._manager.conn.execute(cypher, parameters=parameters)
        return [dict(row) for row in result.get_as_df().to_dict('records')]

    # ---------- Async 安全方法 ----------

    async def safe_write(self, cypher: str, parameters: dict = None) -> bool:
        """序列化寫入 — 所有寫入操作在 Lock 保護下排隊執行"""
        async with self._write_lock:
            loop = asyncio.get_event_loop()
            try:
                await loop.run_in_executor(
                    self._executor,
                    self._sync_execute,
                    cypher,
                    parameters or {}
                )
                return True
            except Exception as e:
                logger.error(f"❌ [AsyncKuzu] 寫入失敗: {e}")
                return False

    async def safe_read(self, cypher: str, parameters: dict = None) -> list:
        """並行讀取 — Semaphore 限制並發數，避免阻塞事件迴圈"""
        async with self._read_semaphore:
            loop = asyncio.get_event_loop()
            try:
                return await loop.run_in_executor(
                    self._executor,
                    self._sync_query,
                    cypher,
                    parameters or {}
                )
            except Exception as e:
                logger.error(f"❌ [AsyncKuzu] 讀取失敗: {e}")
                return []

    async def safe_add_entity(self, entity_id: str, name: str, entity_type: str,
                               properties: Dict = None, graph_id: str = "1") -> bool:
        """Async 安全版本的 add_entity"""
        async with self._write_lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.add_entity,
                entity_id, name, entity_type, properties, graph_id
            )

    async def safe_add_relation(self, source_id: str, target_id: str,
                                 relation_type: str = "related_to",
                                 properties: Dict = None) -> bool:
        """Async 安全版本的 add_relation"""
        async with self._write_lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.add_relation,
                source_id, target_id, relation_type, properties
            )

    async def safe_delete_entity(self, entity_id: str) -> bool:
        """Async 安全版本的 delete_entity"""
        async with self._write_lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.delete_entity,
                entity_id
            )

    async def safe_update_entity(self, entity_id: str, name: Optional[str] = None,
                                  entity_type: Optional[str] = None,
                                  properties: Optional[Dict] = None) -> bool:
        """Async 安全版本的 update_entity"""
        async with self._write_lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.update_entity,
                entity_id, name, entity_type, properties
            )

    async def safe_query(self, cypher_query: str, parameters: Dict = None) -> List[Dict[str, Any]]:
        """Async 安全版本的 query (讀取)"""
        async with self._read_semaphore:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.query,
                cypher_query, parameters
            )

    async def safe_search_entities(self, keyword: str, entity_type: str = None) -> List[Dict]:
        """Async 安全版本的 search_entities"""
        async with self._read_semaphore:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.search_entities,
                keyword, entity_type
            )

    async def safe_get_neighbors(self, entity_id: str, depth: int = 1) -> List[Dict]:
        """Async 安全版本的 get_neighbors"""
        async with self._read_semaphore:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.get_neighbors,
                entity_id, depth
            )

    # ---------- 圖譜元數據 async 安全方法 ----------

    async def safe_create_graph_metadata(self, graph_id: str, name: str,
                                          description: str = "", icon: str = "🌐",
                                          color: str = "#3b82f6") -> bool:
        async with self._write_lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.create_graph_metadata,
                graph_id, name, description, icon, color
            )

    async def safe_get_graph_metadata(self, graph_id: str) -> Optional[Dict]:
        async with self._read_semaphore:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.get_graph_metadata,
                graph_id
            )

    async def safe_list_graph_metadata(self) -> List[Dict]:
        async with self._read_semaphore:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.list_graph_metadata
            )

    async def safe_delete_graph_metadata(self, graph_id: str, cascade: bool = False) -> bool:
        """異步安全刪除圖譜元數據（含可選級聯刪除）"""
        async with self._write_lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                lambda: self._manager.delete_graph_metadata(graph_id, cascade=cascade)
            )

    async def safe_update_graph_stats(self, graph_id: str) -> bool:
        async with self._write_lock:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(
                self._executor,
                self._manager.update_graph_stats,
                graph_id
            )

    # ---------- 同步代理方法 (向後相容) ----------

    def add_entity(self, *args, **kwargs):
        """同步代理 — 向後相容，但無併發保護"""
        return self._manager.add_entity(*args, **kwargs)

    def add_relation(self, *args, **kwargs):
        return self._manager.add_relation(*args, **kwargs)

    def query(self, *args, **kwargs):
        return self._manager.query(*args, **kwargs)

    def get_entity(self, *args, **kwargs):
        return self._manager.get_entity(*args, **kwargs)

    def update_entity(self, *args, **kwargs):
        return self._manager.update_entity(*args, **kwargs)

    def delete_entity(self, *args, **kwargs):
        return self._manager.delete_entity(*args, **kwargs)

    def search_entities(self, *args, **kwargs):
        return self._manager.search_entities(*args, **kwargs)

    def get_neighbors(self, *args, **kwargs):
        return self._manager.get_neighbors(*args, **kwargs)

    def create_graph_metadata(self, *args, **kwargs):
        return self._manager.create_graph_metadata(*args, **kwargs)

    def get_graph_metadata(self, *args, **kwargs):
        return self._manager.get_graph_metadata(*args, **kwargs)

    def list_graph_metadata(self, *args, **kwargs):
        return self._manager.list_graph_metadata(*args, **kwargs)

    def update_graph_metadata(self, *args, **kwargs):
        return self._manager.update_graph_metadata(*args, **kwargs)

    def delete_graph_metadata(self, *args, **kwargs):
        return self._manager.delete_graph_metadata(*args, **kwargs)

    def update_graph_stats(self, *args, **kwargs):
        return self._manager.update_graph_stats(*args, **kwargs)

    def close(self):
        """關閉連接與執行緒池"""
        self._executor.shutdown(wait=False)
        self._manager.close()
        logger.info("✅ AsyncKuzuWrapper 已關閉")

    @property
    def db_path(self):
        return self._manager.db_path
