"""
任务管理 API 端点
提供任务状态查询、任务列表等接口
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any

from backend.services.task_queue import task_queue

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=Dict[str, Any])
async def get_all_tasks():
    """获取所有任务列表"""
    tasks = task_queue.get_all_tasks()
    return {
        "success": True,
        "total": len(tasks),
        "tasks": [task.to_dict() for task in tasks.values()]
    }


@router.get("/{task_id}", response_model=Dict[str, Any])
async def get_task_status(task_id: str):
    """
    获取任务状态
    
    Args:
        task_id: 任务 ID
        
    Returns:
        任务详细信息
    """
    task = task_queue.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail=f"任务不存在: {task_id}")
    
    return {
        "success": True,
        "task": task.to_dict()
    }


@router.delete("/{task_id}", response_model=Dict[str, Any])
async def cancel_task(task_id: str):
    """
    取消任务 (TODO: 实现取消逻辑)
    
    Args:
        task_id: 任务 ID
    """
    task = task_queue.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail=f"任务不存在: {task_id}")
    
    # TODO: 实现任务取消逻辑
    return {
        "success": True,
        "message": "任务取消功能开发中"
    }
