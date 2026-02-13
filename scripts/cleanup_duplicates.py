"""
清理 KuzuDB 中的重複節點
每組 (name + graph_id) 相同的節點只保留最後一個
直接操作 KuzuDB（不透過 API），避免後端負荷問題
"""
import sys
import os
from pathlib import Path
from collections import defaultdict

# 加入專案根目錄以載入 kuzu
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

try:
    import kuzu
except ImportError:
    print("ERROR: kuzu not installed. Run: pip install kuzu")
    sys.exit(1)


def main():
    # 找到 KuzuDB 資料庫路徑（優先使用 ASCII 相容路徑，與 kuzu_manager.py 一致）
    db_paths = [
        Path("C:/BruV_Data/kuzu_db"),
        project_root / "data" / "kuzu_db",
        Path(os.path.expanduser("~")) / "BruV_Data" / "kuzu_db",
    ]
    db_path = None
    for p in db_paths:
        if p.exists():
            db_path = p
            break

    if not db_path:
        print(f"ERROR: KuzuDB not found. Checked: {db_paths}")
        sys.exit(1)

    print(f"Database: {db_path}")

    db = kuzu.Database(str(db_path))
    conn = kuzu.Connection(db)

    # 1. 取得所有 Entity
    result = conn.execute("MATCH (n:Entity) RETURN n.id AS id, n.name AS name, n.graph_id AS gid")
    entities = []
    while result.has_next():
        row = result.get_next()
        entities.append({"id": row[0], "name": row[1], "gid": row[2]})

    print(f"Total entities: {len(entities)}")

    # 2. 找出重複（按 name + graph_id 分群）
    groups = defaultdict(list)
    for e in entities:
        groups[(e["name"], e["gid"])].append(e["id"])

    to_delete = []
    for key, ids in groups.items():
        if len(ids) > 1:
            to_delete.extend(ids[:-1])  # 保留最後一個

    print(f"Duplicate nodes to delete: {len(to_delete)}")
    print(f"Nodes to keep: {len(entities) - len(to_delete)}")

    if not to_delete:
        print("No duplicates found. Done.")
        return

    # 3. 批次刪除（使用 DETACH DELETE 同時刪除節點和所有關聯關係）
    deleted = 0
    failed = 0
    for eid in to_delete:
        try:
            conn.execute(
                "MATCH (e:Entity {id: $id}) DETACH DELETE e",
                parameters={"id": eid}
            )
            deleted += 1
        except Exception as ex:
            failed += 1
            if failed <= 5:
                print(f"  Error deleting {eid}: {ex}")

        if deleted > 0 and deleted % 50 == 0:
            print(f"  Progress: {deleted}/{len(to_delete)}...")

    print()
    print(f"=== KuzuDB Cleanup Result ===")
    print(f"Deleted: {deleted}")
    print(f"Failed: {failed}")

    # 4. 驗證
    result = conn.execute("MATCH (n:Entity) RETURN count(n) AS cnt")
    row = result.get_next()
    print(f"Remaining entities: {row[0]}")

    # 5. 檢查是否還有重複
    result = conn.execute(
        "MATCH (n:Entity) "
        "WITH n.name AS name, n.graph_id AS gid, count(*) AS cnt "
        "WHERE cnt > 1 "
        "RETURN name, gid, cnt ORDER BY cnt DESC LIMIT 10"
    )
    dupes = []
    while result.has_next():
        dupes.append(result.get_next())

    if dupes:
        print(f"\nWarning: {len(dupes)} duplicate groups still remain:")
        for d in dupes:
            print(f"  [{d[2]}x] {d[0]} (graph={d[1]})")
    else:
        print("\n✅ No duplicates remain!")


if __name__ == "__main__":
    main()
