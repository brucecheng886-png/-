# 📸 BruV 媒体库使用指南

## 🎯 功能概览

BruV 媒体库是一个**本地化图片管理系统**,为您的知识库提供图片存储和检索服务。

### ✨ 核心功能

- ✅ **图片上传** - 支持 JPG、PNG、GIF、WebP 等格式
- ✅ **自动去重** - 基于 SHA256 哈希避免重复存储
- ✅ **标签分类** - 多维度组织图片资源
- ✅ **MinIO 存储** - 专业 S3 兼容对象存储（优先）
- ✅ **本地备份** - 自动降级到文件系统（备用）
- ✅ **快速检索** - 按分类、标签、时间筛选
- ✅ **统计分析** - 存储空间、分类分布一目了然

---

## 🚀 快速开始

### 方法 1：一键启动脚本（推荐）

```powershell
cd C:\Users\bruce\PycharmProjects\企業級伺服器(Dify+RAGflow)\BruV_Project
.\start_media_library.ps1
```

脚本将自动：
1. 安装 MinIO 客户端
2. 检查 MinIO 服务状态
3. 创建本地存储目录
4. 启动后端服务
5. 运行测试验证

### 方法 2：手动启动

#### 步骤 1：安装依赖
```powershell
.venv\Scripts\pip.exe install minio Pillow
```

#### 步骤 2：启动 MinIO（可选）
```powershell
docker-compose up -d ragflow-minio
```

#### 步骤 3：启动后端
```powershell
python app_anytype.py
```

#### 步骤 4：访问 API 文档
打开浏览器：http://localhost:8000/docs

---

## 📚 API 使用示例

### 1️⃣ 上传图片

**端点**: `POST /api/media/upload`

**Python 示例**:
```python
import requests

url = "http://localhost:8000/api/media/upload"

# 方式 A：上传本地文件
with open("product_logo.png", "rb") as f:
    files = {'file': ('logo.png', f, 'image/png')}
    data = {
        'tags': 'logo,product,branding',
        'description': '公司产品标志',
        'category': 'product'
    }
    response = requests.post(url, files=files, data=data)
    print(response.json())

# 方式 B：上传内存图片（PIL）
from PIL import Image
import io

img = Image.open("screenshot.png")
img_bytes = io.BytesIO()
img.save(img_bytes, format='PNG')
img_bytes.seek(0)

files = {'file': ('screenshot.png', img_bytes, 'image/png')}
data = {'category': 'screenshot', 'tags': 'ui,demo'}
response = requests.post(url, files=files, data=data)
```

**响应示例**:
```json
{
  "success": true,
  "message": "图片上传成功",
  "data": {
    "file_id": "a3d5f7e9b2c4d6e8f0a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5",
    "original_filename": "product_logo.png",
    "content_type": "image/png",
    "file_size": 45678,
    "storage_type": "minio",
    "storage_url": "http://localhost:9000/bruv-media-library/product/20260206/a3d5f7e9b2c4d6e8f0a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5.png",
    "category": "product",
    "tags": ["logo", "product", "branding"],
    "description": "公司产品标志",
    "upload_time": "2026-02-06T10:30:45.123456"
  }
}
```

### 2️⃣ 列出图片

**端点**: `GET /api/media/list`

**参数**:
- `category` (可选) - 按分类筛选
- `tags` (可选) - 按标签筛选（逗号分隔）
- `limit` (默认 50) - 每页数量
- `offset` (默认 0) - 偏移量

**示例**:
```python
import requests

# 列出所有图片
response = requests.get("http://localhost:8000/api/media/list?limit=20")

# 按分类筛选
response = requests.get("http://localhost:8000/api/media/list?category=product")

# 分页
response = requests.get("http://localhost:8000/api/media/list?limit=10&offset=20")

print(response.json())
```

### 3️⃣ 获取统计信息

**端点**: `GET /api/media/stats`

**示例**:
```python
import requests

response = requests.get("http://localhost:8000/api/media/stats")
stats = response.json()

print(f"总图片数: {stats['total_images']}")
print(f"总大小: {stats['total_size_mb']} MB")
print(f"存储类型: {stats['storage_type']}")
print(f"分类分布: {stats['categories']}")
```

### 4️⃣ 删除图片

**端点**: `DELETE /api/media/{file_id}`

**示例**:
```python
import requests

file_id = "a3d5f7e9b2c4d6e8f0a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5"
response = requests.delete(f"http://localhost:8000/api/media/{file_id}?category=product")

if response.status_code == 200:
    print("✅ 删除成功")
```

---

## 🗂️ 存储架构

### 存储优先级

```
1️⃣ MinIO 对象存储 (优先)
   ├─ 端点: localhost:9000
   ├─ 控制台: localhost:9001
   └─ Bucket: bruv-media-library

2️⃣ 本地文件系统 (备用)
   └─ 路径: C:/BruV_Data/media_library/
```

