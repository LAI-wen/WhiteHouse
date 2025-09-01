# 《白房子》DC 企劃網站

基於 Next.js 開發的沉浸式 TRPG 企劃資訊平台，整合 Google Sheets 作為資料來源，打造高效能、視覺沉浸、易於 GM 管理的邪教主題遊戲網站。

## 🎯 專案概述

《白房子》Discord 企劃官網 - 自稱為「選民學院」，實際為真理教殘黨暗中運營的洗腦培育中心。45名玩家分為三個陣營進行多線劇情 TRPG 遊戲，包含心理驚悚、邪教洗腦、重口味等成人內容。

### 陣營系統
- **調查員 (10人)** - 潛伏調查邪教真相
- **神職人員 (10人)** - 執行洗腦與管控任務  
- **孩子們 (25人)** - 求生存的受害者

## ✨ 主要功能

### 🏠 首頁 (`/`)
- 企劃介紹與快速導航
- 陣營統計數據展示
- 18+ 成人內容警告
- 響應式設計與暗色主題

### 📖 企劃介紹 (`/intro`)
- 完整企劃背景世界觀
- 三陣營詳細說明
- 核心玩法特色介紹
- 報名相關資訊

### 📋 核心規則 (`/rules`)
- COC 擲骰判定系統
- HP/SAN/AP/BP 數值系統
- 洗腦系統與懲罰機制
- 六大屬性判定表

### 👥 遊戲名單 (`/players`)
- 玩家排名與積分展示
- 密碼驗證查詢系統
- 玩家詳細資料顯示
- 即時 Google Sheets 同步

### 📢 告示板 (`/bulletin`)
- 最新任務與公告發布
- 按日期排序顯示
- 任務與公告分類
- 即時資料更新

### ❓ 常見問題 (`/qa`)
- 搜尋功能問題解答
- 遊戲相關疑問整理
- 動態資料載入

## 🛠 技術架構

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

## 🚀 快速開始

### 環境需求
- Node.js 18.0+
- npm 或 yarn
- Google Cloud Service Account

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone <repository-url>
   cd white-house-website
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **設定環境變數**
   
   建立 `.env.local` 檔案：
   ```env
   GOOGLE_SHEETS_CREDENTIALS={"type":"service_account",...}
   SPREADSHEET_ID=your_google_sheets_id
   ```

4. **設定 Google Sheets API**
   
   - 建立 Google Cloud 專案
   - 啟用 Google Sheets API
   - 建立 Service Account 並下載 credentials.json
   - 將 credentials.json 內容設為環境變數
   - 與 Google Sheets 分享 Service Account Email

5. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   
   開啟 [http://localhost:3000](http://localhost:3000)

### Google Sheets 資料結構

#### 名單工作表 (玩家資料)
| 欄位 | 說明 |
|------|------|
| PlayerID | 玩家唯一識別碼 |
| PublicName | 玩家顯示名稱 |
| Password | 密碼驗證 |
| Score | 積分 |
| Rank | 排名 |
| Money | 金錢 |
| Items | 道具列表 |
| Stats | 能力值 |

#### 任務工作表 (Quest 資料)
| 欄位 | 說明 |
|------|------|
| QuestID | 任務識別碼 |
| Title | 任務標題 |
| PublishDate | 發布日期 |
| Content | 任務內容 |

#### 公告工作表 (Announcement 資料)
| 欄位 | 說明 |
|------|------|
| AnnounceID | 公告識別碼 |
| Title | 公告標題 |
| PublishDate | 發布日期 |
| Content | 公告內容 |

#### QA工作表 (常見問題)
| 欄位 | 說明 |
|------|------|
| Q | 問題 |
| A | 答案 |

## 📁 專案結構

```
src/
├── app/
│   ├── api/                 # API 路由
│   │   ├── bulletin/        # 告示板 API
│   │   ├── players/         # 玩家列表 API
│   │   ├── player-info/     # 玩家詳細資訊 API
│   │   └── qa/              # 常見問題 API
│   ├── intro/               # 企劃介紹頁面
│   ├── rules/               # 核心規則頁面
│   ├── players/             # 遊戲名單頁面
│   ├── bulletin/            # 告示板頁面
│   ├── qa/                  # 常見問題頁面
│   ├── page.tsx             # 首頁
│   └── layout.js            # 全域佈局
├── components/              # 共用元件
│   └── Navigation.js        # 導覽條組件
└── lib/
    └── sheets.js            # Google Sheets API 封裝
```

## 🌐 API 端點

### 公告 API
```typescript
GET /api/bulletin
Response: {
  success: boolean;
  data: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    type: 'quest' | 'announcement';
  }>;
}
```

### 玩家列表 API
```typescript
GET /api/players
Response: {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    score: number;
    rank: number;
  }>;
}
```

### 玩家詳細資訊 API
```typescript
GET /api/player-info?id={playerId}&password={password}
Response: {
  success: boolean;
  data: {
    id: string;
    name: string;
    score: number;
    money: number;
    items: string[];
    stats: string;
  };
}
```

### 常見問題 API
```typescript
GET /api/qa
Response: {
  success: boolean;
  data: Array<{
    question: string;
    answer: string;
  }>;
}
```

## 🔧 部署說明

### Vercel 部署
1. 推送至 GitHub
2. 連接 Vercel 帳戶
3. 設定環境變數：
   - `GOOGLE_SHEETS_CREDENTIALS`
   - `SPREADSHEET_ID`
4. 自動部署

### 環境變數設定
- **開發環境**: `.env.local`
- **生產環境**: Vercel Dashboard 環境變數

## 🛡 安全性

- Google API 憑證檔案已加入 `.gitignore`
- 密碼驗證機制保護玩家資料
- API 端點錯誤處理與資料驗證
- 適當的 CORS 設定

## 📊 效能特色

- 首頁載入時間 < 3秒
- API 回應時間 < 2秒
- 支援 SSR 和 SSG
- 響應式設計，支援手機、平板、桌面
- 圖片優化與懶加載

## 🎮 企劃特色

### 遊戲機制
- COC 擲骰判定系統
- 洗腦系統 (SAN 值機制)
- 密碼驗證查詢
- 即時資料同步

### 陣營對抗
- 多線劇情互動
- 私人頻道分離
- 日常儀式與規則維持
- 地圖探索系統

## 📝 開發狀態

### ✅ 已完成功能
- [x] Next.js 專案環境設定
- [x] Google Sheets API 整合
- [x] Ant Design UI 組件庫
- [x] 完整頁面架構實現
- [x] API 端點開發
- [x] 響應式設計
- [x] Vercel 部署設定

### ✅ 最新更新 (2025-09-01)
- [x] **修正多人遊戲併發衝突問題** - 實現併發安全的戰役系統
- [x] **新增 Session 管理** - 支援玩家重複遊戲
- [x] **樂觀鎖定機制** - 防止資料競態條件
- [x] **個人化選擇歷史** - 玩家選擇不再互相影響

### 🚀 未來優化
- [ ] 前端快取和效能優化
- [ ] 實作即時通知功能
- [ ] 加入更多互動元素
- [ ] 優化手機端體驗
- [ ] 新增管理員後台功能

## 📄 授權

《白房子》DC 企劃 © 2025

Built with Next.js + Ant Design + Google Sheets API

---

**⚠️ 重要提醒**
本企劃包含心理驚悚、邪教洗腦、重口味等成人內容，適合年滿 18 歲且心理承受能力良好的玩家參與。