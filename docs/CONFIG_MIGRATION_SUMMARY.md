# 配置管理系統更新摘要

## 🎯 更新內容

將 Dify 和 RAGFlow 的配置從 `.env` 文件遷移到 `config.json` 文件管理系統。

## ✅ 已完成的工作

### 1. 後端配置系統升級

#### backend/core/config.py
- ✅ 新增 `load_config_from_file()` 函數，從 `C:/BruV_Data/config.json` 讀取配置
- ✅ 新增 `save_config_to_file()` 函數，保存配置到 JSON 文件
- ✅ 修改 `Settings` 類，優先從 config.json 載入配置
- ✅ 更新 `get_current_api_keys()` 函數，支持配置優先級

**配置優先級：**
```
config.json > 環境變數 > 默認值
```

#### backend/api/system.py
- ✅ 更新 `GET /api/system/config` 端點，從 config.json 讀取配置
- ✅ 更新 `POST /api/system/config` 端點，保存配置到 config.json
- ✅ 移除對 .env 文件的直接操作

### 2. 前端 Settings 頁面更新

#### frontend/src/views/Settings.vue
- ✅ 更新提示訊息，說明配置存儲位置為 `config.json`
- ✅ 更新成功提示，移除「需要重啟後端」的說明
- ✅ 強調配置立即生效的特性

### 3. 配置遷移工具

#### migrate_config.py
- ✅ 自動讀取 `.env` 文件中的配置
- ✅ 提取 Dify 和 RAGFlow 相關配置
- ✅ 保存到 `C:/BruV_Data/config.json`
- ✅ 顯示詳細的遷移過程和結果

#### config.json.example
- ✅ 提供配置示例文件
- ✅ 包含所有必要的配置項

### 4. 文檔

#### docs/CONFIG_MANAGEMENT_GUIDE.md
- ✅ 完整的配置管理指南
- ✅ 遷移步驟說明
- ✅ 使用方法介紹
- ✅ 故障排查指南

## 📁 新增/修改的文件

```
BruV_Project/
├── backend/
│   ├── core/
│   │   └── config.py                 # ✏️ 修改
│   └── api/
│       └── system.py                 # ✏️ 修改
├── frontend/
│   └── src/
│       └── views/
│           └── Settings.vue          # ✏️ 修改
├── docs/
│   └── CONFIG_MANAGEMENT_GUIDE.md   # ✨ 新增
├── config.json.example              # ✨ 新增
└── migrate_config.py                # ✨ 新增
```

## 🚀 使用方法

### 首次設置

```powershell
# 1. 執行遷移（如果有現有的 .env 配置）
cd BruV_Project
python migrate_config.py

# 2. 或手動創建配置
New-Item -ItemType Directory -Force -Path C:\BruV_Data
Copy-Item config.json.example C:\BruV_Data\config.json
notepad C:\BruV_Data\config.json
```

### 日常使用

1. 訪問 Settings 頁面: `http://localhost:5173/#/settings`
2. 修改配置
3. 點擊「儲存設定」
4. 配置立即生效（無需重啟）

## 🔄 配置流程

### 之前
```
修改 .env → 重啟後端 → 生效
```

### 現在
```
Settings 頁面修改 → 自動保存到 config.json → 立即生效
```

## ⚙️ 技術細節

### 配置讀取優先級

```python
# 1. 嘗試從 config.json 讀取
file_config = load_config_from_file()
if file_config.get('dify_api_key'):
    return file_config.get('dify_api_key')

# 2. 如果沒有，使用環境變數
env_key = os.getenv('DIFY_API_KEY')
if env_key:
    return env_key

# 3. 最後使用默認值
return settings.DIFY_API_KEY
```

### API 端點

| 端點 | 方法 | 功能 |
|------|------|------|
| `/api/system/config` | GET | 獲取當前配置 |
| `/api/system/config` | POST | 更新配置 |
| `/api/system/test-connection` | POST | 測試服務連接 |

### 配置文件位置

```
C:/BruV_Data/config.json
```

統一存放在 `BruV_Data` 目錄，避免中文路徑問題。

## 🎯 優勢對比

| 特性 | .env 方式 | config.json 方式 |
|------|-----------|-----------------|
| 動態更新 | ❌ 需要重啟 | ✅ 立即生效 |
| UI 管理 | ❌ 手動編輯 | ✅ Settings 頁面 |
| 配置優先級 | 不明確 | ✅ 清晰的優先級 |
| 錯誤提示 | 不友好 | ✅ 清晰的錯誤訊息 |
| 備份還原 | 困難 | ✅ JSON 格式易操作 |

## 🔐 安全建議

1. **不要提交到 Git**
   ```gitignore
   C:/BruV_Data/config.json
   config.json
   ```

2. **設置適當權限**
   ```powershell
   # 限制文件訪問權限
   icacls "C:\BruV_Data\config.json" /inheritance:r
   icacls "C:\BruV_Data\config.json" /grant:r "$env:USERNAME:(R,W)"
   ```

3. **定期備份**
   ```powershell
   Copy-Item C:\BruV_Data\config.json C:\BruV_Data\config.json.backup
   ```

## 📋 測試清單

- [x] 遷移腳本成功執行
- [x] config.json 文件創建成功
- [x] 配置內容正確遷移
- [ ] Settings 頁面可以讀取配置
- [ ] Settings 頁面可以保存配置
- [ ] 測試連接功能正常
- [ ] 後端服務使用 config.json 配置
- [ ] 配置修改後立即生效

## 🐛 已知問題

無

## 📝 後續工作

1. 測試 Settings 頁面配置管理功能
2. 驗證配置優先級工作正常
3. 測試服務連接功能
4. 更新部署文檔

## 📞 支持

如有問題，請參考：
- [配置管理指南](./docs/CONFIG_MANAGEMENT_GUIDE.md)
- [Settings 頁面測試指南](./tests/SETTINGS_PAGE_TEST.md)
