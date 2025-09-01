import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 更新步驟
export async function PUT(request, { params }) {
  try {
    const { campaignId, stepId } = await params;
    const body = await request.json();
    const { title, description, imageUrl, isStartingStep } = body;

    if (!title || !description) {
      return Response.json({ 
        success: false, 
        error: 'Title and description are required' 
      }, { status: 400 });
    }

    // 獲取現有步驟資料
    const stepsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventSteps!A:G',
    });

    const stepsData = stepsResponse.data.values || [];
    
    if (stepsData.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Step not found' 
      }, { status: 404 });
    }

    // 找到要更新的步驟行
    const stepRowIndex = stepsData.findIndex((row, index) => 
      index > 0 && row[0] === stepId && row[1] === campaignId
    );

    if (stepRowIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Step not found' 
      }, { status: 404 });
    }

    // 準備更新的資料
    const updatedRow = [
      stepId,
      campaignId,
      title,
      description,
      imageUrl || '',
      isStartingStep ? 'TRUE' : 'FALSE',
      stepsData[stepRowIndex][6] || new Date().toISOString().split('T')[0] // 保持原創建日期
    ];

    // 更新 Google Sheets
    const updateRange = `EventSteps!A${stepRowIndex + 1}:G${stepRowIndex + 1}`;
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
        Step_ID: stepId,
        Campaign_ID: campaignId,
        Step_Title: title,
        Step_Description: description,
        Image_URL: imageUrl || '',
        Is_Starting_Step: isStartingStep ? 'TRUE' : 'FALSE'
      }
    });

  } catch (error) {
    console.error('Update Step API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update step' 
    }, { status: 500 });
  }
}

// 刪除步驟
export async function DELETE(request, { params }) {
  try {
    const { campaignId, stepId } = await params;

    // 獲取現有步驟資料
    const stepsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventSteps!A:G',
    });

    const stepsData = stepsResponse.data.values || [];
    
    if (stepsData.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Step not found' 
      }, { status: 404 });
    }

    // 找到要刪除的步驟行
    const stepRowIndex = stepsData.findIndex((row, index) => 
      index > 0 && row[0] === stepId && row[1] === campaignId
    );

    if (stepRowIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Step not found' 
      }, { status: 404 });
    }

    // 檢查是否有相關的選項
    const [optionsResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventOptions!A:J',
      })
    ]);

    const optionsData = optionsResponse.data.values || [];

    // 檢查是否有相關選項
    const hasRelatedOptions = optionsData.slice(1).some(row => 
      row[1] === stepId || row[2] === stepId // Source_Step_ID 或 Target_Step_ID
    );

    if (hasRelatedOptions) {
      return Response.json({ 
        success: false, 
        error: '無法刪除：此步驟包含相關選項。請先刪除相關選項。' 
      }, { status: 400 });
    }

    // 刪除步驟行
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getSheetId('EventSteps'),
                dimension: 'ROWS',
                startIndex: stepRowIndex,
                endIndex: stepRowIndex + 1
              }
            }
          }
        ]
      }
    });

    return Response.json({
      success: true,
      message: 'Step deleted successfully'
    });

  } catch (error) {
    console.error('Delete Step API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete step' 
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