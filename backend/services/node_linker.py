"""
節點互連引擎 — 從 watcher.py 拆分

負責：
  - 同 Domain 資源互連 (same_domain)
  - 關鍵字共現分析 (keyword_overlap)
"""
import re
import json
import logging
from pathlib import Path
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# 停用詞集合（中英文）
_STOPWORDS = frozenset({
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at',
    'to', 'for', 'of', 'and', 'or', 'not', 'with', 'by', 'from',
    'this', 'that', 'it', 'its', 'be', 'has', 'have', 'had', 'do',
    'does', 'did', 'but', 'if', 'as', 'no', 'so', 'up', 'out',
    'about', 'into', 'than', 'then', 'can', 'will', 'just',
    '的', '是', '在', '了', '和', '與', '或', '不', '有', '也',
    '都', '要', '會', '把', '被', '讓', '這', '那', '就',
    'post', 'page', 'http', 'https', 'www', 'com',
})


def extract_keywords(text: str) -> set:
    """
    從文本提取關鍵字集合。
    中文：2 字以上的詞；英文：3 字以上的詞。
    """
    if not text:
        return set()
    words = re.findall(r'[\u4e00-\u9fff]{2,}|[a-zA-Z]{3,}', text.lower())
    return {w for w in words if w not in _STOPWORDS and len(w) <= 20}


def build_inter_node_links(kuzu_manager, file_path: Path,
                           file_node_id: str, graph_id: str = "1") -> int:
    """
    分析同一圖譜中的 Resource 節點，根據以下規則建立互連：
      1. Link Domain 歸類 — 相同網域的資源互相連線 (same_domain)
      2. 關鍵字共現 — title/description 中的共同關鍵字 (keyword_overlap)

    Returns:
        建立的連線數量
    """
    if not kuzu_manager:
        return 0

    try:
        logger.info(f"🔗 開始建立節點互連: graph_id={graph_id}")

        # 查詢同圖譜的所有 Resource 節點
        entities = kuzu_manager.query("""
            MATCH (e:Entity {graph_id: $graph_id})
            WHERE e.type = 'Resource'
            RETURN e.id AS id, e.name AS name, e.properties AS properties
        """, parameters={"graph_id": graph_id})

        if len(entities) < 2:
            logger.info(f"⏭️  節點數量不足 ({len(entities)})，跳過互連")
            return 0

        # 取得已存在的連線 (避免重複)
        existing_relations = set()
        try:
            rels = kuzu_manager.query("""
                MATCH (a:Entity {graph_id: $graph_id})-[:Relation]->(b:Entity {graph_id: $graph_id})
                RETURN a.id AS src, b.id AS dst
            """, parameters={"graph_id": graph_id})
            for r in rels:
                existing_relations.add((r['src'], r['dst']))
                existing_relations.add((r['dst'], r['src']))
        except Exception:
            pass

        # ── 第 1 層：Link Domain 歸類 ──
        domain_groups: dict[str, list[str]] = {}
        entity_map: dict[str, dict] = {}

        for e in entities:
            eid = e['id']
            name = e.get('name', '')
            props_raw = e.get('properties', '{}')

            try:
                if isinstance(props_raw, str):
                    props = json.loads(props_raw) if props_raw.strip().startswith('{') else {}
                else:
                    props = props_raw or {}
            except (ValueError, TypeError):
                props = {}

            link = props.get('link', '')
            description = props.get('description', '')

            entity_map[eid] = {'name': name, 'link': link, 'description': description}

            if link:
                try:
                    parsed = urlparse(link)
                    domain = parsed.netloc.replace('www.', '').lower()
                    if domain:
                        domain_groups.setdefault(domain, []).append(eid)
                except Exception:
                    pass

        # 建立同 domain 連線
        link_count = 0
        for domain, ids in domain_groups.items():
            if len(ids) < 2:
                continue
            pairs = []
            for i in range(len(ids)):
                for j in range(i + 1, min(len(ids), i + 5)):
                    pairs.append((ids[i], ids[j]))

            for src_id, dst_id in pairs[:20]:
                if (src_id, dst_id) in existing_relations:
                    continue
                success = kuzu_manager.add_relation(
                    source_id=src_id,
                    target_id=dst_id,
                    relation_type="same_domain",
                    properties={'domain': domain, 'auto': True},
                )
                if success:
                    link_count += 1
                    existing_relations.add((src_id, dst_id))
                    existing_relations.add((dst_id, src_id))

        logger.info(f"🌐 Domain 歸類連線: {link_count} 條")

        # ── 第 2 層：關鍵字共現分析 ──
        entity_keywords: dict[str, set] = {}
        for eid, info in entity_map.items():
            kws = extract_keywords(info['name']) | extract_keywords(info['description'])
            if kws:
                entity_keywords[eid] = kws

        keyword_link_count = 0
        eids = list(entity_keywords.keys())
        for i in range(len(eids)):
            for j in range(i + 1, len(eids)):
                if keyword_link_count >= 100:
                    break
                eid_a, eid_b = eids[i], eids[j]
                if (eid_a, eid_b) in existing_relations:
                    continue

                common = entity_keywords[eid_a] & entity_keywords[eid_b]
                if len(common) >= 2:
                    success = kuzu_manager.add_relation(
                        source_id=eid_a,
                        target_id=eid_b,
                        relation_type="keyword_overlap",
                        properties={
                            'keywords': list(common)[:5],
                            'score': len(common),
                            'auto': True,
                        },
                    )
                    if success:
                        keyword_link_count += 1
                        existing_relations.add((eid_a, eid_b))
                        existing_relations.add((eid_b, eid_a))

        logger.info(f"🔑 關鍵字共現連線: {keyword_link_count} 條")
        total = link_count + keyword_link_count
        logger.info(f"✅ 節點互連完成: 共 {total} 條新連線 (domain={link_count}, keyword={keyword_link_count})")

        # 更新圖譜統計
        try:
            kuzu_manager.update_graph_stats(graph_id)
        except Exception:
            pass

        return total

    except Exception as e:
        logger.error(f"❌ 節點互連失敗: {e}", exc_info=True)
        return 0
