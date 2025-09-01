import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 創建新選項
export async function POST(request, { params }) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { 
      sourceStepId, 
      targetStepId, 
      optionText, 
      requirementText, 
      isRandomOutcome,
      randomChance 
    } = body;

    if (!sourceStepId || !optionText) {
      return Response.json({ 
        success: false, 
        error: 'Source step ID and option text are required' 
      }, { status: 400 });
    }

    // 生成新的選項 ID
    const optionId = `${sourceStepId}-OPT-${Date.now()}`;
    const currentDate = new Date().toISOString().split('T')[0];

    // 準備新選項資料 (依照正確的欄位順序)
    const newOptionRow = [
      optionId,                  // Option_ID
      sourceStepId,             // Source_Step_ID
      targetStepId || '',       // Target_Step_ID
      optionText,               // Option_Text
      '',                       // Req_Stat_Name
      '',                       // Req_Stat_Operator  
      '',                       // Req_Stat_Value
      '',                       // Req_Item_ID
      requirementText || '',    // Requirement_Text
      'TRUE'                    // Is_Available 預設啟用
    ];

    // 添加到 EventOptions 表
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventOptions!A:J',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newOptionRow]
      }
    });

    return Response.json({
      success: true,
      data: {
        Option_ID: optionId,
        Source_Step_ID: sourceStepId,
        Target_Step_ID: targetStepId || '',
        Option_Text: optionText,
        Requirement_Text: requirementText || '',
        Is_Random_Outcome: isRandomOutcome ? 'TRUE' : 'FALSE',
        Random_Chance: randomChance || '',
        Campaign_ID: campaignId,
        Used_Count: '',
        Created_Date: currentDate
      }
    });

  } catch (error) {
    console.error('Create Option API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create option' 
    }, { status: 500 });
  }
}