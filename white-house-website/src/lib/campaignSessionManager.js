/**
 * 戰役會話管理器
 * 處理戰役的生命週期和暫存操作，減少API頻率
 */

class CampaignSessionManager {
  constructor() {
    // 記憶體中的活躍會話
    this.activeSessions = new Map();
    // 暫存定時器
    this.saveTimers = new Map();
    // 配置
    this.config = {
      autoSaveInterval: 5 * 60 * 1000, // 5分鐘自動暫存
      sessionTimeout: 30 * 60 * 1000,  // 30分鐘會話超時
      maxConcurrentSessions: 100       // 最大並行會話數
    };
  }

  /**
   * 建立新的戰役會話
   */
  async createSession(sessionId, campaignId, campaignData) {
    // 檢查會話限制
    if (this.activeSessions.size >= this.config.maxConcurrentSessions) {
      this.cleanupOldSessions();
    }

    const session = {
      sessionId,
      campaignId,
      createdAt: new Date(),
      lastAccessAt: new Date(),
      
      // 戰役基本資料
      campaign: campaignData.campaign,
      steps: new Map(campaignData.steps.map(step => [step.Step_ID, step])),
      options: new Map(campaignData.options.map(opt => [opt.Option_ID, opt])),
      outcomes: new Map(campaignData.outcomes.map(out => [out.Outcome_ID, out])),
      
      // 玩家會話資料
      players: new Map(), // characterId -> playerState
      
      // 變更追蹤
      changes: {
        playerActions: [],
        stateChanges: [],
        needsSave: false
      },
      
      // 鎖定機制
      version: 1,
      isLocked: false
    };

    this.activeSessions.set(sessionId, session);
    this.setupAutoSave(sessionId);
    
    console.log(`🎮 戰役會話已建立: ${sessionId} (${campaignId})`);
    return session;
  }

  /**
   * 加入玩家到會話
   */
  async joinSession(sessionId, characterId, characterData) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // 建立玩家狀態
    const playerState = {
      characterId,
      characterData,
      currentStepId: this.findStartingStep(session),
      choiceHistory: [],
      sessionStartAt: new Date(),
      lastActionAt: new Date(),
      isActive: true
    };

    session.players.set(characterId, playerState);
    session.lastAccessAt = new Date();
    session.changes.needsSave = true;

