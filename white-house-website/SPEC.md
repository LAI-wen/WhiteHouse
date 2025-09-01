# 《白房子》DC 企劃網站規格書 v2.0

## 專案概述
《白房子》Discord 企劃官網 - 基於 Next.js 開發的沉浸式 TRPG 企劃資訊平台。整合 Google Sheets 作為資料來源，支援雙重身份系統、CYOA互動事件、玩家儀表板與 Discord 機器人整合的完整遊戲生態系統。

## 🎯 核心特色
- **雙層網站結構**: 公開官網 + 登入後儀表板
- **雙重身份系統**: 支援 公開身份/真實身份 的複雜角色扮演
- **CYOA互動事件**: Choose Your Own Adventure 風格的分支劇情
- **即時資料同步**: Google Sheets API 驅動的動態資料
- **Discord整合**: 機器人廣播與網站雙向互動

## 功能需求

### 🌐 第一層：公開網站 (Public Site)
#### 1. 首頁 (Home Page)
- **路徑**: `/`
- **功能**: 
  - 「白屋醫教育成兒童中心」官方形象
  - 最新消息展示
  - 登入入口
  - 企劃說明連結

#### 2. 關於我們 (About Us)
- **路徑**: `/about`
- **功能**:
  - 機構介紹與歷史
  - 創辦人致詞
  - 合作夥伴資訊

#### 3. 治療介紹 (Treatment Info)
- **路徑**: `/treatment`
- **功能**:
  - 《XX症》介紹
  - 白屋療法說明
  - FAQ 常見問答

#### 4. 環境介紹 (Facilities)
- **路徑**: `/facilities`
- **功能**:
  - 醫療設施展示
  - 住宿環境介紹
  - 教學區域說明

#### 5. 加入我們 (Join Us)
- **路徑**: `/join`
- **功能**:
  - 招募資訊
  - 申請表單
  - 社群公約

#### 6. 資源中心 (Resources)
- **路徑**: `/resources`
- **功能**:
  - 官方文件下載
  - 規章制度查閱
  - 政策公告

### 🔐 第二層：玩家儀表板 (Player Dashboard)
#### 7. 登入系統 (Authentication)
- **路徑**: `/login`
- **API端點**: `/api/auth/login`, `/api/auth/logout`
- **功能**:
  - 帳號密碼驗證
  - Session 管理
  - 雙重身份識別

#### 8. 儀表板總覽 (Dashboard Overview)
- **路徑**: `/dashboard`
- **功能**:
  - 角色狀態概覽 (HP, SAN, AP, BP)
  - 陣營專屬模組 (好寶寶集點/神職績效/調查筆記)
  - 任務快速預覽
  - 最新通知

#### 9. 個人檔案 (Profile)
- **路徑**: `/dashboard/profile`
- **API端點**: `/api/dashboard/profile`
- **功能**:
  - 完整角色卡顯示
  - 角色背景故事
  - 詳細數值資料

#### 10. 持有物品 (Inventory)
- **路徑**: `/dashboard/inventory`
- **API端點**: `/api/dashboard/inventory`
- **功能**:
  - 物品清單顯示
  - 一般物品/關鍵物品分類
  - 線索物品特殊標記 (調查員限定)

#### 11. 任務日誌 (Quest Log)
- **路徑**: `/dashboard/quests`
- **API端點**: `/api/dashboard/quests`
- **功能**:
  - 主線/支線任務分類
  - 任務進度追蹤
  - 任務詳情展開

#### 12. 互動事件 (Events)
- **路徑**: `/dashboard/events/[eventId]`
- **API端點**: `/api/events/[eventId]`, `/api/events/choose`
- **功能**:
  - CYOA 分支劇情展示
  - 條件判定 (屬性/物品需求)
  - 選擇結果處理
  - 即時數值更新

#### 13. 個人手冊 (Handbook)
- **路徑**: `/dashboard/handbook`
- **功能**:
  - 身份對應文件查閱
  - 內部規章制度
  - 調查員秘密資料 (限定身份)

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

### 認證相關 API
```typescript
// 登入驗證
POST /api/auth/login
Body: { username: string; password: string; }
Response: {
  success: boolean;
  data: {
    characterId: string;
    characterName: string;
    publicFaction: string;
    trueFaction: string;
    sessionToken: string;
  };
}

// 登出
POST /api/auth/logout
Response: { success: boolean; }
```

### 儀表板 API
```typescript
// 角色詳細資料
GET /api/dashboard/profile
Headers: { Authorization: Bearer <token> }
Response: {
  success: boolean;
  data: {
    characterId: string;
    characterName: string;
    hp: number; maxHp: number;
    san: number; maxSan: number;
    stats: { STR: number; CON: number; ... };
    backgroundStory: string;
    // ...
  };
}

// 物品清單
GET /api/dashboard/inventory
Response: {
  success: boolean;
  data: Array<{
    itemId: string;
    itemName: string;
    description: string;
    quantity: number;
    isClue: boolean;
    category: string;
  }>;
}

// 任務列表
GET /api/dashboard/quests
Response: {
  success: boolean;
  data: {
    mainQuests: Array<Quest>;
    sideQuests: Array<Quest>;
  };
}
```

### 事件系統 API
```typescript
// 取得事件內容
GET /api/events/[eventId]
Response: {
  success: boolean;
  data: {
    stepId: string;
    eventName: string;
    description: string;
    imageUrl?: string;
    options: Array<{
      optionId: string;
      text: string;
      isAvailable: boolean;
      requirementText?: string;
    }>;
  };
}

// 處理玩家選擇
POST /api/events/choose
Body: { optionId: string; characterId: string; }
Response: {
  success: boolean;
  data: {
    nextStepId: string;
    outcomes: Array<{
      type: string;
      description: string;
      valueChange?: number;
    }>;
    updatedStats: CharacterStats;
  };
}
```

## 資料結構 (Google Sheets)

詳細資料庫結構請參考 `DATABASE_STRUCTURE.md`

### 核心工作表概覽
1. **Characters** - 角色詳細資料 (雙重身份、HP/SAN、屬性值)
2. **Items** - 物品主資料庫 (物品屬性、線索標記)
3. **Inventory** - 角色持有物品關聯
4. **Events** - CYOA事件步驟內容
5. **EventOptions** - 事件選項與條件判定
6. **EventOutcomes** - 事件結果與數值影響
7. **Notifications** - 系統通知管理

### 雙重身份邏輯
```
Characters 表格:
- Public_Faction: 公開身份 (孩童/神職人員)
- True_Faction: 真實身份 (孩童/神職人員/調查員)

權限邏輯:
- 一般功能: 基於 Public_Faction
- 特殊功能: 基於 True_Faction
- 調查員: 額外線索查看權限
```

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
- **生產**: Vercel 部署
- **環境變數**: 
  - `GOOGLE_SHEETS_CREDENTIALS` - Google API 憑證
  - `SPREADSHEET_ID` - Google Sheets ID
  - `JWT_SECRET` - JWT Token 加密密鑰
  - `NEXT_PUBLIC_SITE_URL` - 網站公開網址
  
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