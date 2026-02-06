"""
測試腎臟圖譜在2D和3D的完整展示邏輯
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_graph_data_api():
    """測試圖譜數據 API 是否支持 graph_id 參數"""
    print("=" * 60)
    print("測試 1: 檢查圖譜數據 API")
    print("=" * 60)
    
    # 測試主腦圖譜
    print("\n📊 請求主腦圖譜 (graph_id=1)...")
    response = requests.get(f"{BASE_URL}/api/graph/data?graph_id=1")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ 主腦圖譜數據:")
        print(f"   - 成功: {data.get('success')}")
        print(f"   - 節點數: {data.get('data', {}).get('metadata', {}).get('total_nodes')}")
        print(f"   - 連接數: {data.get('data', {}).get('metadata', {}).get('total_links')}")
        print(f"   - 圖譜 ID: {data.get('data', {}).get('metadata', {}).get('graph_id')}")
    else:
        print(f"❌ 請求失敗: {response.status_code}")
        print(response.text)
    
    # 測試用戶圖譜（假設有一個叫 graph_test 的圖譜）
    print("\n📊 請求用戶圖譜 (graph_id=graph_test)...")
    response = requests.get(f"{BASE_URL}/api/graph/data?graph_id=graph_test")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ 用戶圖譜數據:")
        print(f"   - 成功: {data.get('success')}")
        print(f"   - 節點數: {data.get('data', {}).get('metadata', {}).get('total_nodes')}")
        print(f"   - 連接數: {data.get('data', {}).get('metadata', {}).get('total_links')}")
        print(f"   - 圖譜 ID: {data.get('data', {}).get('metadata', {}).get('graph_id')}")
    else:
        print(f"❌ 請求失敗: {response.status_code}")


def test_create_test_nodes():
    """創建測試節點（直接插入到 KuzuDB）"""
    print("\n" + "=" * 60)
    print("測試 2: 創建測試節點")
    print("=" * 60)
    
    # 創建主腦圖譜節點
    print("\n📝 創建主腦圖譜測試節點...")
    main_node = {
        "id": "test_main_node_1",
        "name": "主腦測試節點",
        "type": "Concept",
        "properties": {"test": True}
    }
    
    response = requests.post(f"{BASE_URL}/api/graph/create", json=main_node)
    if response.status_code == 200:
        print(f"✅ 主腦節點創建成功")
    else:
        print(f"❌ 創建失敗: {response.status_code}")
        print(response.text)
    
    # 注意: 創建用戶圖譜節點需要修改 API 支持 graph_id
    print("\n⚠️  用戶圖譜節點需要通過 ImportPage 上傳文件創建")


def test_health():
    """檢查服務健康狀態"""
    print("\n" + "=" * 60)
    print("測試 0: 服務健康檢查")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 服務狀態: {data.get('status')}")
            print(f"   - KuzuDB: {data.get('services', {}).get('kuzu')}")
            print(f"   - FastAPI: {data.get('services', {}).get('fastapi')}")
        else:
            print(f"❌ 健康檢查失敗: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ 無法連接到後端服務！")
        print("   請確保後端已啟動: python app_anytype.py")
        return False
    
    return True


def main():
    """主測試流程"""
    print("\n🧪 開始測試腎臟圖譜展示邏輯\n")
    
    # 檢查服務
    if not test_health():
        return
    
    # 測試圖譜數據 API
    test_graph_data_api()
    
    # 測試創建節點
    test_create_test_nodes()
    
    print("\n" + "=" * 60)
    print("✅ 後端 API 測試完成")
    print("=" * 60)
    print("\n📋 下一步:")
    print("   1. 訪問前端: http://localhost:5173/import")
    print("   2. 創建「腎臟圖譜」並上傳文件")
    print("   3. 在 GraphPage 切換圖譜並查看 2D/3D 顯示")
    print("\n📖 詳細測試步驟請參考:")
    print("   docs/KIDNEY_GRAPH_TEST_GUIDE.md")
    print()


if __name__ == "__main__":
    main()
