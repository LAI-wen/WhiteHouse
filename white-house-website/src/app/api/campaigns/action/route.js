import campaignSessionManager from '@/lib/campaignSessionManager';

/**
 * 戰役行動處理 (暫存版本)
 * POST /api/campaigns/action
 * Body: { sessionId, characterId, action: { type, ...params } }
 * 
 * 所有行動都在記憶體中處理，不直接讀寫資料庫
 */
export async function POST(request) {
  try {
    const { sessionId, characterId, action } = await request.json();

    if (!sessionId || !characterId || !action) {
      return Response.json({ 
        success: false, 
        error: 'Session ID, Character ID and Action are required' 
      }, { status: 400 });
    }

    console.log(`🎮 處理行動: ${action.type} for ${characterId} in ${sessionId}`);

    // 使用會話管理器處理行動
    const result = await campaignSessionManager.processPlayerAction(
      sessionId, 
      characterId, 
      action
    );

    // 回傳處理結果
    return Response.json({
      success: true,
      data: result,
      meta: {
        sessionId,
        characterId,
        actionType: action.type,
        timestamp: new Date().toISOString(),
        cached: true // 標示這是暫存處理
      }
    });

  } catch (error) {
    console.error('Campaign Action API Error:', error);
    
    // 錯誤分類處理
    let status = 500;
    let errorMessage = 'Failed to process action';
    
    if (error.message === 'Session not found') {
      status = 404;
      errorMessage = 'Campaign session not found or expired';
    } else if (error.message === 'Player not in session') {
      status = 403;
      errorMessage = 'Player not in this campaign session';
    } else if (error.message.includes('Option not')) {
      status = 400;
      errorMessage = error.message;
    }

    return Response.json({ 
      success: false, 
      error: errorMessage,
      details: error.message
    }, { status });
  }
}

/**
 * 獲取會話狀態
 * GET /api/campaigns/action?sessionId=xxx&characterId=xxx
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const characterId = searchParams.get('characterId');

    if (!sessionId || !characterId) {
      return Response.json({ 
        success: false, 
        error: 'Session ID and Character ID are required' 
      }, { status: 400 });
    }

    // 獲取當前狀態
    const result = await campaignSessionManager.processPlayerAction(
      sessionId, 
      characterId, 
      { type: 'get_current_state' }
    );

    return Response.json({
      success: true,
      data: result,
      meta: {
        sessionId,
        characterId,
        cached: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get Campaign State API Error:', error);
    
    let status = 500;
    let errorMessage = 'Failed to get campaign state';
    
    if (error.message === 'Session not found') {
      status = 404;
      errorMessage = 'Campaign session not found or expired';
    } else if (error.message === 'Player not in session') {
      status = 403;
      errorMessage = 'Player not in this campaign session';
    }

    return Response.json({ 
      success: false, 
      error: errorMessage,
      details: error.message
    }, { status });
  }
}