### 目录结构

**MinIO 模式**:
```
bruv-media-library/
├── product/
│   └── 20260206/
│       └── a3d5f7e9....png
├── screenshot/
│   └── 20260206/
│       └── b5c7d9e1....png
└── general/
    └── 20260206/
        └── c7d9e1f3....jpg
```

**本地模式**:
```
C:/BruV_Data/media_library/
├── 20260206/
│   ├── a3d5f7e9....png
│   ├── b5c7d9e1....png
│   └── c7d9e1f3....jpg
└── 20260205/
    └── ...
```

---

## 🔗 与知识库集成

### 在 RAGFlow 文档中引用图片

```markdown
# 产品介绍文档

![产品标志](http://localhost:9000/bruv-media-library/product/20260206/a3d5f7e9....png)

## 功能截图

![功能演示](http://localhost:9000/bruv-media-library/screenshot/20260206/b5c7d9e1....png)
```

### 在 Dify 应用中使用

```python
# 上传图片后获取 URL
response = requests.post("http://localhost:8000/api/media/upload", ...)
image_url = response.json()['data']['storage_url']

# 在 Dify 提示词中引用
prompt = f"""
请分析这张图片：{image_url}

图片描述：{description}
标签：{tags}
"""
```

---

## ⚙️ 配置说明

### MinIO 配置

在 `backend/api/media_library.py` 中修改：

```python
MINIO_ENDPOINT = "localhost:9000"
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "infiniflow"
MINIO_BUCKET = "bruv-media-library"
```

### 本地存储路径

```python
LOCAL_STORAGE_PATH = Path("C:/BruV_Data/media_library")
```

### 支持的图片格式

```python
ALLOWED_IMAGE_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 
    'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'
}
```

---

## 🎨 分类建议

推荐的图片分类：

| 分类 | 用途 | 示例 |
|------|------|------|
| `product` | 产品相关 | logo、产品图、包装 |
| `screenshot` | 截图文档 | 界面截图、流程图 |
| `diagram` | 架构图表 | 系统架构、流程图 |
| `avatar` | 用户头像 | 员工照片、用户头像 |
| `banner` | 宣传素材 | 横幅、海报 |
| `document` | 文档图片 | 扫描文档、图表 |
| `general` | 通用图片 | 其他图片 |

---

## 🔍 高级功能

### 自动去重机制

系统使用 **SHA256 哈希**识别重复文件：

```python
# 相同内容的文件会被识别为同一个 file_id
file1.jpg (内容: ABCD) → file_id: a3d5f7e9...
file2.jpg (内容: ABCD) → file_id: a3d5f7e9... (相同)
```

### 标签搜索（待实现）

```python
# 未来支持
GET /api/media/search?q=logo
GET /api/media/search?tags=product,branding
```

### OCR 文字识别（待实现）

```python
# 集成 Tesseract OCR
{
  "ocr_text": "图片中的文字内容",
  "language": "chi_tra+eng"
}
```

---

## 🛠️ 故障排查

### 问题 1：MinIO 连接失败

**错误**: `MinIO 连接失败: Connection refused`

**解决**:
```powershell
# 启动 MinIO 服务
cd BruV_Project
docker-compose up -d ragflow-minio

# 检查状态
docker ps | findstr minio
```

### 问题 2：图片无法访问

**MinIO 模式**: 检查 MinIO 是否运行
```powershell
# 访问 MinIO 控制台
http://localhost:9001
# 用户名: minioadmin
# 密码: infiniflow
```

**本地模式**: 确保路径存在
```powershell
Test-Path C:\BruV_Data\media_library
```

### 问题 3：上传失败

检查文件格式是否支持：
```python
ALLOWED_IMAGE_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 
    'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp'
}
```

---

## 📊 性能优化

### 大文件上传

修改 FastAPI 配置：
```python
app = FastAPI(
    max_upload_size=100 * 1024 * 1024  # 100MB
)
```

### 缩略图生成（建议）

```python
from PIL import Image

def create_thumbnail(image_path, size=(300, 300)):
    img = Image.open(image_path)
    img.thumbnail(size)
    return img
```

---

## 🎓 总结

✅ **您已成功搭建本地化图片库！**

主要优势：
- 🔒 **数据安全** - 完全本地化，无外部依赖
- 🚀 **高性能** - MinIO S3 兼容存储
- 🔄 **自动备份** - 本地文件系统备用
- 🎨 **灵活分类** - 多维度标签管理
- 🔗 **无缝集成** - 与 RAGFlow、Dify 完美协作

**下一步**:
1. 运行测试脚本验证功能
2. 集成到您的知识库工作流
3. 根据需求扩展 OCR、缩略图等高级功能

---

📖 **更多帮助**: 访问 http://localhost:8000/docs 查看完整 API 文档
