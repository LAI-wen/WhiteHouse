import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 更新選項
export async function PUT(request, { params }) {
  try {
    const { campaignId, optionId } = await params;
    const body = await request.json();
    const { 
      sourceStepId, 
      targetStepId, 
      optionText, 
      requirementText, 
      isRandomOutcome,
      randomChance 
    } = body;

    if (!optionText) {
      return Response.json({ 
        success: false, 
        error: 'Option text is required' 
      }, { status: 400 });
    }

    // 獲取現有選項資料
    const optionsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventOptions!A:J',
    });

    const optionsData = optionsResponse.data.values || [];
    
    if (optionsData.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Option not found' 
      }, { status: 404 });
    }

    // 找到要更新的選項行
    const optionRowIndex = optionsData.findIndex((row, index) => 
      index > 0 && row[0] === optionId
    );

    if (optionRowIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Option not found' 
      }, { status: 404 });
    }

    // 準備更新的資料
    const updatedRow = [
      optionId,
      sourceStepId,
      targetStepId || '',
      optionText,
      requirementText || '',
      isRandomOutcome ? 'TRUE' : 'FALSE',
      randomChance || '',
      campaignId,
      optionsData[optionRowIndex][8] || '', // 保持原 Used_Count
      optionsData[optionRowIndex][9] || new Date().toISOString().split('T')[0] // 保持原創建日期
    ];

    // 更新 Google Sheets
    const updateRange = `EventOptions!A${optionRowIndex + 1}:J${optionRowIndex + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: updateRange,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow]
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
        Campaign_ID: campaignId
      }
    });

  } catch (error) {
    console.error('Update Option API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update option' 
    }, { status: 500 });
  }
}

// 刪除選項
export async function DELETE(request, { params }) {
  try {
    const { campaignId, optionId } = await params;

    // 獲取現有選項資料
    const optionsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventOptions!A:J',
    });

    const optionsData = optionsResponse.data.values || [];
    
    if (optionsData.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Option not found' 
      }, { status: 404 });
    }

    // 找到要刪除的選項行
    const optionRowIndex = optionsData.findIndex((row, index) => 
      index > 0 && row[0] === optionId
    );

    if (optionRowIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Option not found' 
      }, { status: 404 });
    }

    // 檢查是否有相關的結果
    const [outcomesResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventOutcomes!A:G',
      })
    ]);

    const outcomesData = outcomesResponse.data.values || [];

    // 檢查是否有相關結果
    const hasRelatedOutcomes = outcomesData.slice(1).some(row => 
      row[1] === optionId // Trigger_Option_ID
    );

    if (hasRelatedOutcomes) {
      return Response.json({ 
        success: false, 
        error: '無法刪除：此選項包含相關結果。請先刪除相關結果。' 
      }, { status: 400 });
    }

    // 刪除選項行
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getSheetId('EventOptions'),
                dimension: 'ROWS',
                startIndex: optionRowIndex,
                endIndex: optionRowIndex + 1
              }
            }
          }
        ]
      }
    });

    return Response.json({
      success: true,
      message: 'Option deleted successfully'
    });

  } catch (error) {
    console.error('Delete Option API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete option' 
    }, { status: 500 });
  }
}

// 輔助函數：獲取工作表 ID
async function getSheetId(sheetName) {
  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID
    });
    
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
    return sheet ? sheet.properties.sheetId : 0;
  } catch (error) {
    console.error('Get Sheet ID Error:', error);
    return 0;
  }
}