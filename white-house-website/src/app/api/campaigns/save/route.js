import { google } from 'googleapis';
import campaignSessionManager from '@/lib/campaignSessionManager';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * 暫存戰役會話資料
 * POST /api/campaigns/save
 * Body: { sessionId }
 * 
 * 手動觸發暫存，將記憶體中的變更批次寫入資料庫
 */
export async function POST(request) {
  try {
    const { sessionId, force = false } = await request.json();

    if (!sessionId) {
      return Response.json({ 
        success: false, 
        error: 'Session ID is required' 
      }, { status: 400 });
    }

    console.log(`💾 手動暫存會話: ${sessionId}`);

    const session = campaignSessionManager.getSession(sessionId);
    if (!session) {
      return Response.json({ 
        success: false, 
        error: 'Session not found' 
      }, { status: 404 });
    }

    // 檢查是否有變更需要保存
    if (!session.changes.needsSave && !force) {
      return Response.json({
        success: true,
        message: 'No changes to save',
        data: {
          sessionId,
          lastSaveTime: new Date(),
          changesSaved: 0
        }
      });
    }

    // 準備批次保存的資料
    const saveData = await prepareSaveData(session);
    let totalSaved = 0;

    // 1. 保存玩家進度
    if (saveData.playerProgress.length > 0) {
      await savePlayerProgress(saveData.playerProgress);
      totalSaved += saveData.playerProgress.length;
      console.log(`📊 已保存 ${saveData.playerProgress.length} 筆玩家進度`);
    }

    // 2. 保存選擇記錄
    if (saveData.choiceHistory.length > 0) {
      await saveChoiceHistory(saveData.choiceHistory);
      totalSaved += saveData.choiceHistory.length;
      console.log(`📝 已保存 ${saveData.choiceHistory.length} 筆選擇記錄`);
    }

    // 3. 保存角色狀態變更
    if (saveData.characterUpdates.length > 0) {
      await saveCharacterUpdates(saveData.characterUpdates);
      totalSaved += saveData.characterUpdates.length;
      console.log(`👤 已保存 ${saveData.characterUpdates.length} 筆角色更新`);
    }

    // 更新會話狀態
    session.changes.needsSave = false;
    session.changes.lastSaveTime = new Date();

    console.log(`✅ 暫存完成: ${sessionId}, 總共保存 ${totalSaved} 筆記錄`);

    return Response.json({
      success: true,
      message: `Campaign data saved successfully`,
      data: {
        sessionId,
        saveTime: new Date(),
        changesSaved: totalSaved,
        breakdown: {
          playerProgress: saveData.playerProgress.length,
          choiceHistory: saveData.choiceHistory.length,
          characterUpdates: saveData.characterUpdates.length
        }
      }
    });

  } catch (error) {
    console.error('Save Campaign API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to save campaign data',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * 準備保存資料
 */
async function prepareSaveData(session) {
  const playerProgress = [];
  const choiceHistory = [];
  const characterUpdates = [];

  // 處理每個玩家的資料
  for (const [characterId, playerState] of session.players) {
    // 玩家進度記錄
    playerProgress.push({
      characterId,
      campaignId: session.campaignId,
      currentStepId: playerState.currentStepId,
      sessionId: session.sessionId,
      lastActionAt: playerState.lastActionAt,
      isActive: playerState.isActive
    });

    // 選擇歷史記錄 (只保存新的)
    const newChoices = playerState.choiceHistory.filter(choice => 
      choice.timestamp > (session.changes.lastSaveTime || session.createdAt)
    );
    
    for (const choice of newChoices) {
      choiceHistory.push({
        characterId,
        campaignId: session.campaignId,
        sessionId: session.sessionId,
        stepId: choice.stepId,
        optionId: choice.optionId,
        timestamp: choice.timestamp
      });
    }

    // 角色狀態更新 (只保存有變更的)
    const stateChanges = session.changes.stateChanges.filter(change => 
      change.characterId === characterId &&
      change.timestamp > (session.changes.lastSaveTime || session.createdAt)
    );

    if (stateChanges.length > 0) {
      characterUpdates.push({
        characterId,
        updates: playerState.characterData,
        changes: stateChanges,
        timestamp: new Date()
      });
    }
  }

  return { playerProgress, choiceHistory, characterUpdates };
}

/**
 * 保存玩家進度
 */
async function savePlayerProgress(progressData) {
  if (progressData.length === 0) return;

  const rows = progressData.map(progress => [
    progress.characterId,
    progress.campaignId,
    progress.currentStepId,
    progress.sessionId,
    progress.lastActionAt.toISOString(),
    progress.isActive ? 'TRUE' : 'FALSE',
    new Date().toISOString() // updated_at
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'CampaignProgress!A:G',
    valueInputOption: 'USER_ENTERED',
    resource: { values: rows }
  });
}

/**
 * 保存選擇記錄
 */
async function saveChoiceHistory(choiceData) {
  if (choiceData.length === 0) return;

  const rows = choiceData.map(choice => [
    choice.characterId,
    choice.campaignId,
    choice.sessionId,
    choice.stepId,
    choice.optionId,
    choice.timestamp.toISOString(),
    new Date().toISOString() // created_at
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SPREADSHEET_ID,
    range: 'PlayerChoiceHistory!A:G',
    valueInputOption: 'USER_ENTERED',
    resource: { values: rows }
  });
}

/**
 * 保存角色狀態更新
 */
async function saveCharacterUpdates(updateData) {
  if (updateData.length === 0) return;

  // 批次更新角色資料表
  for (const update of updateData) {
    // 這裡需要先找到角色在表格中的位置，然後更新特定欄位
    // 為簡化，我們先記錄變更歷史
    const changeRows = update.changes.map(change => [
      update.characterId,
      change.type,
      change.target,
      change.oldValue,
      change.newValue,
      change.timestamp.toISOString(),
      'campaign_action' // source
    ]);

    if (changeRows.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'CharacterChangelog!A:G',
        valueInputOption: 'USER_ENTERED',
        resource: { values: changeRows }
      });
    }
  }
}