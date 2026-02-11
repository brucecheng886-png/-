#!/usr/bin/env python3
"""
RAGFlow MySQL Schema 自動修復腳本
===================================
修復已知問題：RAGFlow v0.16.0 的 document / task 表中
`process_duation` 欄位（拼字錯誤）缺失，導致上傳失敗。

錯誤訊息:
  Unknown column 't1.process_duation' in 'field list'

使用方式:
  python scripts/fix_ragflow_db.py          # 自動偵測 .env 密碼
  python scripts/fix_ragflow_db.py --check  # 僅檢查，不修改
  python scripts/fix_ragflow_db.py --password <pwd>  # 手動指定密碼

原理:
  透過 docker exec 連進 bruv_ragflow_mysql 容器，
  檢查 rag_flow 資料庫的表結構，自動 ALTER TABLE 補上缺失欄位。
"""

import subprocess
import sys
import os
import re
import argparse
from pathlib import Path

# ─── 常量 ─────────────────────────────────────────────────
CONTAINER_NAME = "bruv_ragflow_mysql"
DATABASE = "rag_flow"

# RAGFlow v0.16.0 已知需修復的欄位
# 格式: (table, column, mysql_type, default, description)
SCHEMA_FIXES = [
    {
        "table": "document",
        "column": "process_duation",
        "type": "FLOAT",
        "default": "DEFAULT 0",
        "description": "文檔處理時長 (RAGFlow v0.16.0 typo: duation→duration)",
    },
    {
        "table": "document",
        "column": "meta_fields",
        "type": "LONGTEXT",
        "default": "DEFAULT NULL",
        "description": "文檔元資料 (JSON)",
    },
    {
        "table": "task",
        "column": "process_duation",
        "type": "FLOAT",
        "default": "DEFAULT 0",
        "description": "任務處理時長 (RAGFlow v0.16.0 typo: duation→duration)",
    },
    {
        "table": "task",
        "column": "retry_count",
        "type": "INT",
        "default": "DEFAULT 0",
        "description": "任務重試計數",
    },
    {
        "table": "task",
        "column": "digest",
        "type": "TEXT",
        "default": "DEFAULT NULL",
        "description": "任務摘要",
    },
    {
        "table": "task",
        "column": "chunk_ids",
        "type": "LONGTEXT",
        "default": "DEFAULT NULL",
        "description": "分塊 ID 列表",
    },
]


# ─── 工具函式 ──────────────────────────────────────────────

def _log(icon: str, msg: str):
    print(f"  {icon} {msg}")


def find_env_file() -> Path | None:
    """往上搜尋 .env 檔案"""
    candidates = [
        Path(__file__).resolve().parent.parent / ".env",           # BruV_Project/.env
        Path(__file__).resolve().parent.parent.parent / ".env",    # 上一層
    ]
    for p in candidates:
        if p.exists():
            return p
    return None


def read_mysql_password(env_path: Path | None = None) -> str | None:
    """從 .env 讀取 RAGFLOW_MYSQL_PASSWORD"""
    if env_path is None:
        env_path = find_env_file()
    if env_path is None or not env_path.exists():
        return None

    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            if key.strip() == "RAGFLOW_MYSQL_PASSWORD":
                return value.strip().strip('"').strip("'")
    return None


def check_container_running() -> bool:
    """檢查 MySQL 容器是否執行中"""
    try:
        result = subprocess.run(
            ["docker", "inspect", "-f", "{{.State.Running}}", CONTAINER_NAME],
            capture_output=True, text=True, timeout=10,
        )
        return result.returncode == 0 and "true" in result.stdout.lower()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def run_mysql(password: str, sql: str) -> tuple[int, str, str]:
    """
    透過 docker exec 執行 MySQL 命令。
    回傳 (returncode, stdout, stderr)。
    """
    cmd = [
        "docker", "exec", "-i",
        "-e", f"MYSQL_PWD={password}",
        CONTAINER_NAME,
        "mysql", "-uroot", "-N", "-B", DATABASE,
        "-e", sql,
    ]
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=30,
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return -1, "", "MySQL command timed out"
    except FileNotFoundError:
        return -1, "", "docker command not found"


def get_table_columns(password: str, table: str) -> set[str]:
    """取得指定表的所有欄位名稱"""
    sql = f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='{DATABASE}' AND TABLE_NAME='{table}';"
    rc, stdout, stderr = run_mysql(password, sql)
    if rc != 0:
        _log("❌", f"無法查詢 {table} 表結構: {stderr}")
        return set()
    return {line.strip() for line in stdout.splitlines() if line.strip()}


def check_table_exists(password: str, table: str) -> bool:
    """檢查表是否存在"""
    sql = f"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='{DATABASE}' AND TABLE_NAME='{table}';"
    rc, stdout, stderr = run_mysql(password, sql)
    if rc != 0:
        return False
    return stdout.strip() == "1"


# ─── 核心修復邏輯 ──────────────────────────────────────────

