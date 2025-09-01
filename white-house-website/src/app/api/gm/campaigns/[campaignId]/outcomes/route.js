import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 創建新結果
export async function POST(request, { params }) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { 
      triggerOptionId, 
      outcomeType, 
      outcomeTarget,
      outcomeValue, 
      outcomeDescription,
      discordMessage
    } = body;

    if (!triggerOptionId || !outcomeType) {
      return Response.json({ 
        success: false, 
        error: 'Trigger option ID and outcome type are required' 
      }, { status: 400 });
    }

    // 生成新的結果 ID
    const outcomeId = `${triggerOptionId}-OUT-${Date.now()}`;

    // 準備新結果資料 (依照正確的欄位順序)
    const newOutcomeRow = [
      outcomeId,                    // Outcome_ID
      triggerOptionId,             // Trigger_Option_ID
      outcomeType,                 // Outcome_Type
      outcomeTarget || '',         // Outcome_Target
      outcomeValue || '',          // Outcome_Value
      outcomeDescription || '',    // Outcome_Description
      discordMessage || ''         // Discord_Message
    ];

    // 添加到 EventOutcomes 表
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventOutcomes!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newOutcomeRow]
      }
    });

    return Response.json({
      success: true,
      data: {
        Outcome_ID: outcomeId,
        Trigger_Option_ID: triggerOptionId,
        Outcome_Type: outcomeType,
        Outcome_Target: outcomeTarget || '',
        Outcome_Value: outcomeValue || '',
        Outcome_Description: outcomeDescription || '',
        Discord_Message: discordMessage || ''
      }
    });

  } catch (error) {
    console.error('Create Outcome API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create outcome' 
    }, { status: 500 });
  }
}