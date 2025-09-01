# 《白房子》Google Sheets 資料庫結構

## 概述
本文件定義了完整的 Google Sheets 資料庫結構，整合現有系統與新增的玩家儀表板、CYOA事件系統需求。

## 🗄️ 工作表總覽

### 現有工作表 (已實作) ✅
1. **Players** - 基礎玩家列表
2. **Quests** - 任務資料
3. **Announcements** - 公告資料  
4. **FAQ** - 常見問題

### 新增工作表 (待建立) 📝
5. **Characters** - 詳細角色資料
6. **Items** - 物品主資料庫
7. **Inventory** - 角色持有物品
8. **Events** - CYOA事件步驟
9. **EventOptions** - 事件選項與條件 (僅模板，不存狀態)
10. **EventOutcomes** - 事件結果
11. **PlayerChoiceHistory** - 玩家選擇歷史 (解決併發問題)
12. **CampaignProgress** - 戰役進度追蹤
13. **Notifications** - 系統通知

---

## 📋 詳細工作表結構

### 1. Players (現有 - 需擴展) ✅
**用途**: 基礎玩家列表與公開資料
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| PlayerID | Text | 玩家唯一ID | P001 |
| PublicName | Text | 公開顯示名稱 | 小明 |
| Password | Text | 登入密碼 | abc123 |
| Score | Number | 公開積分 | 1500 |
| Rank | Number | 排名 | 3 |
| Money | Number | 遊戲幣 | 50 |
| Items | Text | 簡化物品列表 | 鑰匙,藥水 |
| Stats | Text | 簡化數值 | HP:100,SAN:80 |

### 2. Characters (新增) 📝
**用途**: 詳細角色資料，支援雙重身份與遊戲數值
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| Character_ID | Text | 角色唯一ID (對應PlayerID) | P001 |
| Player_Discord_ID | Text | Discord用戶ID | 123456789 |
| Character_Name | Text | 角色姓名 | 艾莉絲 |
| Username | Text | 登入帳號 | alice2024 |
| Password | Text | 登入密碼 | mypassword |
| Public_Faction | Text | 公開身份 | 孩童 |
| True_Faction | Text | 真實身份 | 調查員 |
| HP | Number | 目前生命值 | 95 |
| Max_HP | Number | 最大生命值 | 100 |
| SAN | Number | 目前理智值 | 75 |
| Max_SAN | Number | 最大理智值 | 100 |
| AP | Number | 行動點 | 10 |
| BP | Number | 提問點 | 3 |
| STR | Number | 力量 | 65 |
| CON | Number | 體質 | 70 |
| DEX | Number | 敏捷 | 60 |
| APP | Number | 外貌 | 75 |
| INT | Number | 智力 | 80 |
| LUCK | Number | 幸運 | 50 |
| Good_Boy_Points | Number | 好寶寶點數 | 15 |
| Performance_Points | Number | 神職績效點數 | 0 |
| Background_Story | Text | 角色背景 | 來自... |
| Personal_Notes | Text | 個人筆記 | 調查發現... |
| Last_Active | DateTime | 最後活動時間 | 2024-01-15 14:30 |

### 3. Items (新增) 📝  
**用途**: 物品主資料庫，定義所有物品屬性
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| Item_ID | Text | 物品唯一ID | ITM-001 |
| Item_Name | Text | 物品名稱 | 生鏽的鑰匙 |
| Item_Description | Text | 物品詳細描述 | 一把古老的鑰匙，上面刻著神秘符號 |
| Is_Clue | Boolean | 是否為線索物品 | TRUE |
| Category | Text | 物品分類 | 關鍵物品 |
| Image_URL | Text | 物品圖片網址 | https://... |
| Special_Effect | Text | 特殊效果描述 | 可開啟地下室門鎖 |

### 4. Inventory (新增) 📝
**用途**: 記錄角色持有的物品
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| Owner_Character_ID | Text | 持有者角色ID | P001 |
| Item_ID | Text | 物品ID | ITM-001 |
| Quantity | Number | 數量 | 1 |
| Obtained_Date | DateTime | 獲得時間 | 2024-01-15 10:30 |
| Obtained_Method | Text | 獲得方式 | 事件:圖書室探索 |

