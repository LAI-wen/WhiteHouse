import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 更新戰役
export async function PUT(request, { params }) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { name, description, allowedFactions, allowedCharacters, isAvailable } = body;

    if (!name || !description) {
      return Response.json({ 
        success: false, 
        error: 'Name and description are required' 
      }, { status: 400 });
    }

    // 獲取現有戰役資料
    const campaignsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventCampaigns!A:G',
    });

    const campaignsData = campaignsResponse.data.values || [];
    
    if (campaignsData.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, { status: 404 });
    }

    // 找到要更新的戰役行
    const campaignRowIndex = campaignsData.findIndex((row, index) => 
      index > 0 && row[0] === campaignId
    );

    if (campaignRowIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, { status: 404 });
    }

    // 準備更新的資料
    const updatedRow = [
      campaignId,
      name,
      description,
      allowedFactions || '',
      allowedCharacters || '',
      isAvailable ? 'TRUE' : 'FALSE',
      campaignsData[campaignRowIndex][6] || new Date().toISOString().split('T')[0] // 保持原創建日期
    ];

    // 更新 Google Sheets
    const updateRange = `EventCampaigns!A${campaignRowIndex + 1}:G${campaignRowIndex + 1}`;
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
        Campaign_ID: campaignId,
        Campaign_Name: name,
        Campaign_Description: description,
        Allowed_Factions: allowedFactions || '',
        Allowed_Characters: allowedCharacters || '',
        Is_Available: isAvailable ? 'TRUE' : 'FALSE'
      }
    });

  } catch (error) {
    console.error('Update Campaign API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to update campaign' 
    }, { status: 500 });
  }
}

// 刪除戰役
export async function DELETE(request, { params }) {
  try {
    const { campaignId } = await params;

    // 獲取現有戰役資料
    const campaignsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventCampaigns!A:G',
    });

    const campaignsData = campaignsResponse.data.values || [];
    
    if (campaignsData.length < 2) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, { status: 404 });
    }

    // 找到要刪除的戰役行
    const campaignRowIndex = campaignsData.findIndex((row, index) => 
      index > 0 && row[0] === campaignId
    );

    if (campaignRowIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, { status: 404 });
    }

    // 檢查是否有相關的步驟、選項、或玩家進度
    const [stepsResponse, progressResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventSteps!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'CampaignProgress!A:H',
      }).catch(() => ({ data: { values: [] } }))
    ]);

    const stepsData = stepsResponse.data.values || [];
    const progressData = progressResponse.data.values || [];

    // 檢查是否有相關步驟
    const hasSteps = stepsData.slice(1).some(row => row[1] === campaignId);
    
    // 檢查是否有玩家進度
    const hasProgress = progressData.slice(1).some(row => row[2] === campaignId);

    if (hasSteps || hasProgress) {
      return Response.json({ 
        success: false, 
        error: '無法刪除：此戰役包含步驟或有玩家進度記錄。請先清理相關資料。' 
      }, { status: 400 });
    }

    // 刪除戰役行
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: await getSheetId('EventCampaigns'),
                dimension: 'ROWS',
                startIndex: campaignRowIndex,
                endIndex: campaignRowIndex + 1
              }
            }
          }
        ]
      }
    });

    return Response.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Delete Campaign API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to delete campaign' 
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
    return 0; // 默認返回第一個工作表的ID
  }
}