"""
媒体库 API - 图片资源管理系统
支持上传、检索、标签分类、OCR 识别
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Any
import io
import logging
from datetime import datetime
from pathlib import Path
import hashlib
import mimetypes
import os

# MinIO 客户端
try:
    from minio import Minio
    from minio.error import S3Error
    MINIO_AVAILABLE = True
except ImportError:
    MINIO_AVAILABLE = False
    logging.warning("MinIO 未安装，图片库将使用本地存储")

logger = logging.getLogger(__name__)
router = APIRouter()

# ==================== 配置 ====================
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "localhost:9000")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ROOT_USER", "minioadmin")
MINIO_SECRET_KEY = os.environ.get("MINIO_ROOT_PASSWORD", "")
MINIO_BUCKET = "bruv-media-library"
LOCAL_STORAGE_PATH = Path(os.environ.get("MEDIA_LIBRARY_PATH", "C:/BruV_Data/media_library"))

# 支持的图片格式
ALLOWED_IMAGE_TYPES = {
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/webp', 'image/svg+xml', 'image/bmp'
}

# ==================== MinIO 客户端初始化 ====================
def get_minio_client() -> Optional[Minio]:
    """获取 MinIO 客户端"""
    if not MINIO_AVAILABLE:
        return None
    
    try:
        client = Minio(
            MINIO_ENDPOINT,
            access_key=MINIO_ACCESS_KEY,
            secret_key=MINIO_SECRET_KEY,
            secure=False  # 本地开发环境
        )
        
        # 确保 bucket 存在
        if not client.bucket_exists(MINIO_BUCKET):
            client.make_bucket(MINIO_BUCKET)
            logger.info(f"✅ 创建 MinIO Bucket: {MINIO_BUCKET}")
        
        return client
    except Exception as e:
        logger.error(f"❌ MinIO 连接失败: {e}")
        return None


# ==================== 辅助函数 ====================
def calculate_file_hash(content: bytes) -> str:
    """计算文件哈希值（用于去重）"""
    return hashlib.sha256(content).hexdigest()


def validate_image(file: UploadFile) -> bool:
    """验证文件是否为支持的图片格式"""
    content_type = file.content_type
    return content_type in ALLOWED_IMAGE_TYPES


def get_local_storage_path(file_hash: str, original_filename: str) -> Path:
    """生成本地存储路径（按日期分组）"""
    date_folder = datetime.now().strftime("%Y%m%d")
    file_extension = Path(original_filename).suffix
    storage_path = LOCAL_STORAGE_PATH / date_folder
    storage_path.mkdir(parents=True, exist_ok=True)
    return storage_path / f"{file_hash}{file_extension}"


# ==================== API 端点 ====================

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    tags: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form("general")
):
    """
    上传图片到媒体库
    
    支持：
    - 自动去重（基于 SHA256）
    - 标签分类
    - MinIO 对象存储（优先）
    - 本地文件系统（备用）
    
    参数：
    - file: 图片文件
    - tags: 标签（逗号分隔，如: "产品,宣传,2024"）
    - description: 图片描述
    - category: 分类（如: general, product, logo, screenshot）
    """
    try:
        # 1. 验证文件类型
        if not validate_image(file):
            raise HTTPException(
                status_code=400,
                detail=f"不支持的文件格式。仅支持: {', '.join(ALLOWED_IMAGE_TYPES)}"
            )
        
        # 确保文件名存在
        if not file.filename:
            raise HTTPException(status_code=400, detail="文件名不能为空")
        
        # 2. 读取文件内容
        content = await file.read()
        # 檢查檔案大小（預設上限 100 MB）
        max_size = int(os.environ.get("MAX_UPLOAD_SIZE", str(100 * 1024 * 1024)))
        if len(content) > max_size:
            max_mb = max_size // (1024 * 1024)
            raise HTTPException(
                status_code=413,
                detail=f"檔案大小超過限制（最大 {max_mb} MB）"
            )
        file_hash = calculate_file_hash(content)
        file_size = len(content)
        
        # 3. 尝试使用 MinIO
        minio_client = get_minio_client()
        storage_type = "minio" if minio_client else "local"
        
        if minio_client:
            try:
                # 上传到 MinIO
                file_extension = Path(file.filename).suffix
                object_name = f"{category}/{datetime.now().strftime('%Y%m%d')}/{file_hash}{file_extension}"
                
                minio_client.put_object(
                    MINIO_BUCKET,
                    object_name,
                    io.BytesIO(content),
                    length=file_size,
                    content_type=file.content_type or 'application/octet-stream'
                )
                
                storage_url = f"http://{MINIO_ENDPOINT}/{MINIO_BUCKET}/{object_name}"
                logger.info(f"✅ 图片已上传到 MinIO: {object_name}")
                
            except S3Error as e:
                logger.error(f"MinIO 上传失败，切换到本地存储: {e}")
                storage_type = "local"
                minio_client = None
        
        # 4. 使用本地存储（备用方案）
        if not minio_client:
            local_path = get_local_storage_path(file_hash, file.filename)
            with open(local_path, 'wb') as f:
                f.write(content)
            storage_url = f"/api/media/files/{local_path.relative_to(LOCAL_STORAGE_PATH).as_posix()}"
            logger.info(f"✅ 图片已保存到本地: {local_path}")
        
        # 5. 构建元数据
        metadata = {
            "file_id": file_hash,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "file_size": file_size,
            "storage_type": storage_type,
            "storage_url": storage_url,
            "category": category,
            "tags": [t.strip() for t in tags.split(",")] if tags else [],
            "description": description or "",
            "upload_time": datetime.now().isoformat(),
            "dimensions": None,  # 可集成 Pillow 获取图片尺寸
            "ocr_text": None     # 可集成 OCR 识别
        }
        
        # 6. TODO: 保存元数据到数据库（必要！）
        # 当前返回内存数据，重启后 tags/description 会丢失
        # 生产环境建议存储到 PostgreSQL 或 MongoDB
        # 示例: await db.media_metadata.insert_one(metadata)
        
        return {
            "success": True,
            "message": "图片上传成功",
            "data": metadata
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"上传失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")


@router.get("/list")
async def list_images(
    category: Optional[str] = None,
    tags: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """
    列出媒体库中的图片
    
    参数：
    - category: 按分类筛选
    - tags: 按标签筛选（逗号分隔）
    - limit: 每页数量
    - offset: 偏移量
    """
    try:
        minio_client = get_minio_client()
        
        if minio_client:
            # 从 MinIO 列出对象
            objects = []
            prefix = f"{category}/" if category else ""
            
            for obj in minio_client.list_objects(MINIO_BUCKET, prefix=prefix, recursive=True):
                if obj.object_name and obj.object_name.strip():  # 確保對象名稱存在且非空
                    objects.append({
                        "file_id": obj.object_name,
                        "filename": Path(obj.object_name).name,
                        "size": obj.size or 0,
                        "last_modified": obj.last_modified.isoformat() if obj.last_modified else None,
                        "url": f"http://{MINIO_ENDPOINT}/{MINIO_BUCKET}/{obj.object_name}"
                    })
            
            # 应用分页
            total = len(objects)
            paginated = objects[offset:offset+limit]
            
            return {
                "success": True,
                "total": total,
                "limit": limit,
                "offset": offset,
                "data": paginated
            }
        else:
            # 从本地存储列出文件
            if not LOCAL_STORAGE_PATH.exists():
                return {"success": True, "total": 0, "data": []}
            
            images = []
            for img_file in LOCAL_STORAGE_PATH.rglob("*"):
                if img_file.is_file() and img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.gif', '.webp']:
                    images.append({
                        "file_id": img_file.stem,
                        "filename": img_file.name,
                        "size": img_file.stat().st_size,
                        "last_modified": datetime.fromtimestamp(img_file.stat().st_mtime).isoformat(),
                        "url": f"/api/media/files/{img_file.relative_to(LOCAL_STORAGE_PATH)}"
                    })
            
            total = len(images)
            paginated = images[offset:offset+limit]
            
            return {
                "success": True,
                "total": total,
                "limit": limit,
                "offset": offset,
                "data": paginated
            }
    
    except Exception as e:
        logger.error(f"列表查询失败: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/files/{file_path:path}")
async def get_image(file_path: str):
    """
    获取本地存储的图片文件
    
    仅在使用本地存储模式时需要此端点
    MinIO 模式下图片可直接通过 MinIO URL 访问
    """
    try:
        full_path = (LOCAL_STORAGE_PATH / file_path).resolve()
        
        # 路徑遍歷防護：確保路徑在允許的儲存目錄內
        if not str(full_path).startswith(str(LOCAL_STORAGE_PATH.resolve())):
            raise HTTPException(status_code=403, detail="禁止存取此路徑")
        
        if not full_path.exists() or not full_path.is_file():
            raise HTTPException(status_code=404, detail="图片不存在")
        
        # 读取文件
        with open(full_path, 'rb') as f:
            content = f.read()
        
        # 检测 MIME 类型
        mime_type, _ = mimetypes.guess_type(full_path)
        if not mime_type:
            mime_type = "application/octet-stream"
        
        return StreamingResponse(
            io.BytesIO(content),
            media_type=mime_type,
            headers={
                "Content-Disposition": f"inline; filename={full_path.name}"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"文件读取失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{file_id:path}")
async def delete_image(file_id: str):
    """
    删除图片
    
    参数：
    - file_id: MinIO完整對象路徑 (如: general/20260206/abc123.jpg) 或本地文件哈希
    """
    try:
        minio_client = get_minio_client()
        
        if minio_client:
            # 从 MinIO 删除（file_id 應該是完整對象路徑）
            minio_client.remove_object(MINIO_BUCKET, file_id)
            logger.info(f"✅ 已从 MinIO 删除: {file_id}")
        else:
            # 从本地删除（使用哈希匹配）
            deleted = False
            for img_file in LOCAL_STORAGE_PATH.rglob(f"{file_id}.*"):
                # 路徑遍歷防護
                if not str(img_file.resolve()).startswith(str(LOCAL_STORAGE_PATH.resolve())):
                    continue
                if img_file.is_file():
                    img_file.unlink()
                    logger.info(f"✅ 已从本地删除: {img_file}")
                    deleted = True
            
            if not deleted:
                raise HTTPException(status_code=404, detail="图片不存在")
        
        return {
            "success": True,
            "message": "图片已删除",
            "file_id": file_id
        }
    
    except Exception as e:
        logger.error(f"删除失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_library_stats():
    """
    获取媒体库统计信息
    
    返回：
    - 总图片数量
    - 总存储大小
    - 分类统计
    - 存储类型
    
    性能警告：大量文件時會很慢（遍歷所有對象）
    生產環境建議：使用數據庫統計或 Redis 緩存
    """
    try:
        minio_client = get_minio_client()
        
        if minio_client:
            total_count = 0
            total_size = 0
            categories = {}
            
            for obj in minio_client.list_objects(MINIO_BUCKET, recursive=True):
                if obj.object_name and obj.object_name.strip():  # 確保對象名稱存在且非空
                    total_count += 1
                    total_size += obj.size or 0
                    
                    # 提取分类
                    cat = obj.object_name.split('/')[0] if '/' in obj.object_name else 'uncategorized'
                    categories[cat] = categories.get(cat, 0) + 1
            
            return {
                "success": True,
                "storage_type": "minio",
                "total_images": total_count,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "categories": categories,
                "endpoint": f"http://{MINIO_ENDPOINT}"
            }
        else:
            if not LOCAL_STORAGE_PATH.exists():
                return {
                    "success": True,
                    "storage_type": "local",
                    "total_images": 0,
                    "total_size_mb": 0,
                    "categories": {}
                }
            
            total_count = 0
            total_size = 0
            categories = {}
            
            for img_file in LOCAL_STORAGE_PATH.rglob("*"):
                if img_file.is_file():
                    total_count += 1
                    total_size += img_file.stat().st_size
                    
                    # 提取分类（基于目录结构）
                    cat = img_file.parent.name
                    categories[cat] = categories.get(cat, 0) + 1
            
            return {
                "success": True,
                "storage_type": "local",
                "total_images": total_count,
                "total_size_mb": round(total_size / (1024 * 1024), 2),
                "categories": categories,
                "storage_path": str(LOCAL_STORAGE_PATH)
            }
    
    except Exception as e:
        logger.error(f"统计失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))
