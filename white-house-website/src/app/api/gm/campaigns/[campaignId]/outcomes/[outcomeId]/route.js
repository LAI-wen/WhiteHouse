import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 更新結果
export async function PUT(request, { params }) {
  try {
    const { campaignId, outcomeId } = await params;
    const body = await request.json();
    const { 
      triggerOptionId, 
      outcomeType, 
      valueChange, 
      outcomeDescription,
      nextStepId
    } = body;

    if (!outcomeType) {
      return Response.json({ 
        success: false, 
        error: 'Outcome type is required' 
      }, { status: 400 });
    }

    // 獲取現有結果資料
    const outcomesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventOutcomes!A:G',
    });

    const outcomesData = outcomesResponse.data.values || [];
    
    if (outcomesData.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Outcome not found' 
      }, { status: 404 });
    }

    // 找到要更新的結果行
    const outcomeRowIndex = outcomesData.findIndex((row, index) => 
      index > 0 && row[0] === outcomeId
    );

    if (outcomeRowIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Outcome not found' 
      }, { status: 404 });
    }

    // 準備更新的資料
    const updatedRow = [
      outcomeId,
      triggerOptionId,
      outcomeType,
      valueChange || '',
      outcomeDescription || '',
      nextStepId || '',
      outcomesData[outcomeRowIndex][6] || new Date().toISOString().split('T')[0] // 保持原創建日期
    ];

    // 更新 Google Sheets
    const updateRange = `EventOutcomes!A${outcomeRowIndex + 1}:G${outcomeRowIndex + 1}`;
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
        Outcome_ID: outcomeId,
        Trigger_Option_ID: triggerOptionId,
        Outcome_Type: outcomeType,
        Value_Change: valueChange || '',
        Outcome_Description: outcomeDescription || '',
        Next_Step_ID: nextStepId || ''
      }
    });

  } catch (error) {
    console.error('Update Outcome API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update outcome' 
    }, { status: 500 });
  }
}

// 刪除結果
export async function DELETE(request, { params }) {
  try {
    const { campaignId, outcomeId } = await params;

    // 獲取現有結果資料
    const outcomesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventOutcomes!A:G',
    });

    const outcomesData = outcomesResponse.data.values || [];
    
    if (outcomesData.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Outcome not found' 
      }, { status: 404 });
    }

    // 找到要刪除的結果行
    const outcomeRowIndex = outcomesData.findIndex((row, index) => 
      index > 0 && row[0] === outcomeId
    );

    if (outcomeRowIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Outcome not found' 
      }, { status: 404 });
    }

    // 刪除結果行
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getSheetId('EventOutcomes'),
                dimension: 'ROWS',
                startIndex: outcomeRowIndex,
                endIndex: outcomeRowIndex + 1
              }
            }
          }
        ]
      }
    });

    return Response.json({
      success: true,
      message: 'Outcome deleted successfully'
    });

  } catch (error) {
    console.error('Delete Outcome API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete outcome' 
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