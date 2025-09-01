# White House Website - 多人遊戲衝突修正計劃

## 發現的問題

### 1. 共用選項狀態衝突 (嚴重)
- EventOptions 表的 `Is_Available` 欄位被多個玩家共用
- 玩家A的選擇會影響玩家B的可用選項
- 無法支援多人同時進行相同戰役

### 2. 進度追蹤不完整
- CampaignProgress 只記錄當前步驟，沒有選擇歷史
- 無法實現「某些選項只能選一次」的邏輯
- 缺乏重複遊戲支援

### 3. API 併發安全問題
- `/api/campaigns/play` 直接修改共用資料
- 沒有事務保護和樂觀鎖定
- 多人同時操作可能導致資料不一致

## Stage 1: 資料結構修正
**Goal**: 建立個人化選擇追蹤機制
**Success Criteria**: 
- 新增 PlayerChoiceHistory 表
- 更新資料庫結構文檔
- 保持向後相容性

**Tests**: 
- 驗證新表結構正確建立
- 測試多個玩家可以有不同的選擇歷史

**Implementation**:
```sql
CREATE TABLE PlayerChoiceHistory (
  Choice_ID INT PRIMARY KEY AUTO_INCREMENT,
  Character_ID VARCHAR(255) NOT NULL,
  Campaign_ID VARCHAR(255) NOT NULL, 
  Step_ID VARCHAR(255) NOT NULL,
  Option_ID VARCHAR(255) NOT NULL,
  Chosen_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  Session_ID VARCHAR(255), -- 支援重複遊戲
  INDEX idx_player_campaign (Character_ID, Campaign_ID),
  INDEX idx_session (Session_ID)
);
```

**Status**: Not Started

## Stage 2: API 邏輯重構  
**Goal**: 移除共用狀態修改，改用個人歷史判斷
**Success Criteria**:
- `/api/campaigns/play` 不再修改 EventOptions.Is_Available
- 基於個人歷史計算可用選項
- 所有現有功能正常運作

**Tests**:
- 兩個玩家同時進行同一戰役互不影響
- 選項可用性基於個人歷史正確計算
- 重複選擇限制正確執行

**Implementation**:
- 修改 `route.js` 中的選項處理邏輯
- 新增個人選擇歷史查詢函數
- 實現選項可用性計算邏輯

**Status**: Not Started

## Stage 3: 併發控制機制
**Goal**: 確保多人同時操作的資料一致性
**Success Criteria**:
- 實現樂觀鎖定防止競態條件
- 加入事務處理保證原子性
- 適當的錯誤處理和重試機制

**Tests**:
- 壓力測試多人同時提交選擇
- 驗證資料完整性
- 測試錯誤恢復機制

**Implementation**:
- 在 CampaignProgress 加入版本號欄位
- 修改 API 使用事務和版本檢查
- 實現衝突檢測和處理

**Status**: Not Started

## Stage 4: Session 管理和效能優化
**Goal**: 提升使用者體驗和系統效能
**Success Criteria**:
- 支援重複遊戲的 Session 機制
- 減少不必要的 API 調用
- 前端快取戰役結構

**Tests**:
- Session 建立和管理正確運作
- 頁面載入時間改善
- 遊戲體驗流暢

**Implementation**:
- 實現 Session 生成和管理
- 戰役開始時一次性載入完整結構
- 前端狀態管理優化

**Status**: Not Started

## Stage 5: 資料遷移和清理
**Goal**: 安全遷移現有資料，移除不再需要的欄位
**Success Criteria**:
- 現有進度資料正確遷移
- 移除 EventOptions.Is_Available 欄位
- 更新相關文檔

**Tests**:
- 資料遷移完整性驗證
- 舊功能在新結構下正常運作

**Status**: Not Started

## 風險評估

### 高風險
- 資料結構變更可能影響現有功能
- API 變更需要謹慎測試

### 中風險  
- 效能影響需要監控
- Session 管理複雜度

### 低風險
- 前端快取實現
- 文檔更新

## 回滾計劃
- 保留原始資料結構直到完全驗證
- 每個 Stage 都有獨立的回滾點
- 詳細的資料備份策略