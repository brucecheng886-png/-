"""
媒体库测试脚本
测试图片上传、列表、检索、删除功能
"""
import requests
from pathlib import Path
import io
from PIL import Image

BASE_URL = "http://localhost:8000/api/media"

def create_test_image():
    """创建测试图片"""
    img = Image.new('RGB', (800, 600), color='blue')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def test_upload():
    """测试上传图片"""
    print("\n📤 测试上传图片...")
    
    # 创建测试图片
    img_bytes = create_test_image()
    
    files = {
        'file': ('test_image.png', img_bytes, 'image/png')
    }
    
    data = {
        'tags': 'test,demo,automation',
        'description': '这是一张自动生成的测试图片',
        'category': 'test'
    }
    
    response = requests.post(f"{BASE_URL}/upload", files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ 上传成功！")
        print(f"   文件ID: {result['data']['file_id']}")
        print(f"   存储类型: {result['data']['storage_type']}")
        print(f"   URL: {result['data']['storage_url']}")
        return result['data']['file_id']
    else:
        print(f"❌ 上传失败: {response.text}")
        return None

def test_list():
    """测试列出图片"""
    print("\n📋 测试列出图片...")
    
    response = requests.get(f"{BASE_URL}/list?limit=10")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ 查询成功！")
        print(f"   总数: {result['total']}")
        print(f"   返回: {len(result['data'])} 张")
        
        for idx, img in enumerate(result['data'][:3], 1):
            print(f"   {idx}. {img['filename']} - {img['size']} bytes")
    else:
        print(f"❌ 查询失败: {response.text}")

def test_stats():
    """测试统计信息"""
    print("\n📊 测试统计信息...")
    
    response = requests.get(f"{BASE_URL}/stats")
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ 统计成功！")
        print(f"   存储类型: {result['storage_type']}")
        print(f"   总图片数: {result['total_images']}")
        print(f"   总大小: {result['total_size_mb']} MB")
        print(f"   分类: {result['categories']}")
    else:
        print(f"❌ 统计失败: {response.text}")

def test_delete(file_id):
    """测试删除图片"""
    if not file_id:
        print("\n⏭️  跳过删除测试（无有效文件ID）")
        return
    
    print(f"\n🗑️  测试删除图片 {file_id}...")
    
    response = requests.delete(f"{BASE_URL}/{file_id}?category=test")
    
    if response.status_code == 200:
        print(f"✅ 删除成功！")
    else:
        print(f"❌ 删除失败: {response.text}")

if __name__ == "__main__":
    print("=" * 60)
    print("🎨 BruV 媒体库测试")
    print("=" * 60)
    
    # 检查后端是否运行
    try:
        requests.get("http://localhost:8000/docs", timeout=2)
        print("✅ 后端服务正在运行")
    except:
        print("❌ 后端服务未启动！")
        print("💡 请先运行: python app_anytype.py")
        exit(1)
    
    # 执行测试
    file_id = test_upload()
    test_list()
    test_stats()
    # test_delete(file_id)  # 取消注释以测试删除
    
    print("\n" + "=" * 60)
    print("✅ 测试完成！")
    print("🌐 访问 http://localhost:8000/docs 查看完整 API")
    print("=" * 60)
