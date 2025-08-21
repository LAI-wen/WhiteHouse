# 《白房子》DC 企劃網站規格書

## 專案概述
《白房子》Discord 企劃官網 - 基於 Next.js 開發的沉浸式 TRPG 企劃資訊平台，整合 Google Sheets 作為資料來源，打造高效能、視覺沉浸、易於 GM 管理的邪教主題遊戲網站。

## 功能需求

### 1. 首頁 (Home Page)
- **路徑**: `/`
- **功能**: 
  - 網站首頁與導航
  - 最新公告摘要顯示
  - 重要資訊快速入口

### 2. 公告系統 (Bulletin System)  
- **路徑**: `/bulletin`
- **API端點**: `/api/bulletin`
- **功能**:
  - 顯示所有公告列表
  - 公告內容詳細顯示
  - 按日期排序
  - 公告分類篩選

### 3. 玩家管理 (Player Management)
- **路徑**: `/players` 
- **API端點**: `/api/players`, `/api/player-info`
- **功能**:
  - 玩家列表顯示
  - 玩家詳細資訊
  - 玩家狀態查詢
  - 玩家資料更新

### 4. 規則頁面 (Rules Page)
- **路徑**: `/rules`
- **功能**:
  - 遊戲規則說明
  - 規則條文顯示
  - 規則更新記錄

## 技術規格

### 前端框架
- **Next.js**: 15.5.0 (App Router)
- **React**: 19.1.0
- **TypeScript**: ^5
- **CSS**: CSS Modules

### 後端與資料
- **API**: Next.js API Routes
- **資料來源**: Google Sheets API v4
- **認證**: Google Service Account

### 開發工具
- **建置工具**: Turbopack
- **程式碼檢查**: ESLint 9
- **套件管理**: npm

## API 規格

### 1. 公告 API
```typescript
GET /api/bulletin
Response: {
  success: boolean;
  data: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    category?: string;
  }>;
}
```

### 2. 玩家列表 API
```typescript
GET /api/players
Response: {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    status: string;
    lastActive: string;
  }>;
}
```

### 3. 玩家詳細資訊 API
```typescript
GET /api/player-info?id={playerId}
Response: {
  success: boolean;
  data: {
    id: string;
    name: string;
    status: string;
    joinDate: string;
    level: number;
    points: number;
    // 其他玩家資訊
  };
}
```

## 資料結構 (Google Sheets)

### 公告試算表
| 欄位 | 類型 | 說明 |
|------|------|------|
| ID | string | 公告唯一識別碼 |
| Title | string | 公告標題 |
| Content | string | 公告內容 |
| Date | date | 發布日期 |
| Category | string | 公告分類 |
| Status | string | 狀態 (active/archived) |

### 玩家試算表
| 欄位 | 類型 | 說明 |
|------|------|------|
| ID | string | 玩家唯一識別碼 |
| Name | string | 玩家名稱 |
| Status | string | 玩家狀態 |
| JoinDate | date | 加入日期 |
| Level | number | 等級 |
| Points | number | 積分 |
| LastActive | date | 最後活動時間 |

## 安全性要求
- Google API 憑證檔案不可提交至版本控制
- API 端點需要適當的錯誤處理
- 輸入資料驗證與清理
- 適當的 CORS 設定

## 效能要求
- 首頁載入時間 < 3秒
- API 回應時間 < 2秒
- 支援 SSR 和 SSG
- 圖片優化與懶加載

## 相容性要求
- 支援現代瀏覽器 (Chrome, Firefox, Safari, Edge)
- 響應式設計，支援手機、平板、桌面
- 最低支援 Next.js 15+

## 部署環境
- **開發**: localhost:3000
- **生產**: 待定
- **環境變數**: 
  - `GOOGLE_SHEETS_CREDENTIALS`
  - `SPREADSHEET_ID`
  
## 檔案結構
```
src/
├── app/
│   ├── (pages)/
│   │   ├── bulletin/
│   │   ├── players/
│   │   └── rules/
│   ├── api/
│   │   ├── bulletin/
│   │   ├── players/
│   │   └── player-info/
│   ├── components/     # 共用元件
│   ├── types/         # TypeScript 類型定義
│   └── utils/         # 工具函數
├── lib/
│   └── sheets.js      # Google Sheets API 封裝
└── public/            # 靜態資源
```

## 測試策略
- 單元測試: API 函數
- 整合測試: Google Sheets 連接
- E2E 測試: 主要頁面功能
- 效能測試: 頁面載入速度