    console.log(`👤 玩家 ${characterId} 加入會話 ${sessionId}`);
    return playerState;
  }

  /**
   * 處理玩家行動
   */
  async processPlayerAction(sessionId, characterId, action) {
    const session = this.getSession(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const playerState = session.players.get(characterId);
    if (!playerState) {
      throw new Error('Player not in session');
    }

    // 更新玩家狀態
    session.lastAccessAt = new Date();
    playerState.lastActionAt = new Date();

    let result;
    
    switch (action.type) {
      case 'choose_option':
        result = await this.handleChooseOption(session, playerState, action);
        break;
      case 'get_current_state':
        result = await this.getCurrentState(session, playerState);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    // 記錄變更
    session.changes.playerActions.push({
      characterId,
      action,
      timestamp: new Date(),
      result
    });
    session.changes.needsSave = true;

    return result;
  }

  /**
   * 處理選項選擇
   */
  async handleChooseOption(session, playerState, action) {
    const { optionId } = action;
    const option = session.options.get(optionId);
    
    if (!option) {
      throw new Error('Option not found');
    }

    // 驗證選項是否可用
    if (!this.isOptionAvailable(session, playerState, option)) {
      throw new Error('Option not available');
    }

    // 記錄選擇
    const choice = {
      optionId,
      stepId: playerState.currentStepId,
      timestamp: new Date(),
      sessionId: session.sessionId
    };
    
    playerState.choiceHistory.push(choice);

    // 處理結果
    const outcomes = Array.from(session.outcomes.values())
      .filter(outcome => outcome.Trigger_Option_ID === optionId);
    
    for (const outcome of outcomes) {
      await this.processOutcome(session, playerState, outcome);
    }

    // 移動到目標步驟
    if (option.Target_Step_ID) {
      playerState.currentStepId = option.Target_Step_ID;
    }

    return {
      success: true,
      currentStep: session.steps.get(playerState.currentStepId),
      availableOptions: this.getAvailableOptions(session, playerState),
      outcomes: outcomes.map(o => o.Outcome_Description).filter(Boolean)
    };
  }

  /**
   * 獲取當前狀態
   */
  async getCurrentState(session, playerState) {
    const currentStep = session.steps.get(playerState.currentStepId);
    const availableOptions = this.getAvailableOptions(session, playerState);

    return {
      success: true,
      currentStep,
      availableOptions,
      character: playerState.characterData,
      sessionInfo: {
        sessionId: session.sessionId,
        campaignId: session.campaignId,
        joinedAt: playerState.sessionStartAt
      }
    };
  }

  /**
   * 獲取可用選項
   */
  getAvailableOptions(session, playerState) {
    const currentStep = session.steps.get(playerState.currentStepId);
    if (!currentStep) return [];

    return Array.from(session.options.values())
      .filter(option => option.Source_Step_ID === currentStep.Step_ID)
      .filter(option => this.isOptionAvailable(session, playerState, option));
  }

  /**
   * 檢查選項是否可用
   */
  isOptionAvailable(session, playerState, option) {
    // 檢查使用次數限制
    if (option.Max_Uses_Per_Player && parseInt(option.Max_Uses_Per_Player) > 0) {
      const usageCount = playerState.choiceHistory.filter(
        choice => choice.optionId === option.Option_ID
      ).length;
      
      if (usageCount >= parseInt(option.Max_Uses_Per_Player)) {
        return false;
      }
    }

    // 檢查屬性需求
    if (option.Req_Stat_Name && option.Req_Stat_Value) {
      const statValue = playerState.characterData[option.Req_Stat_Name];
      const reqValue = parseInt(option.Req_Stat_Value);
      const operator = option.Req_Stat_Operator || '>=';

      switch (operator) {
        case '>':
          if (!(parseInt(statValue) > reqValue)) return false;
          break;
        case '>=':
          if (!(parseInt(statValue) >= reqValue)) return false;
          break;
        case '<':
          if (!(parseInt(statValue) < reqValue)) return false;
          break;
        case '<=':
          if (!(parseInt(statValue) <= reqValue)) return false;
          break;
        case '==':
          if (!(parseInt(statValue) === reqValue)) return false;
          break;
      }
    }

    return true;
  }

  /**
   * 處理結果
   */
  async processOutcome(session, playerState, outcome) {
    switch (outcome.Outcome_Type) {
      case 'CHANGE_STAT':
        const statName = outcome.Outcome_Target;
        const change = parseInt(outcome.Outcome_Value);
        const currentValue = parseInt(playerState.characterData[statName]) || 0;
        playerState.characterData[statName] = currentValue + change;
        
        session.changes.stateChanges.push({
          characterId: playerState.characterId,
          type: 'stat_change',
          target: statName,
          oldValue: currentValue,
          newValue: playerState.characterData[statName],
          timestamp: new Date()
        });
        break;
    }
  }

  /**
   * 找到起始步驟
   */
  findStartingStep(session) {
    const startingStep = Array.from(session.steps.values())
      .find(step => step.Is_Starting_Step === 'TRUE');
    return startingStep ? startingStep.Step_ID : null;
  }

  /**
   * 獲取會話
   */
  getSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.lastAccessAt = new Date();
    }
    return session;
  }

  /**
   * 設定自動暫存
   */
  setupAutoSave(sessionId) {
    const timer = setInterval(async () => {
      await this.saveSessionData(sessionId, false); // 非強制暫存
    }, this.config.autoSaveInterval);

    this.saveTimers.set(sessionId, timer);
  }

  /**
   * 暫存會話資料
   */
  async saveSessionData(sessionId, force = false) {
    const session = this.activeSessions.get(sessionId);
    if (!session || (!session.changes.needsSave && !force)) {
      return false;
    }

    try {
      // 呼叫暫存API進行實際保存
      const response = await fetch('/api/campaigns/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId, 
          force 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.success) {
        console.log(`💾 暫存成功: ${sessionId} - ${result.data.changesSaved} 筆變更`);
        session.changes.needsSave = false;
        session.changes.lastSaveTime = new Date();
        return true;
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error(`暫存失敗: ${sessionId}`, error);
      return false;
    }
  }

  /**
   * 結束會話
   */
  async endSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // 最終保存
    await this.saveSessionData(sessionId, true);

    // 清理資源
    if (this.saveTimers.has(sessionId)) {
      clearInterval(this.saveTimers.get(sessionId));
      this.saveTimers.delete(sessionId);
    }

    this.activeSessions.delete(sessionId);
    console.log(`🏁 會話已結束: ${sessionId}`);
  }

  /**
   * 清理舊會話
   */
  cleanupOldSessions() {
    const now = new Date();
    const sessionsToCleanup = [];

    for (const [sessionId, session] of this.activeSessions) {
      const timeSinceLastAccess = now - session.lastAccessAt;
      if (timeSinceLastAccess > this.config.sessionTimeout) {
        sessionsToCleanup.push(sessionId);
      }
    }

    for (const sessionId of sessionsToCleanup) {
      this.endSession(sessionId).catch(console.error);
    }

    if (sessionsToCleanup.length > 0) {
      console.log(`🧹 清理了 ${sessionsToCleanup.length} 個過期會話`);
    }
  }

  /**
   * 獲取會話狀態統計
   */
  getStats() {
    return {
      activeSessions: this.activeSessions.size,
      totalPlayers: Array.from(this.activeSessions.values())
        .reduce((total, session) => total + session.players.size, 0),
      sessionsNeedingSave: Array.from(this.activeSessions.values())
        .filter(session => session.changes.needsSave).length
    };
  }
}

// 單例實例
const campaignSessionManager = new CampaignSessionManager();

export default campaignSessionManager;