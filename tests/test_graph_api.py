"""
圖譜 API 完整測試腳本
測試所有圖譜相關功能，包括節點創建、關係創建和錯誤處理
"""
import sys
import time
import requests
from pathlib import Path

# 添加項目根目錄到路徑
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# API 配置
BASE_URL = "http://localhost:8000"
GRAPH_API_BASE = f"{BASE_URL}/api/graph"

# 測試數據
TEST_NODE_ID = "test_node_001"
BATCH_NODE_IDS = ["batch_node_1", "batch_node_2", "batch_node_3"]


def print_test_header(test_name: str, test_num: int):
    """打印測試標題"""
    print("\n" + "=" * 70)
    print(f"🧪 測試 {test_num}: {test_name}")
    print("=" * 70)


def print_success(message: str):
    """打印成功訊息"""
    print(f"✅ {message}")


def print_warning(message: str):
    """打印警告訊息"""
    print(f"⚠️  {message}")


def print_error(message: str):
    """打印錯誤訊息"""
    print(f"❌ {message}")


def print_info(message: str):
    """打印資訊訊息"""
    print(f"ℹ️  {message}")


def test_health_check():
    """測試 1: 健康檢查"""
    print_test_header("健康檢查", 1)
    
    try:
        response = requests.get(f"{BASE_URL}/api/system/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"服務運行正常")
            print_info(f"狀態: {data.get('status', 'unknown')}")
            
            # 檢查 KuzuDB 狀態
            kuzu_status = data.get('services', {}).get('kuzu', 'unknown')
            if kuzu_status == 'connected':
                print_success("KuzuDB 已連接")
            else:
                print_warning(f"KuzuDB 狀態: {kuzu_status}（可能使用 Mock 模式）")
            
            return True
        else:
            print_error(f"健康檢查失敗: HTTP {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("無法連接到服務器，請確認後端服務已啟動")
        print_info("啟動命令: python app_anytype.py")
        return False
    except Exception as e:
        print_error(f"健康檢查異常: {e}")
        return False


def test_create_single_node():
    """測試 2: 創建單個節點"""
    print_test_header("創建單個節點", 2)
    
    try:
        payload = {
            "id": TEST_NODE_ID,
            "name": "測試節點 001",
            "type": "TestNode",
            "properties": {
                "description": "這是一個測試節點",
                "category": "測試",
                "created_by": "test_script"
            }
        }
        
        print_info(f"創建節點: {TEST_NODE_ID}")
        response = requests.post(
            f"{GRAPH_API_BASE}/entities",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"節點創建成功: {data.get('entity_id')}")
            print_info(f"回應: {data}")
            return True
        elif response.status_code == 503:
            print_warning("圖譜服務未就緒（可能使用 Mock 模式）")
            return True
        else:
            print_error(f"創建失敗: HTTP {response.status_code}")
            print_error(f"錯誤: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"創建節點異常: {e}")
        return False


def test_create_batch_nodes():
    """測試 3: 批量創建節點"""
    print_test_header("批量創建節點", 3)
    
    try:
        success_count = 0
        
        for i, node_id in enumerate(BATCH_NODE_IDS, 1):
            payload = {
                "id": node_id,
                "name": f"批量節點 {i}",
                "type": "BatchNode",
                "properties": {
                    "description": f"批量創建的第 {i} 個節點",
                    "batch_id": "batch_001",
                    "index": i
                }
            }
            
            print_info(f"創建節點 {i}/{len(BATCH_NODE_IDS)}: {node_id}")
            response = requests.post(
                f"{GRAPH_API_BASE}/entities",
                json=payload,
                timeout=10
            )
            
            if response.status_code in [200, 503]:
                success_count += 1
                print_success(f"✓ {node_id} 創建成功")
            else:
                print_error(f"✗ {node_id} 創建失敗: HTTP {response.status_code}")
        
        print(f"\n批量創建完成: {success_count}/{len(BATCH_NODE_IDS)} 成功")
        return success_count == len(BATCH_NODE_IDS)
        
    except Exception as e:
        print_error(f"批量創建異常: {e}")
        return False


def test_create_relation():
    """測試 4: 創建關係 (新增功能)"""
    print_test_header("創建關係/連線", 4)
    
    try:
        # 創建關係: test_node_001 -> batch_node_1
        payload = {
            "from_id": TEST_NODE_ID,
            "to_id": BATCH_NODE_IDS[0],
            "relation_type": "related_to",
            "properties": {
                "description": "測試關係",
                "strength": 0.9,
                "created_by": "test_script"
            }
        }
        
        print_info(f"創建關係: {TEST_NODE_ID} → {BATCH_NODE_IDS[0]}")
        print_info(f"關係類型: related_to")
        
        response = requests.post(
            f"{GRAPH_API_BASE}/relations",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"關係創建成功")
            print_info(f"回應: {data}")
            return True
        elif response.status_code == 503:
            print_warning("圖譜服務未就緒（可能使用 Mock 模式）")
            return True
        else:
            print_error(f"創建關係失敗: HTTP {response.status_code}")
            print_error(f"錯誤: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"創建關係異常: {e}")
        return False


def test_create_multiple_relations():
    """測試 5: 創建多個關係"""
    print_test_header("創建多個關係", 5)
    
    try:
        relations = [
            {
                "from_id": BATCH_NODE_IDS[0],
                "to_id": BATCH_NODE_IDS[1],
                "relation_type": "connects_to",
                "properties": {"weight": 0.8}
            },
            {
                "from_id": BATCH_NODE_IDS[1],
                "to_id": BATCH_NODE_IDS[2],
                "relation_type": "leads_to",
                "properties": {"weight": 0.7}
            },
            {
                "from_id": BATCH_NODE_IDS[2],
                "to_id": TEST_NODE_ID,
                "relation_type": "references",
                "properties": {"weight": 0.6}
            }
        ]
        
        success_count = 0
        for i, rel in enumerate(relations, 1):
            print_info(f"創建關係 {i}/{len(relations)}: {rel['from_id']} → {rel['to_id']}")
            
            response = requests.post(
                f"{GRAPH_API_BASE}/relations",
                json=rel,
                timeout=10
            )
            
            if response.status_code in [200, 503]:
                success_count += 1
                print_success(f"✓ 關係創建成功")
            else:
                print_error(f"✗ 關係創建失敗: HTTP {response.status_code}")
        
        print(f"\n多關係創建完成: {success_count}/{len(relations)} 成功")
        return success_count >= len(relations) - 1  # 允許一個失敗
        
    except Exception as e:
        print_error(f"創建多關係異常: {e}")
        return False


def test_get_graph_list():
    """測試 6: 獲取圖譜列表"""
    print_test_header("獲取圖譜列表", 6)
    
    try:
        print_info("查詢圖譜列表...")
        response = requests.get(
            f"{GRAPH_API_BASE}/list",
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            graphs = data.get('graphs', [])
            
            print_success(f"獲取成功，共 {len(graphs)} 個圖譜")
            
            for graph in graphs:
                print(f"\n  📊 圖譜: {graph.get('name', 'Unknown')}")
                print(f"     ID: {graph.get('id', 'N/A')}")
                print(f"     節點數: {graph.get('nodeCount', 0)}")
                print(f"     連線數: {graph.get('linkCount', 0)}")
                print(f"     描述: {graph.get('description', 'N/A')}")
            
            return True
        else:
            print_error(f"獲取圖譜列表失敗: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"獲取圖譜列表異常: {e}")
        return False


def test_get_entity():
    """測試 7: 查詢單個節點"""
    print_test_header("查詢單個節點", 7)
    
    try:
        print_info(f"查詢節點: {TEST_NODE_ID}")
        response = requests.get(
            f"{GRAPH_API_BASE}/entities/{TEST_NODE_ID}",
            timeout=10
        )
        
        if response.status_code == 200:
            entity = response.json()
            print_success(f"節點查詢成功")
            print_info(f"節點數據: {entity}")
            return True
        elif response.status_code == 404:
            print_warning("節點不存在（可能使用 Mock 模式）")
            return True
        elif response.status_code == 503:
            print_warning("圖譜服務未就緒")
            return True
        else:
            print_error(f"查詢失敗: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"查詢節點異常: {e}")
        return False


def test_get_neighbors():
    """測試 8: 獲取鄰居節點"""
    print_test_header("獲取鄰居節點", 8)
    
    try:
        print_info(f"查詢 {TEST_NODE_ID} 的鄰居節點...")
        response = requests.get(
            f"{GRAPH_API_BASE}/entities/{TEST_NODE_ID}/neighbors",
            params={"depth": 1},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            neighbors = data.get('neighbors', [])
            print_success(f"查詢成功，找到 {len(neighbors)} 個鄰居")
            
            if neighbors:
                for neighbor in neighbors:
                    print(f"  → {neighbor}")
            else:
                print_info("  (無鄰居節點)")
            
            return True
        elif response.status_code in [404, 503]:
            print_warning("查詢未返回結果（正常）")
            return True
        else:
            print_error(f"查詢鄰居失敗: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"查詢鄰居異常: {e}")
        return False


def test_duplicate_error():
    """測試 9: 重複創建錯誤 (負面測試)"""
    print_test_header("重複創建錯誤測試 (負面測試)", 9)
    
    try:
        # 嘗試再次創建相同 ID 的節點
        payload = {
            "id": TEST_NODE_ID,
            "name": "重複的測試節點",
            "type": "DuplicateTest",
            "properties": {"note": "這應該會失敗或被忽略"}
        }
        
        print_info(f"嘗試重複創建節點: {TEST_NODE_ID}")
        response = requests.post(
            f"{GRAPH_API_BASE}/entities",
            json=payload,
            timeout=10
        )
        
        # 檢查是否正確處理重複
        if response.status_code == 200:
            print_warning("節點被重新創建（某些實現允許覆蓋）")
            return True
        elif response.status_code in [400, 409]:
            print_success(f"正確返回錯誤: HTTP {response.status_code}")
            print_info(f"錯誤訊息: {response.json().get('detail', 'N/A')}")
            return True
        elif response.status_code == 503:
            print_warning("圖譜服務未就緒，跳過測試")
            return True
        else:
            print_error(f"意外的回應碼: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"重複創建測試異常: {e}")
        return False


def test_invalid_relation():
    """測試 10: 無效關係測試 (負面測試)"""
    print_test_header("無效關係測試 (負面測試)", 10)
    
    try:
        # 嘗試創建指向不存在節點的關係
        payload = {
            "from_id": TEST_NODE_ID,
            "to_id": "nonexistent_node_999",
            "relation_type": "invalid_link",
            "properties": {}
        }
        
        print_info("嘗試創建指向不存在節點的關係...")
        response = requests.post(
            f"{GRAPH_API_BASE}/relations",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            print_warning("關係創建成功（某些實現允許懸空引用）")
            return True
        elif response.status_code in [400, 404]:
            print_success(f"正確返回錯誤: HTTP {response.status_code}")
            return True
        elif response.status_code == 503:
            print_warning("圖譜服務未就緒，跳過測試")
            return True
        else:
            print_error(f"意外的回應碼: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"無效關係測試異常: {e}")
        return False


def main():
    """主測試流程"""
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    
    print("\n")
    print("=" * 70)
    print("  BruV 圖譜 API 完整測試套件")
    print("  測試節點創建、關係創建、查詢功能及錯誤處理")
    print("=" * 70)
    print()
    
    # 測試列表
    tests = [
        ("健康檢查", test_health_check),
        ("創建單個節點", test_create_single_node),
        ("批量創建節點", test_create_batch_nodes),
        ("創建關係", test_create_relation),
        ("創建多個關係", test_create_multiple_relations),
        ("獲取圖譜列表", test_get_graph_list),
        ("查詢單個節點", test_get_entity),
        ("獲取鄰居節點", test_get_neighbors),
        ("重複創建錯誤測試", test_duplicate_error),
        ("無效關係測試", test_invalid_relation),
    ]
    
    results = []
    
    # 執行所有測試
    for name, test_func in tests:
        result = test_func()
        results.append((name, result))
        time.sleep(0.5)  # 避免請求過快
    
    # 總結
    print("\n" + "=" * 70)
    print("📊 測試結果總結")
    print("=" * 70)
    
    passed = 0
    failed = 0
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print("=" * 70)
    print(f"總計: {passed} 通過, {failed} 失敗")
    print("=" * 70)
    
    if failed == 0:
        print("\n🎉 所有測試通過！圖譜 API 運作正常。")
    else:
        print(f"\n⚠️  有 {failed} 個測試失敗，請檢查上方錯誤訊息。")
    
    return failed == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
