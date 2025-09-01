# 📚 文檔目錄

## 🗂️ 主要文檔

### 📖 用戶文檔
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - 完整設置指南 (包含 Google Sheets 結構)
- **[README.md](./README.md)** - 專案概述與快速開始

### 🔧 技術文檔
- **[DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md)** - 詳細資料庫結構說明
- **[CONCURRENCY_FIX_SUMMARY.md](./CONCURRENCY_FIX_SUMMARY.md)** - 併發問題修正總結

### 📋 企劃文檔
- **[SPEC.md](./SPEC.md)** - 企劃規格說明
- **[STEP.md](./STEP.md)** - 開發步驟記錄

---

## 🚀 快速導航

### 🆕 **首次設置**
1. 閱讀 [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. 設置 Google Sheets 資料表
3. 配置環境變數
4. 執行 `npm run dev`

### 🔄 **了解最新修改**
1. 查看 [CONCURRENCY_FIX_SUMMARY.md](./CONCURRENCY_FIX_SUMMARY.md)
2. 檢查 [DATABASE_STRUCTURE.md](./DATABASE_STRUCTURE.md) 中的新增表格

### 🐛 **問題排查**
1. 檢查 Google Sheets API 配額
2. 驗證 credentials.json 設定
3. 確認工作表名稱和結構正確

---

## 📝 文檔更新日誌

### 2025-09-01 - 併發控制更新
- ✅ 新增 SETUP_GUIDE.md 整合設定指南
- ✅ 更新 DATABASE_STRUCTURE.md 併發安全結構
- ✅ 新增 CONCURRENCY_FIX_SUMMARY.md 修正總結
- ✅ 清理過時文檔 (EVENT_CAMPAIGNS_SETUP.md 等)

### 🗑️ 已清理的文檔
- ~~NEW_DATABASE_SETUP.md~~ → 整合到 SETUP_GUIDE.md
- ~~EVENT_CAMPAIGNS_SETUP.md~~ → 整合到 SETUP_GUIDE.md  
- ~~EVENT_EXAMPLES.md~~ → 整合到 SETUP_GUIDE.md
- ~~NEW_CAMPAIGN_API.md~~ → 整合到 CONCURRENCY_FIX_SUMMARY.md
- ~~GOOGLE_SHEETS_SETUP.md~~ → 整合到 SETUP_GUIDE.md