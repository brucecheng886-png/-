# 🚀 BruV Launcher 升級日誌 v3.1

## 📋 升級概述

將 `LauncherWorker` 從**進程管理模式**升級為**全系統狀態監控模式**，解決啟動器重啟後無法控制背景進程的問題。

---

## 🎯 核心改進

### 1. **新增狀態檢查方法**

#### `check_port_status(port)` - 即時端口檢查
```python
def check_port_status(self, port):
    """檢查端口是否有服務運行（即時檢查）"""
    try:
        with socket.create_connection(("localhost", port), timeout=1):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False
```

**用途：**
- 快速檢查服務是否存活（1秒超時）
- 不依賴 `self.processes` 列表
- 可重複調用，無副作用

---

#### `check_docker_status()` - Docker 容器檢查
```python
def check_docker_status(self):
    """檢查 Docker 容器狀態（靜默模式，不輸出 Log）"""
    try:
        result = subprocess.run(['docker', 'ps'], ...)
        output = result.stdout.lower()
        if 'ragflow' in output or 'es01' in output or 'dify' in output:
            return True
        return False
    except Exception:
        return False
```

**檢查目標：**
- RAGFlow 容器
- Elasticsearch (es01)
- Dify 容器

---

### 2. **智能啟動邏輯**

#### 避免重複啟動
在 `start_backend()` 和 `start_frontend()` 中新增檢查：

```python
# 檢查服務是否已在運行
if self.check_port_status(8000):
    self.log("⚠️  後端服務已在運行中 (Port 8000)，略過啟動")
    self.status_signal.emit("backend", "running")
    return "already_running"
```

**效果：**
- 如果服務已在運行 → 略過啟動，直接標記為 `running`
- 避免重複啟動導致端口衝突
- 提升啟動器容錯性

---

### 3. **持續狀態監控**

#### `run_monitor_mode()` - 背景監控迴圈
```python
def run_monitor_mode(self):
    """監控模式：持續監控系統狀態"""
    last_status = {'backend': None, 'frontend': None, 'docker': None}
    
    while self._is_running:
        # 每 2 秒檢查一次所有服務
        backend_alive = self.check_port_status(8000)
        frontend_alive = self.check_port_status(5173)
        docker_alive = self.check_docker_status()
        
        # 只在狀態改變時發送信號和 Log
        if backend_status != last_status['backend']:
            self.status_signal.emit("backend", backend_status)
            if backend_status == 'stopped':
                self.log("⚠️  BACKEND 服務已停止")
        
        time.sleep(2)
```

**特點：**
- 每 2 秒掃描一次全系統狀態
- 只在狀態**改變**時輸出 Log（避免刷屏）
- 即使 `self.processes` 為空，仍能正確監控

---

### 4. **模式化執行架構**

#### 新增 `mode` 參數
```python
def __init__(self, project_root, mode='start'):
    self.mode = mode  # 'start', 'stop', 'monitor'
```

#### 智能路由器 `run()`
```python
def run(self):
    """主執行流程（智能路由器）"""
    if self.mode == 'start':
        self.run_start_mode()    # 啟動所有服務
    elif self.mode == 'stop':
        self.stop()              # 強制停止所有服務
    elif self.mode == 'monitor':
        self.run_monitor_mode()  # 純監控模式
```

**調用方式：**
```python
# 啟動模式
worker = LauncherWorker(project_root, mode='start')

# 停止模式
worker = LauncherWorker(project_root, mode='stop')

# 純監控模式（不啟動，只監控）
worker = LauncherWorker(project_root, mode='monitor')
```

---

### 5. **強化停止邏輯**

#### 無差別強制關閉
```python
def stop(self):
    """停止所有服務（強制清理模式）"""
    # 第一步：無差別強制關閉端口
    self.log("🔥 正在執行強制清理...")
    self.kill_process_by_port(8000)  # 後端 API
    self.kill_process_by_port(5173)  # 前端 Vue
    
    # 第二步：清理已知子進程（雙重保險）
    if self.processes:
        for process in self.processes:
            # taskkill /F /T /PID ...
    
    # 第三步：清空進程列表
    self.processes.clear()
```

**特點：**
- **不依賴** `self.processes` 列表
- 即使啟動器重啟過，仍能關閉服務
- 雙重保險機制確保徹底清理

---