def apply_fix(password: str, fix: dict, dry_run: bool = False) -> str:
    """
    檢查並修復單一欄位。
    回傳狀態: 'ok' | 'fixed' | 'skipped' | 'error'
    """
    table = fix["table"]
    column = fix["column"]
    col_type = fix["type"]
    default = fix["default"]
    desc = fix["description"]

    # 1. 檢查表是否存在
    if not check_table_exists(password, table):
        _log("⏭️", f"[{table}] 表不存在，跳過 — {desc}")
        return "skipped"

    # 2. 取得現有欄位
    columns = get_table_columns(password, table)
    if not columns:
        _log("⚠️", f"[{table}] 無法取得欄位清單")
        return "error"

    # 3. 欄位已存在
    if column in columns:
        _log("✅", f"[{table}.{column}] 已存在 — {desc}")
        return "ok"

    # 4. 需要修復
    if dry_run:
        _log("🔍", f"[{table}.{column}] 缺失，需要新增 — {desc}")
        return "fixed"

    # 5. 執行 ALTER TABLE
    alter_sql = f"ALTER TABLE `{table}` ADD COLUMN `{column}` {col_type} {default};"
    _log("🔧", f"[{table}.{column}] 新增中... → ALTER TABLE `{table}` ADD COLUMN `{column}` {col_type} {default}")
    rc, stdout, stderr = run_mysql(password, alter_sql)

    if rc != 0:
        # 欄位可能剛被其他程序新增（race condition）
        if "Duplicate column" in stderr:
            _log("✅", f"[{table}.{column}] 已存在（並行建立）")
            return "ok"
        _log("❌", f"[{table}.{column}] 修復失敗: {stderr}")
        return "error"

    _log("✅", f"[{table}.{column}] 新增成功 — {desc}")
    return "fixed"


def run_all_fixes(password: str, dry_run: bool = False) -> dict:
    """
    執行所有 Schema 修復。
    回傳 {"ok": N, "fixed": N, "skipped": N, "error": N}。
    """
    stats = {"ok": 0, "fixed": 0, "skipped": 0, "error": 0}

    for fix in SCHEMA_FIXES:
        status = apply_fix(password, fix, dry_run=dry_run)
        stats[status] += 1

    return stats


# ─── CLI 入口 ──────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="RAGFlow MySQL Schema 自動修復工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
範例:
  python scripts/fix_ragflow_db.py              # 自動修復
  python scripts/fix_ragflow_db.py --check      # 僅檢查
  python scripts/fix_ragflow_db.py -p mypasswd  # 指定密碼
        """,
    )
    parser.add_argument(
        "--check", action="store_true",
        help="僅檢查，不實際修改資料庫 (dry-run)",
    )
    parser.add_argument(
        "-p", "--password",
        help="MySQL root 密碼 (預設從 .env 的 RAGFLOW_MYSQL_PASSWORD 讀取)",
    )
    parser.add_argument(
        "-q", "--quiet", action="store_true",
        help="安靜模式，僅輸出結果摘要",
    )
    args = parser.parse_args()

    # ─── Banner ───
    if not args.quiet:
        print()
        print("=" * 60)
        print("  RAGFlow MySQL Schema 自動修復工具")
        print("  Target: rag_flow DB @ bruv_ragflow_mysql container")
        print("=" * 60)
        print()

    # ─── Step 1: 檢查 Docker 容器 ───
    if not args.quiet:
        print("📦 Step 1: 檢查 MySQL 容器...")

    if not check_container_running():
        _log("❌", f"容器 '{CONTAINER_NAME}' 未執行。請先啟動 Docker:")
        _log("  ", "  docker-compose up -d ragflow-mysql")
        print()
        sys.exit(1)
    else:
        _log("✅", f"容器 '{CONTAINER_NAME}' 執行中")

    # ─── Step 2: 取得密碼 ───
    if not args.quiet:
        print()
        print("🔑 Step 2: 取得 MySQL 密碼...")

    password = args.password or os.environ.get("RAGFLOW_MYSQL_PASSWORD") or read_mysql_password()
    if not password:
        _log("❌", "找不到 MySQL 密碼。請確認:")
        _log("  ", "  1. .env 中設定 RAGFLOW_MYSQL_PASSWORD=<password>")
        _log("  ", "  2. 或使用 --password <password> 參數")
        _log("  ", "  3. 或設定環境變數 RAGFLOW_MYSQL_PASSWORD")
        print()
        sys.exit(1)
    else:
        _log("✅", f"密碼已取得 (***{password[-3:]})")

    # ─── Step 3: 測試連線 ───
    if not args.quiet:
        print()
        print("🔌 Step 3: 測試 MySQL 連線...")

    rc, stdout, stderr = run_mysql(password, "SELECT 1;")
    if rc != 0:
        _log("❌", f"MySQL 連線失敗: {stderr}")
        sys.exit(1)
    else:
        _log("✅", "MySQL 連線成功")

    # ─── Step 4: 檢查 / 修復 Schema ───
    mode = "檢查" if args.check else "修復"
    if not args.quiet:
        print()
        print(f"🔍 Step 4: {mode} Schema ({len(SCHEMA_FIXES)} 項)...")
        print()

    stats = run_all_fixes(password, dry_run=args.check)

    # ─── 結果摘要 ───
    print()
    print("-" * 60)
    total = sum(stats.values())
    print(f"  📊 結果摘要: {total} 項檢查完成")
    print(f"     ✅ 已正常: {stats['ok']}")
    if stats["fixed"]:
        label = "需修復" if args.check else "已修復"
        print(f"     🔧 {label}: {stats['fixed']}")
    if stats["skipped"]:
        print(f"     ⏭️  已跳過: {stats['skipped']}")
    if stats["error"]:
        print(f"     ❌ 錯誤: {stats['error']}")
    print("-" * 60)

    if stats["error"] > 0:
        print()
        print("⚠️  部分修復失敗，請手動檢查。")
        sys.exit(2)

    if args.check and stats["fixed"] > 0:
        print()
        print("💡 提示: 執行 `python scripts/fix_ragflow_db.py` 以自動修復。")
        sys.exit(0)

    if stats["fixed"] > 0:
        print()
        print("✅ Schema 修復完成！RAGFlow 文件上傳功能應可正常運作。")

    if not args.quiet:
        print()

    sys.exit(0)


if __name__ == "__main__":
    main()
