# 白房子網站 - 完整設置指南

## 🚀 快速開始

### 1. 環境準備
```bash
npm install
cp .env.example .env.local
```

### 2. Google Sheets API 設定
1. 在 [Google Cloud Console](https://console.cloud.google.com/) 創建項目
2. 啟用 Google Sheets API
3. 創建服務帳號並下載 `credentials.json`
4. 將 `credentials.json` 放到專案根目錄

### 3. 建立 Google Sheets 資料庫

#### 方法一：自動設置 (推薦) 🚀
```bash
# 設定環境變數
export SPREADSHEET_ID=your_spreadsheet_id_here

# 執行自動設置腳本
npm run setup-sheets
```

#### 方法二：手動建立
複製 [這個範本](https://docs.google.com/spreadsheets/d/YOUR_TEMPLATE_ID) 或手動建立以下工作表：

---

## 📊 Google Sheets 資料表結構

### 現有工作表 (保持不變)

#### 1. Players
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: PlayerID | 玩家ID | P001 |
| B: PublicName | 公開名稱 | 小明 |
| C: Password | 密碼 | abc123 |
| D: Score | 積分 | 1500 |
| E: Rank | 排名 | 3 |
| F: Money | 遊戲幣 | 50 |
| G: Items | 物品 | 鑰匙,藥水 |
| H: Stats | 數值 | HP:100,SAN:80 |

#### 2. Quests
| 欄位 | 說明 |
|------|------|
| A: QuestID | 任務ID |
| B: Title | 標題 |
| C: Description | 描述 |
| D: Reward | 獎勵 |
| E: Status | 狀態 |

#### 3. Announcements
| 欄位 | 說明 |
|------|------|
| A: Date | 日期 |
| B: Title | 標題 |
| C: Content | 內容 |
| D: Priority | 優先級 |

#### 4. FAQ
| 欄位 | 說明 |
|------|------|
| A: Question | 問題 |
| B: Answer | 答案 |
| C: Category | 分類 |

---

### 新增工作表 (需要建立)

#### 5. Characters
**用途**: 詳細角色資料
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: Character_ID | 角色ID | P001 |
| B: Player_Discord_ID | Discord ID | 123456789 |
| C: Character_Name | 角色姓名 | 艾莉絲 |
| D: Username | 帳號 | alice2024 |
| E: Password | 密碼 | mypassword |
| F: Public_Faction | 公開身份 | 孩童 |
| G: True_Faction | 真實身份 | 調查員 |
| H: HP | 生命值 | 95 |
| I: Max_HP | 最大生命值 | 100 |
| J: SAN | 理智值 | 75 |
| K: Max_SAN | 最大理智值 | 100 |
| L: AP | 行動點 | 10 |
| M: BP | 提問點 | 3 |
| N: STR | 力量 | 65 |
| O: CON | 體質 | 70 |
| P: DEX | 敏捷 | 60 |
| Q: APP | 外貌 | 75 |
| R: INT | 智力 | 80 |
| S: LUCK | 幸運 | 50 |
| T: Good_Boy_Points | 好寶寶點數 | 15 |
| U: Performance_Points | 神職績效點數 | 0 |
| V: Background_Story | 背景故事 | 來自... |

#### 6. Items
**用途**: 物品主資料庫
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: Item_ID | 物品ID | ITM-001 |
| B: Item_Name | 物品名稱 | 生鏽的鑰匙 |
| C: Item_Description | 描述 | 一把古老的鑰匙... |
| D: Is_Clue | 是否為線索 | TRUE |
| E: Category | 分類 | 關鍵物品 |
| F: Image_URL | 圖片網址 | https://... |
| G: Special_Effect | 特殊效果 | 可開啟地下室門鎖 |

#### 7. Inventory
**用途**: 角色持有物品
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: Inventory_ID | 清單ID | INV-001 |
| B: Owner_Character_ID | 持有者ID | P001 |
| C: Item_ID | 物品ID | ITM-001 |
| D: Quantity | 數量 | 1 |
| E: Obtained_Date | 獲得時間 | 2024-01-15 10:30 |
| F: Obtained_Method | 獲得方式 | 事件:圖書室探索 |

#### 8. Events
**用途**: 戰役事件內容
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: Step_ID | 步驟ID | LIB-001 |
| B: Campaign_ID | 戰役ID | LIBRARY_MYSTERY |
| C: Event_Name | 事件名稱 | 深夜的圖書室 |
| D: Step_Title | 步驟標題 | 初入圖書室 |
| E: Step_Description | 步驟描述 | 你悄悄潛入深夜的圖書室... |
| F: Image_URL | 背景圖片 | https://... |
| G: Is_Starting_Step | 是否起始步驟 | TRUE |

#### 9. EventOptions ⚠️ **更新**
**用途**: 事件選項模板 (不存個人狀態)
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: Option_ID | 選項ID | LIB-001-A |
| B: Source_Step_ID | 來源步驟ID | LIB-001 |
| C: Target_Step_ID | 目標步驟ID | LIB-002 |
| D: Option_Text | 選項文字 | A. 檢查附近的書架 |
| E: Req_Stat_Name | 需求屬性 | INT |
| F: Req_Stat_Operator | 判定符號 | > |
| G: Req_Stat_Value | 需求數值 | 12 |
| H: Req_Item_ID | 需求物品ID | ITM-007 |
| I: Requirement_Text | 條件顯示 | [需要 INT > 12] |
| **J: Max_Uses_Per_Player** | **每人最大使用次數** | **1** |
| **K: Option_Category** | **選項分類** | **exploration** |

#### 10. EventOutcomes
**用途**: 事件結果
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: Outcome_ID | 結果ID | OUT-001 |
| B: Trigger_Option_ID | 觸發選項ID | LIB-001-A |
| C: Outcome_Type | 結果類型 | CHANGE_STAT |
| D: Outcome_Target | 影響目標 | SAN |
| E: Outcome_Value | 數值變化 | -5 |
| F: Outcome_Description | 結果描述 | 你發現了令人不安的內容 |
| G: Discord_Message | Discord廣播 | {player} 選擇檢查書架，SAN -5 |

---

### 🆕 新增工作表 (併發控制)

#### 11. PlayerChoiceHistory ⭐ **重要**
**用途**: 記錄玩家選擇歷史，解決併發衝突
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: Choice_ID | 選擇ID | CHC-P001-20240115-001 |
| B: Character_ID | 角色ID | P001 |
| C: Campaign_ID | 戰役ID | LIBRARY_MYSTERY |
| D: Session_ID | 遊戲Session ID | SES-P001-20240115 |
| E: Step_ID | 事件步驟ID | LIB-001 |
| F: Option_ID | 選擇的選項ID | LIB-001-A |
| G: Choice_Result | 選擇結果摘要 | 發現古書，SAN-5 |
| H: Chosen_At | 選擇時間 | 2024-01-15 14:30:25 |
| I: Previous_Choice_ID | 前一個選擇ID | CHC-P001-20240115-000 |

#### 12. CampaignProgress ⚠️ **更新結構**
**用途**: 戰役進度追蹤，支援併發控制
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: Progress_ID | 進度ID | PRG-P001-LIBRARY |
| B: Character_ID | 角色ID | P001 |
| C: Campaign_ID | 戰役ID | LIBRARY_MYSTERY |
| **D: Session_ID** | **Session ID** | **SES-P001-20240115** |
| E: Current_Step_ID | 當前步驟ID | LIB-003 |
| **F: Started_At** | **開始時間** | **2024-01-15 14:00:00** |
| **G: Last_Updated** | **最後更新時間** | **2024-01-15 14:30:25** |
| **H: Version** | **版本號 (樂觀鎖定)** | **3** |
| **I: Status** | **戰役狀態** | **IN_PROGRESS** |
| **J: Completion_Rate** | **完成百分比** | **0.6** |

#### 13. Notifications
**用途**: 系統通知
| 欄位 | 說明 | 範例 |
|------|------|------|
| A: Notification_ID | 通知ID | NOT-001 |
| B: Target_Type | 目標類型 | PLAYER/ALL/FACTION |
| C: Target_Value | 目標值 | P001 或 調查員 |
| D: Message_Title | 訊息標題 | 新任務發布 |
| E: Message_Content | 訊息內容 | 你收到了新的調查任務... |
| F: Message_Type | 訊息類型 | QUEST/EVENT/SYSTEM |
| G: Created_Date | 創建時間 | 2024-01-15 14:30 |
| H: Is_Read | 是否已讀 | FALSE |
| I: Priority | 優先級 | HIGH/MEDIUM/LOW |

---

## 🔧 環境變數設定

在 `.env.local` 中設定：

```env
# Google Sheets
SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_CREDENTIALS=path_to_credentials_json

# 或者直接貼上 credentials 內容 (生產環境建議)
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"..."}

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
```

---

## 🧪 測試步驟

### 1. 基本功能測試
```bash
npm run dev
```
開啟 http://localhost:3000 測試登入

### 2. 併發衝突測試
1. 開啟兩個瀏覽器視窗
2. 用不同角色登入
3. 同時開始同一個戰役
4. 檢查選項和進度是否獨立

### 3. 重複遊戲測試
1. 完成一個戰役
2. 重新開始同一個戰役
3. 檢查是否生成新的 Session ID

---

## 🚨 重要提醒

### ✅ 必須完成的設定
- [ ] 建立所有新增工作表
- [ ] 更新 EventOptions 和 CampaignProgress 結構
- [ ] 設定 Google API 憑證
- [ ] 測試併發功能

### ⚠️ 資料遷移
如果你已有舊的 CampaignProgress 資料：
1. 備份現有資料
2. 新增 D-J 欄 (Session_ID 到 Completion_Rate)
3. 為舊記錄填入預設值

---

## 📞 支援

如遇問題，檢查：
1. Google Sheets API 配額
2. credentials.json 路徑
3. 工作表名稱和欄位是否正確
4. SPREADSHEET_ID 是否正確