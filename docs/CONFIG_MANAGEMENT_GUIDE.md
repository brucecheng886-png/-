# 配置管理系統升級指南

## 📋 概述

Dify 和 RAGFlow 的配置已從 `.env` 文件遷移到基於 JSON 的配置系統，提供更好的管理體驗。

## 🎯 主要變更

### 之前（.env 方式）
- 配置存儲在項目根目錄的 `.env` 文件
- 修改後需要重啟服務才能生效
- 不支持動態更新
- 難以通過 UI 管理

### 現在（config.json 方式）
- 配置存儲在 `C:/BruV_Data/config.json`
- 修改後立即生效，無需重啟
- 支持通過 Settings 頁面動態管理
- 清晰的配置優先級

## 🔄 配置優先級

```
config.json > 環境變數 (.env) > 默認值
```

1. **config.json** (最高優先級) - 通過 Settings 頁面管理
2. **環境變數** - 從 `.env` 文件或系統環境變數讀取
3. **默認值** - 程式內建的默認配置

## 📦 遷移步驟

### 1. 執行遷移腳本

```powershell
cd BruV_Project
python migrate_config.py
```

這將：
- 讀取現有的 `.env` 文件
- 提取 Dify 和 RAGFlow 配置
- 保存到 `C:/BruV_Data/config.json`
- 顯示遷移結果

### 2. 驗證配置

訪問 Settings 頁面檢查配置是否正確載入：
```
http://localhost:5173/#/settings
```

### 3. 測試連接

在 Settings 頁面點擊「測試連接」按鈕，確認服務可正常連接。

## 🎨 使用 Settings 頁面

### 訪問方式

1. 啟動前端和後端服務
2. 點擊右上角的齒輪圖標 ⚙️
3. 或直接訪問 `/#/settings`

### 功能介紹

#### 配置管理
- **Dify API URL**: Dify 服務端點
- **Dify API Key**: Dify 應用 API Key
- **RAGFlow API URL**: RAGFlow 服務端點
- **RAGFlow API Key**: RAGFlow API Key

#### 操作按鈕
- **測試連接**: 驗證服務是否可達
- **重新載入**: 從配置文件重新讀取
- **儲存設定**: 保存更改到 config.json

### 修改配置

1. 在對應輸入框修改配置
2. 點擊「儲存設定」
3. 配置立即生效（無需重啟）

## 📝 配置文件格式

### config.json 示例

```json
{
  "dify_api_key": "app-9DZjjvZF4MzGSN4y9KBBmP60",
  "dify_api_url": "http://localhost:80/v1",
  "ragflow_api_key": "ragflow-xxxxxxxxxxxxxxxxx",
  "ragflow_api_url": "http://localhost:81/api/v1"
}
```

### 配置項說明

| 配置項 | 說明 | 示例 |
|--------|------|------|
| `dify_api_key` | Dify 應用 API Key | `app-xxxxxxxx` |
| `dify_api_url` | Dify API 端點 | `http://localhost:80/v1` |
| `ragflow_api_key` | RAGFlow API Key | `ragflow-xxxxxxxx` |
| `ragflow_api_url` | RAGFlow API 端點 | `http://localhost:81/api/v1` |

## 🔧 技術實現

### 後端 (backend/core/config.py)

```python
# 配置加載順序
def get_current_api_keys():
    file_config = load_config_from_file()  # 1. config.json
    env_var = os.getenv('DIFY_API_KEY')    # 2. 環境變數
    default = settings.DIFY_API_KEY        # 3. 默認值
    
    return file_config or env_var or default
```

### API 端點 (backend/api/system.py)

- `GET /api/system/config` - 獲取當前配置
- `POST /api/system/config` - 更新配置
- `POST /api/system/test-connection` - 測試服務連接

## 🎯 最佳實踐

### 開發環境

1. 使用 Settings 頁面管理配置
2. 定期備份 `config.json`
3. 保留 `.env` 文件作為備份

### 生產環境

1. 設置適當的文件權限保護配置
2. 不要將 `config.json` 提交到版本控制
3. 使用環境變數作為後備方案

## 🐛 故障排查

### 配置未生效

**檢查配置優先級：**
```powershell
# 查看實際使用的配置源
curl http://localhost:8000/api/system/config
```

### config.json 不存在

運行遷移腳本自動創建：
```powershell
python migrate_config.py
```

或手動創建：
```powershell
# 創建目錄
New-Item -ItemType Directory -Force -Path C:\BruV_Data

# 複製示例配置
Copy-Item config.json.example C:\BruV_Data\config.json

# 編輯配置
notepad C:\BruV_Data\config.json
```

### Settings 頁面無法載入配置

1. 確認後端服務正在運行
2. 檢查 `config.json` 文件格式是否正確
3. 查看瀏覽器控制台錯誤訊息

## 📚 相關文件

- `config.json.example` - 配置示例文件
- `migrate_config.py` - 配置遷移腳本
- `backend/core/config.py` - 配置管理核心
- `backend/api/system.py` - 配置 API
- `frontend/src/views/Settings.vue` - Settings 頁面

## ⚠️ 注意事項

1. **安全性**: 不要將包含真實 API Keys 的 `config.json` 提交到版本控制
2. **備份**: 修改配置前建議先備份
3. **權限**: 確保應用有讀寫 `C:/BruV_Data/` 目錄的權限
4. **兼容性**: 舊的 `.env` 方式仍然支持，作為後備方案

## 🎉 優勢

✅ **即時生效** - 配置修改立即生效，無需重啟  
✅ **UI 管理** - 通過 Settings 頁面輕鬆管理  
✅ **清晰優先級** - 明確的配置來源優先級  
✅ **向後兼容** - 仍支持 `.env` 作為後備  
✅ **統一存儲** - 所有數據統一存放在 `C:/BruV_Data/`  

## 📞 支持

如有問題，請：
1. 檢查本文檔的故障排查章節
2. 查看應用日誌
3. 聯繫技術支持