## 🔄 執行流程圖

### 啟動流程
```
用戶按下「啟動」按鈕
    ↓
創建 LauncherWorker(mode='start')
    ↓
run_start_mode()
    ├─ 檢查 Docker 狀態
    ├─ 檢查 Backend (8000) 是否已運行
    │   ├─ 已運行 → 略過啟動
    │   └─ 未運行 → 啟動 uvicorn
    ├─ 檢查 Frontend (5173) 是否已運行
    │   ├─ 已運行 → 略過啟動
    │   └─ 未運行 → 啟動 npm run dev
    └─ 切換到 run_monitor_mode()
            ↓
        持續監控狀態（每 2 秒）
```

### 停止流程
```
用戶按下「停止」按鈕
    ↓
創建 LauncherWorker(mode='stop')
    ↓
stop()
    ├─ kill_process_by_port(8000)
    ├─ kill_process_by_port(5173)
    ├─ 清理已知子進程 (taskkill)
    └─ 清空 self.processes 列表
```

---

## ✅ 解決的問題

### 問題 1：啟動器重啟後無法控制服務
**原因：** `self.processes` 列表在啟動器重啟後清空  
**解決：** 改用 `check_port_status()` + `kill_process_by_port()`，不依賴進程列表

### 問題 2：無法得知服務真實狀態
**原因：** 只依賴 `self.processes` 判斷，無法檢測外部啟動的服務  
**解決：** 新增 `run_monitor_mode()`，持續掃描端口狀態

### 問題 3：重複啟動導致端口衝突
**原因：** 沒有檢查服務是否已運行就直接啟動  
**解決：** 在啟動前先調用 `check_port_status()`，已運行則略過

---

## 📊 狀態更新機制

### 狀態燈顏色對應
```python
status_signal.emit("backend", "running")   # 🟢 綠色
status_signal.emit("backend", "stopped")   # 🔴 紅色
status_signal.emit("backend", "starting")  # 🟡 黃色
status_signal.emit("backend", "error")     # 🔴 紅色
```

### 監控迴圈邏輯
```python
# 只在狀態改變時發送信號
if current_status['backend'] != last_status['backend']:
    self.status_signal.emit("backend", current_status['backend'])
    if current_status['backend'] == 'stopped':
        self.log("⚠️  BACKEND 服務已停止")
```

---

## 🚨 注意事項

1. **監控迴圈在背景持續執行**  
   啟動完成後會自動切換到監控模式，直到用戶按下停止按鈕

2. **停止操作會創建新的 Worker**  
   ```python
   # 舊的 worker 停止監控
   if self.worker and self.worker.isRunning():
       self.worker._is_running = False
   
   # 創建新的 worker 執行停止操作
   self.worker = LauncherWorker(project_root, mode='stop')
   ```

3. **Docker 檢查是靜默的**  
   `check_docker_status()` 不輸出 Log，避免刷屏  
   `check_docker_services()` 才會輸出 Log（僅在啟動時調用）

---

## 🔧 使用範例

### 手動觸發監控模式（不啟動服務）
```python
# 只監控，不啟動
worker = LauncherWorker(project_root, mode='monitor')
worker.log_signal.connect(print)
worker.status_signal.connect(lambda s, st: print(f"{s}: {st}"))
worker.start()
```

### 檢查單個服務狀態
```python
worker = LauncherWorker(project_root)
backend_alive = worker.check_port_status(8000)
docker_alive = worker.check_docker_status()
print(f"Backend: {backend_alive}, Docker: {docker_alive}")
```

---

## 📅 版本歷史

- **v3.1** (2026-02-04) - 全系統狀態監控升級
- **v3.0** - 多語言支援 + Anytype 主題
- **v2.0** - 智慧切換按鈕
- **v1.0** - 基礎啟動器

---

## 🎯 未來改進方向

1. **增加健康檢查端點**  
   調用 `/api/health` 檢查服務是否真的可用（不只是端口開啟）

2. **支援自動重啟**  
   如果檢測到服務異常停止，自動嘗試重啟

3. **狀態持久化**  
   將監控狀態寫入日誌文件，方便事後分析

4. **增加通知機制**  
   服務異常時發送系統通知（Windows Toast）

---

**更新日期：** 2026-02-04  
**作者：** GitHub Copilot  
**版本：** v3.1
