# 《白房子》DC 企劃網站開發步驟

## 目前狀況 ✅
- Next.js 15.5.0 應用程式完成
- Google Sheets API 整合並測試成功
- Ant Design UI 組件庫集成
- 完整的企劃網站架構實現

## 專案結構
```
white-house-website/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── bulletin/      # 告示板 API (任務+公告)
│   │   │   ├── player-info/   # 玩家詳細資訊 API  
│   │   │   ├── players/       # 玩家列表 API
│   │   │   └── qa/            # 常見問題 API
│   │   ├── intro/             # 企劃介紹頁面
│   │   ├── rules/             # 核心規則頁面
│   │   ├── players/           # 遊戲名單頁面
│   │   ├── bulletin/          # 告示板頁面
│   │   ├── qa/                # 常見問題頁面
│   │   └── page.tsx           # 首頁
│   ├── components/
│   │   └── Navigation.js      # 導覽條組件
│   └── lib/
│       └── sheets.js          # Google Sheets API 工具
├── public/                    # 靜態檔案
├── credentials.json           # Google API 憑證 ✅
├── .env.local                 # 環境變數設定
├── STEP.md                    # 開發步驟文件
├── SPEC.md                    # 專案規格文件
└── README.md                  # 專案說明
```

## 完成階段

### 階段 1: 環境設定 ✅
- [x] Next.js 專案初始化
- [x] TypeScript 設定
- [x] Google Sheets API 依賴安裝
- [x] Ant Design UI 組件庫安裝
- [x] 基本檔案結構建立
- [x] .gitignore 更新 (排除 credentials.json)
- [x] 環境變數設定 (.env.local)

### 階段 2: API 開發 ✅
- [x] Google Sheets API 憑證設定
- [x] 更新 sheets.js 支援環境變數
- [x] 實作 /api/players API (玩家列表)
- [x] 實作 /api/player-info API (密碼驗證)
- [x] 實作 /api/bulletin API (任務+公告)
- [x] 實作 /api/qa API (常見問題)
- [x] API 錯誤處理與測試資料備援

### 階段 3: 頁面開發 ✅
- [x] 導覽條組件 (Navigation.js)
- [x] 首頁重新設計 (白房子主題風格)
- [x] 企劃介紹頁面 (/intro) - 完整企劃大綱
- [x] 核心規則頁面 (/rules) - COC 擲骰系統
- [x] 遊戲名單頁面 (/players) - 玩家排名+密碼查詢
- [x] 告示板頁面 (/bulletin) - 任務與公告
- [x] 常見問題頁面 (/qa) - 搜尋功能
- [x] 響應式設計與美化

### 階段 4: 測試與部署 ✅
- [x] Google Sheets 連接測試
- [x] 所有 API 功能測試
- [x] 前端頁面功能測試
- [x] Vercel 部署設定
- [x] 環境變數配置

## Google Sheets 資料結構 (已確認運作)

### 名單工作表 (玩家資料)
- PlayerID | PublicName | Password | Score | Rank | Money | Items | Stats

### 任務工作表 (Quest 資料)  
- QuestID | Title | PublishDate | Content

### 公告工作表 (Announcement 資料)
- AnnounceID | Title | PublishDate | Content

### QA工作表 (常見問題)
- Q | A

## 技術特色

### 前端技術
- **Framework**: Next.js 15.5.0 (App Router)
- **UI Library**: Ant Design 5.27.1
- **Language**: TypeScript + JavaScript
- **Styling**: Ant Design + CSS-in-JS
- **Icons**: Ant Design Icons

### 後端技術
- **API**: Next.js API Routes (Serverless)
- **Database**: Google Sheets API v4
- **Authentication**: Google Service Account
- **Environment**: Vercel 部署

### 開發工具
- **Build Tool**: Turbopack
- **Linting**: ESLint 9
- **Package Manager**: npm

## 企劃整合功能

### 陣營系統
- 調查員 (10人) - 潛伏調查
- 神職人員 (10人) - 執行洗腦
- 孩子們 (25人) - 求生存

### 遊戲機制
- COC 擲骰判定系統
- 洗腦系統 (SAN 值機制)
- 密碼驗證查詢
- 即時資料同步

### 安全特色
- 環境變數管理
- 密碼驗證機制
- 錯誤處理與備援
- 安全的 API 設計

## 部署狀態
- **開發環境**: http://localhost:3000 ✅
- **生產環境**: Vercel 部署 ✅
- **資料同步**: Google Sheets 即時 ✅

## 下一步開發階段

### 🎯 第二期開發目標 (擴展計畫)

#### 階段 5: 登入與身份系統 (第1週)
- [ ] 實作玩家登入系統 (基於現有密碼驗證)
- [ ] 新增 session 管理
- [ ] 建立雙重身份邏輯 (Public_Faction + True_Faction)
- [ ] 新增登入保護的頁面路由

#### 階段 6: 玩家儀表板 (第2週) 
- [ ] 建立玩家儀表板首頁 (/dashboard)
- [ ] 實作角色資料頁面 (/dashboard/profile)
- [ ] 實作物品系統 (/dashboard/inventory)
- [ ] 實作任務系統整合 (/dashboard/quests)

#### 階段 7: CYOA互動事件系統 (第2-3週)
- [ ] 設計事件資料結構
- [ ] 建立事件頁面 (/dashboard/events)
- [ ] 實作選擇判定邏輯
- [ ] 實作結果處理與數值更新

#### 階段 8: Discord機器人整合 (第3-4週) 
- [ ] 開發基本Discord Bot
- [ ] 實作核心指令 (/status, /roll, /event)
- [ ] 建立Bot與網站API對接
- [ ] 實作即時事件通知廣播

### 📊 擴展後的Google Sheets結構
詳見下方「擴展資料結構」章節

## 擴展資料結構 (Google Sheets)

### 現有工作表 ✅
1. **名單工作表 (Players)** - 基礎玩家資料
2. **任務工作表 (Quests)** - 任務資料  
3. **公告工作表 (Announcements)** - 公告資料
4. **QA工作表 (FAQ)** - 常見問題

### 新增工作表 📝 
5. **Characters** - 詳細角色資料 (HP, SAN, 雙重身份等)
6. **Items** - 物品主資料庫
7. **Inventory** - 角色持有物品關聯表
8. **Events** - CYOA互動事件資料
9. **EventOptions** - 事件選項與條件
10. **EventOutcomes** - 事件結果與影響
11. **Notifications** - 系統通知資料

### 工作表詳細結構
詳見 `DATABASE_STRUCTURE.md` (待建立)