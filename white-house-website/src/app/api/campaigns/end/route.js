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
 * 結束戰役會話
 * POST /api/campaigns/end
 * Body: { sessionId, reason? }
 * 
 * 最終保存所有資料並清理記憶體資源
 */
export async function POST(request) {
  try {
    const { sessionId, reason = 'normal_end' } = await request.json();

    if (!sessionId) {
      return Response.json({ 
        success: false, 
        error: 'Session ID is required' 
      }, { status: 400 });
    }

    console.log(`🏁 結束戰役會話: ${sessionId}, 原因: ${reason}`);

    const session = campaignSessionManager.getSession(sessionId);
    if (!session) {
      return Response.json({ 
        success: false, 
        error: 'Session not found' 
      }, { status: 404 });
    }

    // 收集會話統計資料
    const sessionStats = await generateSessionStats(session);
    
    // 最終保存所有資料
    const saveResult = await finalSaveSession(session, reason);

    // 記錄會話結束
    await recordSessionEnd(session, reason, sessionStats);

    // 清理會話資源
    await campaignSessionManager.endSession(sessionId);

    console.log(`✅ 戰役會話已完成: ${sessionId}`);

    return Response.json({
      success: true,
      message: 'Campaign session ended successfully',
      data: {
        sessionId,
        endTime: new Date(),
        reason,
        duration: new Date() - session.createdAt,
        stats: sessionStats,
        finalSave: saveResult
      }
    });

  } catch (error) {
    console.error('End Campaign API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to end campaign session',
      details: error.message
    }, { status: 500 });
  }
}

/**
 * 生成會話統計資料
 */
async function generateSessionStats(session) {
  const stats = {
    sessionId: session.sessionId,
    campaignId: session.campaignId,
    startTime: session.createdAt,
    endTime: new Date(),
    duration: new Date() - session.createdAt,
    totalPlayers: session.players.size,
    totalActions: session.changes.playerActions.length,
    totalStateChanges: session.changes.stateChanges.length,
    playersData: []
  };

  // 收集每個玩家的統計
  for (const [characterId, playerState] of session.players) {
    const playerStats = {
      characterId,
      joinTime: playerState.sessionStartAt,
      lastActionTime: playerState.lastActionAt,
      totalChoices: playerState.choiceHistory.length,
      currentStep: playerState.currentStepId,
      isActive: playerState.isActive
    };

    // 計算玩家在該會話中的行動次數
    const playerActions = session.changes.playerActions.filter(
      action => action.characterId === characterId
    );
    playerStats.totalActions = playerActions.length;

    // 計算狀態變更次數
    const stateChanges = session.changes.stateChanges.filter(
      change => change.characterId === characterId
    );
    playerStats.stateChanges = stateChanges.length;

    stats.playersData.push(playerStats);
  }

  return stats;
}

/**
 * 最終保存會話資料
 */
async function finalSaveSession(session, reason) {
  try {
    // 強制保存所有未保存的變更
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/campaigns/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sessionId: session.sessionId, 
        force: true 
      })
    });

    if (!saveResponse.ok) {
      throw new Error('Failed to save session data');
    }

    const saveResult = await saveResponse.json();
    console.log(`💾 最終保存完成: ${session.sessionId}`);
    
    return saveResult.data;
  } catch (error) {
    console.error(`最終保存失敗: ${session.sessionId}`, error);
    // 即使保存失敗也要繼續清理會話
    return { error: error.message };
  }
}

/**
 * 記錄會話結束資訊
 */
async function recordSessionEnd(session, reason, stats) {
  try {
    const endRecord = [
      session.sessionId,
      session.campaignId,
      session.createdAt.toISOString(),
      new Date().toISOString(),
      stats.duration,
      stats.totalPlayers,
      stats.totalActions,
      reason,
      JSON.stringify({
        playersCount: stats.totalPlayers,
        actionsCount: stats.totalActions,
        stateChangesCount: stats.totalStateChanges,
        avgActionsPerPlayer: Math.round(stats.totalActions / stats.totalPlayers)
      })
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'CampaignSessions!A:I',
      valueInputOption: 'USER_ENTERED',
      resource: { values: [endRecord] }
    });

    console.log(`📊 會話記錄已保存: ${session.sessionId}`);
  } catch (error) {
    console.error(`保存會話記錄失敗: ${session.sessionId}`, error);
  }
}

/**
 * 獲取會話管理統計
 * GET /api/campaigns/end
 */
export async function GET(request) {
  try {
    const stats = campaignSessionManager.getStats();
    
    return Response.json({
      success: true,
      data: {
        timestamp: new Date(),
        activeSessionsCount: stats.activeSessions,
        totalPlayersCount: stats.totalPlayers,
        sessionsNeedingSave: stats.sessionsNeedingSave,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    });

  } catch (error) {
    console.error('Get Session Stats Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to get session statistics' 
    }, { status: 500 });
  }
}