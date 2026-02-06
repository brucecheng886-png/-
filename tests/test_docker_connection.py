"""
測試 Docker 容器連接
檢查 Dify 和 RAGFlow 服務是否正常運行
"""
import requests
import sys

def test_dify():
    """測試 Dify 連接"""
    print("=" * 60)
    print("🤖 測試 Dify 服務連接")
    print("=" * 60)
    
    urls_to_try = [
        "http://localhost:5001/v1",
        "http://localhost:5001",
        "http://127.0.0.1:5001/v1",
    ]
    
    for url in urls_to_try:
        try:
            print(f"\n嘗試連接: {url}")
            response = requests.get(f"{url}/health", timeout=3)
            print(f"✅ 連接成功！")
            print(f"   狀態碼: {response.status_code}")
            print(f"   回應: {response.text[:200]}")
            return url
        except requests.exceptions.ConnectionError:
            print(f"❌ 連接失敗 (ConnectionError)")
        except requests.exceptions.Timeout:
            print(f"⏱️  超時")
        except Exception as e:
            print(f"❌ 錯誤: {e}")
    
    print("\n⚠️  所有 Dify URL 都無法連接")
    return None


def test_ragflow():
    """測試 RAGFlow 連接"""
    print("\n" + "=" * 60)
    print("📚 測試 RAGFlow 服務連接")
    print("=" * 60)
    
    urls_to_try = [
        "http://localhost:9380/api/v1",
        "http://localhost:9380",
        "http://127.0.0.1:9380/api/v1",
    ]
    
    for url in urls_to_try:
        try:
            print(f"\n嘗試連接: {url}")
            # RAGFlow 通常沒有 /health，嘗試根路徑
            response = requests.get(url, timeout=3)
            print(f"✅ 連接成功！")
            print(f"   狀態碼: {response.status_code}")
            print(f"   回應: {response.text[:200]}")
            return url
        except requests.exceptions.ConnectionError:
            print(f"❌ 連接失敗 (ConnectionError)")
        except requests.exceptions.Timeout:
            print(f"⏱️  超時")
        except Exception as e:
            print(f"❌ 錯誤: {e}")
    
    print("\n⚠️  所有 RAGFlow URL 都無法連接")
    return None


def main():
    print("\n🔍 Docker 容器連接檢查")
    print("基於 Docker 截圖的端口配置")
    print()
    
    dify_url = test_dify()
    ragflow_url = test_ragflow()
    
    print("\n" + "=" * 60)
    print("📋 建議配置")
    print("=" * 60)
    
    if dify_url:
        print(f"\n✅ Dify API URL: {dify_url}")
    else:
        print("\n❌ Dify 服務無法連接")
        print("   請確認 Docker 容器 bruv_dify_api 是否正常運行")
        print("   執行: docker ps | grep dify")
    
    if ragflow_url:
        print(f"\n✅ RAGFlow API URL: {ragflow_url}")
    else:
        print("\n❌ RAGFlow 服務無法連接")
        print("   請確認 Docker 容器 bruv_ragflow 是否正常運行")
        print("   執行: docker ps | grep ragflow")
    
    print("\n" + "=" * 60)
    print("💡 下一步操作")
    print("=" * 60)
    print("1. 打開瀏覽器訪問: http://localhost:8000")
    print("2. 進入 Settings 頁面")
    print("3. 設定以下 URL：")
    if dify_url:
        print(f"   - Dify API URL: {dify_url}")
    if ragflow_url:
        print(f"   - RAGFlow API URL: {ragflow_url}")
    print("4. 點擊「測試連接」按鈕驗證")
    print("5. 點擊「儲存設定」保存")
    print()


if __name__ == "__main__":
    main()