### 5. Events (新增) 📝
**用途**: CYOA互動事件的步驟內容
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| Step_ID | Text | 事件步驟ID | LIB-001 |
| Event_Name | Text | 事件總名稱 | 深夜的圖書室 |
| Step_Title | Text | 步驟標題 | 初入圖書室 |
| Step_Description | Text | 步驟詳細描述 | 你悄悄潛入深夜的圖書室... |
| Image_URL | Text | 背景圖片 | https://... |
| Is_Starting_Point | Boolean | 是否為起始點 | TRUE |
| Created_Date | DateTime | 創建時間 | 2024-01-15 |

### 6. EventOptions (新增) 📝
**用途**: 事件選項模板 (不存個人狀態，避免併發衝突)
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| Option_ID | Text | 選項唯一ID | LIB-001-A |
| Source_Step_ID | Text | 來源步驟ID | LIB-001 |
| Target_Step_ID | Text | 目標步驟ID | LIB-002 |
| Option_Text | Text | 選項文字 | A. 檢查附近的書架 |
| Req_Stat_Name | Text | 需求屬性名稱 | INT |
| Req_Stat_Operator | Text | 判定符號 | > |
| Req_Stat_Value | Number | 需求數值 | 12 |
| Req_Item_ID | Text | 需求物品ID | ITM-007 |
| Requirement_Text | Text | 條件顯示文字 | [需要 INT > 12] |
| Max_Uses_Per_Player | Number | 每人最大使用次數 | 1 |
| Option_Category | Text | 選項分類 | exploration |

### 7. EventOutcomes (新增) 📝
**用途**: 事件選擇後的結果與影響
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| Outcome_ID | Text | 結果唯一ID | OUT-001 |
| Trigger_Option_ID | Text | 觸發選項ID | LIB-001-A |
| Outcome_Type | Text | 結果類型 | CHANGE_STAT |
| Outcome_Target | Text | 影響目標 | SAN |
| Outcome_Value | Number | 數值變化 | -5 |
| Outcome_Description | Text | 結果描述 | 你發現了令人不安的內容 |
| Discord_Message | Text | Discord廣播訊息 | {player} 選擇檢查書架，SAN -5 |

### 8. PlayerChoiceHistory (新增) 📝
**用途**: 玩家選擇歷史，解決併發衝突問題
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| Choice_ID | Text | 選擇唯一ID (自動生成) | CHC-P001-20240115-001 |
| Character_ID | Text | 角色ID | P001 |
| Campaign_ID | Text | 戰役ID | LIBRARY_MYSTERY |
| Session_ID | Text | 遊戲Session ID | SES-P001-20240115 |
| Step_ID | Text | 事件步驟ID | LIB-001 |
| Option_ID | Text | 選擇的選項ID | LIB-001-A |
| Choice_Result | Text | 選擇結果摘要 | 發現古書，SAN-5 |
| Chosen_At | DateTime | 選擇時間 | 2024-01-15 14:30:25 |
| Previous_Choice_ID | Text | 前一個選擇ID (追蹤路徑) | CHC-P001-20240115-000 |

### 9. CampaignProgress (新增) 📝
**用途**: 戰役進度追蹤，支援併發控制
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| Progress_ID | Text | 進度唯一ID | PRG-P001-LIBRARY |
| Character_ID | Text | 角色ID | P001 |
| Campaign_ID | Text | 戰役ID | LIBRARY_MYSTERY |
| Session_ID | Text | 當前Session ID | SES-P001-20240115 |
| Current_Step_ID | Text | 當前步驟ID | LIB-003 |
| Started_At | DateTime | 開始時間 | 2024-01-15 14:00:00 |
| Last_Updated | DateTime | 最後更新時間 | 2024-01-15 14:30:25 |
| Version | Number | 版本號 (樂觀鎖定) | 3 |
| Status | Text | 戰役狀態 | IN_PROGRESS |
| Completion_Rate | Number | 完成百分比 | 0.6 |

### 10. Notifications (新增) 📝
**用途**: 系統通知與訊息管理
| 欄位名 | 資料類型 | 說明 | 範例 |
|--------|----------|------|------|
| Notification_ID | Text | 通知唯一ID | NOT-001 |
| Target_Type | Text | 目標類型 | PLAYER/ALL/FACTION |
| Target_Value | Text | 目標值 | P001 或 調查員 |
| Message_Title | Text | 訊息標題 | 新任務發布 |
| Message_Content | Text | 訊息內容 | 你收到了新的調查任務... |
| Message_Type | Text | 訊息類型 | QUEST/EVENT/SYSTEM |
| Created_Date | DateTime | 創建時間 | 2024-01-15 14:30 |
| Is_Read | Boolean | 是否已讀 | FALSE |
| Priority | Text | 優先級 | HIGH/MEDIUM/LOW |

