import { google } from 'googleapis';
import campaignSessionManager from '@/lib/campaignSessionManager';
import { generateSessionId } from '@/lib/utils';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * 開始新戰役會話
 * POST /api/campaigns/start
 * Body: { campaignId, characterId }
 * 
 * 載入所有戰役資料到記憶體暫存，減少後續API請求
 */
export async function POST(request) {
  try {
    const { campaignId, characterId } = await request.json();

    if (!campaignId || !characterId) {
      return Response.json({ 
        success: false, 
        error: 'Campaign ID and Character ID are required' 
      }, { status: 400 });
    }

    console.log(`🚀 開始戰役會話: ${campaignId} for ${characterId}`);

    // 1. 生成會話ID
    const sessionId = `${campaignId}-${characterId}-${Date.now()}`;

    // 2. 並行載入所有戰役相關資料
    const [
      campaignsResponse, 
      stepsResponse, 
      optionsResponse, 
      outcomesResponse,
      charactersResponse
    ] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventCampaigns!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Events!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventOptions!A:K',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventOutcomes!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Characters!A:Z',
      })
    ]);

    // 3. 解析資料
    const campaignsData = campaignsResponse.data.values || [];
    const stepsData = stepsResponse.data.values || [];
    const optionsData = optionsResponse.data.values || [];
    const outcomesData = outcomesResponse.data.values || [];
    const charactersData = charactersResponse.data.values || [];

    // 4. 找到戰役
    const campaignHeaders = campaignsData[0] || [];
    const campaignRow = campaignsData.slice(1).find(row => row[0] === campaignId);
    
    if (!campaignRow) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, { status: 404 });
    }

    // 5. 找到角色
    const characterHeaders = charactersData[0] || [];
    const characterRow = charactersData.slice(1).find(row => row[0] === characterId);
    
    if (!characterRow) {
      return Response.json({ 
        success: false, 
        error: 'Character not found' 
      }, { status: 404 });
    }

    // 6. 處理戰役資料
    const campaign = {};
    campaignHeaders.forEach((header, index) => {
      campaign[header] = campaignRow[index] || '';
    });

    // 7. 處理角色資料
    const character = {};
    characterHeaders.forEach((header, index) => {
      character[header] = characterRow[index] || '';
    });

    // 8. 處理步驟資料 (只包含該戰役的)
    const stepHeaders = stepsData[0] || [];
    const steps = stepsData.slice(1)
      .filter(row => row[1] === campaignId) // Campaign_ID篩選
      .map(row => {
        const step = {};
        stepHeaders.forEach((header, index) => {
          step[header] = row[index] || '';
        });
        return step;
      });

    // 9. 處理選項資料 (只包含該戰役相關的)
    const optionHeaders = optionsData[0] || [];
    const campaignStepIds = steps.map(step => step.Step_ID);
    const options = optionsData.slice(1)
      .filter(row => campaignStepIds.includes(row[1])) // Source_Step_ID篩選
      .map(row => {
        const option = {};
        optionHeaders.forEach((header, index) => {
          option[header] = row[index] || '';
        });
        return option;
      });

    // 10. 處理結果資料 (只包含該戰役相關的)
    const outcomeHeaders = outcomesData[0] || [];
    const campaignOptionIds = options.map(option => option.Option_ID);
    const outcomes = outcomesData.slice(1)
      .filter(row => campaignOptionIds.includes(row[1])) // Trigger_Option_ID篩選
      .map(row => {
        const outcome = {};
        outcomeHeaders.forEach((header, index) => {
          outcome[header] = row[index] || '';
        });
        return outcome;
      });

    // 11. 建立會話
    const campaignData = {
      campaign,
      steps,
      options,
      outcomes
    };

    const session = await campaignSessionManager.createSession(
      sessionId, 
      campaignId, 
      campaignData
    );

    // 12. 加入玩家到會話
    const playerState = await campaignSessionManager.joinSession(
      sessionId, 
      characterId, 
      character
    );

    // 13. 獲取初始狀態
    const currentState = await campaignSessionManager.getCurrentState(session, playerState);

    console.log(`✅ 戰役會話已建立: ${sessionId}`);

    return Response.json({
      success: true,
      data: {
        sessionId,
        campaignId,
        characterId,
        ...currentState,
        sessionInfo: {
          createdAt: session.createdAt,
          autoSaveEnabled: true,
          cacheStats: {
            stepsLoaded: steps.length,
            optionsLoaded: options.length,
            outcomesLoaded: outcomes.length
          }
        }
      }
    });

  } catch (error) {
    console.error('Start Campaign API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to start campaign session',
      details: error.message
    }, { status: 500 });
  }
}