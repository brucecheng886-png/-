"""
測試 RAGFlow 連接
"""
import asyncio
import httpx
import json
from pathlib import Path

async def test_ragflow():
    # 讀取配置
    config_path = Path.home() / "BruV_Data" / "config.json"
    
    if config_path.exists():
        with open(config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
            api_url = config.get('ragflow_api_url', 'http://localhost:9380/api/v1')
            api_key = config.get('ragflow_api_key', '')
    else:
        api_url = 'http://localhost:9380/api/v1'
        api_key = ''
    
    print(f"🔍 測試 RAGFlow 連接")
    print(f"API URL: {api_url}")
    print(f"API Key: {api_key[:20]}..." if len(api_key) > 20 else f"API Key: {api_key}")
    print("-" * 60)
    
    async with httpx.AsyncClient(timeout=10) as client:
        # 測試 1: 獲取數據集列表
        try:
            print("\n📋 測試 1: 獲取數據集列表")
            response = await client.get(
                f"{api_url}/datasets",
                headers={"Authorization": f"Bearer {api_key}"}
            )
            print(f"狀態碼: {response.status_code}")
            print(f"響應: {response.text[:500]}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ 成功！數據集數量: {len(data.get('data', []))}")
                if data.get('data'):
                    print("數據集列表:")
                    for ds in data['data']:
                        print(f"  - {ds.get('name')} (ID: {ds.get('id')})")
            else:
                print(f"❌ 失敗！")
        except Exception as e:
            print(f"❌ 錯誤: {e}")
        
        # 測試 2: 檢查基本連接
        try:
            print("\n🔌 測試 2: 基本連接測試")
            # 嘗試訪問根路徑
            response = await client.get(f"http://localhost:81/")
            print(f"RAGFlow 首頁狀態碼: {response.status_code}")
            if response.status_code == 200:
                print("✅ RAGFlow 服務正在運行")
            else:
                print("⚠️ RAGFlow 響應異常")
        except Exception as e:
            print(f"❌ 無法連接到 RAGFlow: {e}")

if __name__ == "__main__":
    asyncio.run(test_ragflow())