---

## 🔗 資料表關聯

### 主要關聯邏輯
```
Players (基礎資料)
    ↓ PlayerID = Character_ID
Characters (詳細資料)
    ↓ Character_ID = Owner_Character_ID  
Inventory (持有物品)
    ↓ Item_ID
Items (物品詳情)

Events (事件模板)
    ↓ Step_ID = Source_Step_ID
EventOptions (選項模板，不存狀態)
    ↓ Option_ID = Trigger_Option_ID
EventOutcomes (結果模板)

PlayerChoiceHistory (個人選擇記錄)
    ↓ Character_ID, Campaign_ID, Session_ID
CampaignProgress (個人進度)
```

### 併發安全查詢範例
1. **取得玩家可用選項**: 
   ```
   SELECT * FROM EventOptions o 
   WHERE o.Source_Step_ID = ? 
   AND (o.Max_Uses_Per_Player IS NULL 
        OR (SELECT COUNT(*) FROM PlayerChoiceHistory h 
            WHERE h.Character_ID = ? 
            AND h.Option_ID = o.Option_ID 
            AND h.Session_ID = ?) < o.Max_Uses_Per_Player)
   ```

2. **記錄玩家選擇** (事務處理):
   ```
   BEGIN TRANSACTION
   INSERT INTO PlayerChoiceHistory (Character_ID, Campaign_ID, Session_ID, Step_ID, Option_ID, Choice_Result, Chosen_At, Previous_Choice_ID)
   VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
   
   UPDATE CampaignProgress 
   SET Current_Step_ID = ?, Last_Updated = NOW(), Version = Version + 1 
   WHERE Character_ID = ? AND Campaign_ID = ? AND Version = ?
   COMMIT
   ```

3. **檢查併發衝突**:
   ```
   SELECT Version FROM CampaignProgress 
   WHERE Character_ID = ? AND Campaign_ID = ?
   ```

---

## ⚡ API 對應

### 新增 API 端點規劃
- `GET /api/auth/login` - 玩家登入驗證
- `GET /api/dashboard/profile` - 角色詳細資料
- `GET /api/dashboard/inventory` - 玩家物品清單
- `GET /api/dashboard/notifications` - 玩家通知
- `GET /api/events/[eventId]` - 事件內容與選項
- `POST /api/events/choose` - 處理玩家選擇
- `GET /api/admin/players` - 管理員用玩家列表

---

## 🚀 實作優先順序

### Phase 1: 基礎資料擴展
1. 建立 `Characters` 工作表
2. 實作登入系統 API
3. 建立基礎儀表板

### Phase 2: 物品系統
1. 建立 `Items` & `Inventory` 工作表  
2. 實作物品管理 API
3. 整合到儀表板

### Phase 3: 事件系統
1. 建立事件相關工作表 (`Events`, `EventOptions`, `EventOutcomes`)
2. 實作 CYOA 邏輯 API
3. 建立事件互動頁面

### Phase 4: 通知系統
1. 建立 `Notifications` 工作表
2. 實作通知 API
3. 整合 Discord 廣播

---

## 🛡️ 資料安全與併發控制考量

### 基本安全
1. **敏感資料分離**: 密碼等敏感資訊只存在必要工作表
2. **權限控制**: 不同身份看到不同資料範圍
3. **資料驗證**: API 層面進行輸入驗證
4. **備份策略**: 定期備份重要遊戲資料

### 併發安全機制
5. **樂觀鎖定**: 使用 Version 欄位防止併發更新衝突
6. **事務處理**: 關鍵操作使用事務確保原子性
7. **狀態隔離**: EventOptions 不存個人狀態，避免共用衝突
8. **Session 管理**: 支援同一玩家多次遊戲不干擾

### 錯誤處理策略
9. **衝突檢測**: API 回應時檢查版本號衝突
10. **重試機制**: 輕微衝突自動重試，嚴重衝突提示使用者
11. **資料一致性**: 失敗時自動回滾，確保資料完整性

---

## 📈 擴展性設計

1. **模組化結構**: 各工作表功能獨立
2. **ID 系統**: 統一的 ID 命名規則
3. **預留欄位**: 重要表格預留擴展欄位
4. **版本控制**: 資料結構變更記錄

此結構設計平衡了功能完整性與實作複雜度，確保在一個月內可完成核心功能開發。