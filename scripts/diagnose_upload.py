"""
快速診斷上傳失敗原因
"""
import requests

BASE_URL = "http://localhost:8000"

print("🔍 診斷上傳失敗原因\n")
print("=" * 60)

# 1. 檢查後端是否運行
print("\n1️⃣ 檢查後端服務...")
try:
    response = requests.get(f"{BASE_URL}/api/health", timeout=3)
    if response.status_code == 200:
        print("✅ 後端服務正常運行")
        data = response.json()
        print(f"   - KuzuDB: {data.get('services', {}).get('kuzu')}")
    else:
        print(f"❌ 後端異常: {response.status_code}")
except requests.exceptions.ConnectionError:
    print("❌ 無法連接到後端！請確認後端已啟動:")
    print("   cd BruV_Project")
    print("   python app_anytype.py")
    exit(1)
except Exception as e:
    print(f"❌ 連接錯誤: {e}")
    exit(1)

# 2. 測試上傳 API（使用 multipart/form-data）
print("\n2️⃣ 測試上傳 API...")
try:
    # 創建測試文件
    test_content = b"Test file content for debugging"
    files = {'file': ('test_debug.txt', test_content, 'text/plain')}
    
    # 發送上傳請求（帶 graph_id 參數）
    data = {
        'graph_id': '1',
        'graph_mode': 'existing'
    }
    
    response = requests.post(
        f"{BASE_URL}/api/system/upload",
        files=files,
        data=data,
        timeout=10
    )
    
    print(f"   - 狀態碼: {response.status_code}")
    print(f"   - 響應內容: {response.text[:200]}")
    
    if response.status_code == 200:
        result = response.json()
        if result.get('success'):
            print("✅ 上傳 API 正常工作")
        else:
            print(f"❌ 上傳失敗: {result}")
    else:
        print(f"❌ HTTP 錯誤: {response.status_code}")
        print(f"   錯誤詳情: {response.text}")
        
except Exception as e:
    print(f"❌ 上傳測試失敗: {e}")

# 3. 檢查 KuzuDB 狀態
print("\n3️⃣ 檢查圖譜數據 API...")
try:
    response = requests.get(f"{BASE_URL}/api/graph/data?graph_id=1", timeout=5)
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print("✅ 圖譜數據 API 正常")
            metadata = data.get('data', {}).get('metadata', {})
            print(f"   - 節點數: {metadata.get('total_nodes')}")
            print(f"   - 連接數: {metadata.get('total_links')}")
        else:
            print(f"⚠️ 圖譜數據返回失敗: {data.get('data', {}).get('metadata', {}).get('note')}")
    else:
        print(f"❌ API 錯誤: {response.status_code}")
except Exception as e:
    print(f"❌ 圖譜 API 測試失敗: {e}")

print("\n" + "=" * 60)
print("📋 診斷完成")
print("\n💡 如果看到 KuzuDB unavailable，請執行:")
print("   Remove-Item C:\\BruV_Data\\kuzu_db -Recurse -Force")
print("   然後重啟後端")
