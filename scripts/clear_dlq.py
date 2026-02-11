#!/usr/bin/env python3
"""
清空 Saga Dead Letter Queue (DLQ) 的所有紀錄。

用法:
  python scripts/clear_dlq.py              # 清空本機 DLQ
  python scripts/clear_dlq.py --api        # 透過後端 API 清空（需先啟動 backend）
  python scripts/clear_dlq.py --dry-run    # 僅顯示目前紀錄數，不刪除
"""

import argparse
import sqlite3
import sys
from pathlib import Path

DLQ_DB_PATH = Path.home() / "BruV_Data" / "saga_dlq.db"


def clear_via_db(dry_run: bool = False) -> int:
    """直接操作 SQLite 檔案清空 DLQ。"""
    if not DLQ_DB_PATH.exists():
        print(f"DLQ 資料庫不存在: {DLQ_DB_PATH}")
        return 0

    conn = sqlite3.connect(str(DLQ_DB_PATH))
    try:
        cur = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='dead_letter_queue'"
        )
        if not cur.fetchone():
            print("DLQ 資料表不存在，無需清理。")
            return 0

        count = conn.execute("SELECT COUNT(*) FROM dead_letter_queue").fetchone()[0]
        if count == 0:
            print("DLQ 已經是空的。")
            return 0

        if dry_run:
            print(f"[dry-run] DLQ 目前有 {count} 筆紀錄，未執行刪除。")
            rows = conn.execute(
                "SELECT id, file_path, failed_step, created_at FROM dead_letter_queue"
            ).fetchall()
            for r in rows:
                print(f"  - {r[0][:8]}... | step={r[2]} | file={Path(r[1]).name} | {r[3]}")
            return count

        conn.execute("DELETE FROM dead_letter_queue")
        conn.commit()
        print(f"已清空 DLQ: 刪除 {count} 筆紀錄。")
        return count
    finally:
        conn.close()


def clear_via_api() -> int:
    """透過後端 API 逐筆 resolve DLQ 項目。"""
    try:
        import httpx
    except ImportError:
        print("需要 httpx 套件: pip install httpx")
        return -1

    import os, json

    base_url = os.environ.get("BRUV_API_URL", "http://localhost:8000")
    token = os.environ.get("BRUV_API_TOKEN", "")

    # 嘗試從 .env 讀取 token
    if not token:
        env_file = Path(__file__).parent.parent / ".env"
        if env_file.exists():
            for line in env_file.read_text(encoding="utf-8").splitlines():
                if line.startswith("BRUV_API_TOKEN="):
                    token = line.split("=", 1)[1].strip().strip("'\"")
                    break

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 取得所有 DLQ 項目
    r = httpx.get(f"{base_url}/api/system/saga-dlq", headers=headers, timeout=10)
    if r.status_code != 200:
        print(f"API 錯誤: HTTP {r.status_code}")
        return -1

    data = r.json()
    items = data.get("data", [])
    if not items:
        print("DLQ 已經是空的。")
        return 0

    resolved = 0
    for item in items:
        item_id = item.get("id", "")
        resp = httpx.post(
            f"{base_url}/api/system/saga-dlq/{item_id}/resolve",
            headers=headers,
            timeout=10,
        )
        if resp.status_code == 200:
            resolved += 1
            print(f"  ✓ resolved {item_id[:8]}...")
        else:
            print(f"  ✗ failed {item_id[:8]}... (HTTP {resp.status_code})")

    print(f"\n已透過 API resolve {resolved}/{len(items)} 筆 DLQ 紀錄。")
    return resolved


def main():
    parser = argparse.ArgumentParser(description="清空 Saga DLQ 紀錄")
    parser.add_argument("--api", action="store_true", help="透過後端 API 清空")
    parser.add_argument("--dry-run", action="store_true", help="僅顯示紀錄數，不刪除")
    args = parser.parse_args()

    if args.api:
        result = clear_via_api()
    else:
        result = clear_via_db(dry_run=args.dry_run)

    sys.exit(0 if result >= 0 else 1)


if __name__ == "__main__":
    main()
