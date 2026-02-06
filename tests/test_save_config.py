"""
測試配置儲存功能
"""
import requests
import json

API_BASE_URL = "http://localhost:8000"

def test_save_config():
    """測試儲存配置"""
    print("=" * 60)
    print("🧪 測試配置儲存功能")
    print("=" * 60)
    
    # 測試數據
    test_payload = {
        "dify_api_url": "http://localhost:5001/v1",
        "ragflow_api_url": "http://localhost:9380/api/v1"
    }
    
    print(f"\n📤 發送請求:")
    print(f"   URL: {API_BASE_URL}/api/system/config")
    print(f"   Method: POST")
    print(f"   Payload: {json.dumps(test_payload, indent=2)}")
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/system/config",
            json=test_payload,
            timeout=10
        )
        
        print(f"\n📥 回應:")
        print(f"   狀態碼: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ 儲存成功！")
            print(f"   回應數據: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"\n❌ 儲存失敗！")
            print(f"   錯誤內容: {response.text}")
            
    except requests.exceptions.ConnectionError as e:
        print(f"\n❌ 連接失敗: {e}")
        print("   請確認後端是否正在運行 (http://localhost:8000)")
    except Exception as e:
        print(f"\n❌ 錯誤: {type(e).__name__}: {e}")


if __name__ == "__main__":
    test_save_config()
