"""
配置遷移腳本
將 .env 文件中的 Dify 和 RAGFlow 配置遷移到 config.json
"""
import os
import json
from pathlib import Path

# 配置路徑
ENV_FILE = Path(".env")
CONFIG_FILE = Path("C:/BruV_Data/config.json")

def read_env_file():
    """讀取 .env 文件"""
    env_vars = {}
    if not ENV_FILE.exists():
        print(f"❌ .env 文件不存在: {ENV_FILE}")
        return env_vars
    
    try:
        with open(ENV_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
        print(f"✅ 成功讀取 .env 文件")
        return env_vars
    except Exception as e:
        print(f"❌ 讀取 .env 文件失敗: {e}")
        return {}


def migrate_config():
    """執行配置遷移"""
    print("=" * 70)
    print("🔄 開始配置遷移：.env → config.json")
    print("=" * 70)
    
    # 讀取 .env
    env_vars = read_env_file()
    if not env_vars:
        print("\n⚠️ .env 文件為空或不存在，無需遷移")
        return
    
    # 提取需要遷移的配置
    config = {}
    
    if 'DIFY_API_KEY' in env_vars:
        config['dify_api_key'] = env_vars['DIFY_API_KEY']
        print(f"✅ 找到 DIFY_API_KEY: {env_vars['DIFY_API_KEY'][:10]}...")
    
    if 'DIFY_API_URL' in env_vars:
        config['dify_api_url'] = env_vars['DIFY_API_URL']
        print(f"✅ 找到 DIFY_API_URL: {env_vars['DIFY_API_URL']}")
    
    if 'RAGFLOW_API_KEY' in env_vars:
        config['ragflow_api_key'] = env_vars['RAGFLOW_API_KEY']
        print(f"✅ 找到 RAGFLOW_API_KEY: {env_vars['RAGFLOW_API_KEY'][:10]}...")
    
    if 'RAGFLOW_API_URL' in env_vars:
        config['ragflow_api_url'] = env_vars['RAGFLOW_API_URL']
        print(f"✅ 找到 RAGFLOW_API_URL: {env_vars['RAGFLOW_API_URL']}")
    
    if not config:
        print("\n⚠️ 未找到需要遷移的配置")
        return
    
    # 檢查現有的 config.json
    if CONFIG_FILE.exists():
        print(f"\n📄 發現現有的 config.json: {CONFIG_FILE}")
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                existing_config = json.load(f)
            print("✅ 讀取現有配置成功")
            # 合併配置（.env 優先）
            existing_config.update(config)
            config = existing_config
        except Exception as e:
            print(f"⚠️ 讀取現有配置失敗: {e}，將覆蓋")
    
    # 保存到 config.json
    try:
        CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        print(f"\n✅ 配置已成功保存到: {CONFIG_FILE}")
        print("\n📋 已遷移的配置:")
        for key, value in config.items():
            if 'key' in key.lower():
                print(f"  - {key}: {value[:10]}...")
            else:
                print(f"  - {key}: {value}")
    except Exception as e:
        print(f"\n❌ 保存配置失敗: {e}")
        return
    
    # 提示
    print("\n" + "=" * 70)
    print("🎉 配置遷移完成！")
    print("=" * 70)
    print("\n💡 接下來的步驟:")
    print("  1. 重啟後端服務以載入新配置")
    print("  2. 在 Settings 頁面驗證配置是否正確")
    print("  3. .env 文件中的 API Keys 可以保留作為備份")
    print("  4. 未來請使用 Settings 頁面管理配置")
    print("\n配置優先級: config.json > 環境變數 > 默認值\n")


if __name__ == "__main__":
    migrate_config()
