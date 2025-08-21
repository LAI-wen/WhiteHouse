# White House Website 開發步驟

## 目前狀況
- Next.js 應用程式已建立 (版本 15.5.0)
- Google Sheets API 整合基礎設定完成
- TypeScript 設定完成

## 專案結構
```
white-house-website/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── bulletin/      # 公告 API
│   │   │   ├── player-info/   # 玩家資訊 API  
│   │   │   └── players/       # 玩家列表 API
│   │   ├── bulletin/          # 公告頁面
│   │   ├── players/           # 玩家頁面
│   │   ├── rules/             # 規則頁面
│   │   └── page.tsx           # 首頁
│   └── lib/
│       └── sheets.js          # Google Sheets API 工具
├── public/                    # 靜態檔案
└── credentials.json           # Google API 憑證 (需設定)
```

## 開發步驟

### 階段 1: 環境設定 ✅
- [x] Next.js 專案初始化
- [x] TypeScript 設定
- [x] Google Sheets API 依賴安裝
- [x] 基本檔案結構建立
- [x] .gitignore 更新 (排除 credentials.json)

### 階段 2: API 設定與測試 🚧
- [ ] 設定 Google Sheets API 憑證
- [ ] 更新 sheets.js 中的 SPREADSHEET_ID
- [ ] 測試 API 連接
- [ ] 建立基本的資料抓取功能

### 階段 3: 頁面開發 ⏳
- [ ] 首頁設計與實作
- [ ] 公告頁面開發
- [ ] 玩家頁面開發  
- [ ] 規則頁面開發
- [ ] 響應式設計調整

### 階段 4: 測試與部署 ⏳
- [ ] 功能測試
- [ ] 效能優化
- [ ] 部署設定
- [ ] 上線測試

## 當前需要處理的項目
1. 設定 Google Sheets API 憑證檔案
2. 更新 sheets.js 中的試算表 ID
3. 測試 API 連接功能
4. 開始開發各頁面內容

## 技術棧
- Framework: Next.js 15.5.0
- Language: TypeScript  
- React: 19.1.0
- API: Google Sheets API v4
- 樣式: CSS Modules
- 工具: ESLint, Turbopack