import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 獲取所有戰役
export async function GET(request) {
  try {
    // 獲取相關資料表
    const [campaignsResponse, stepsResponse, optionsResponse, progressResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventCampaigns!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventSteps!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventOptions!A:J',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'CampaignProgress!A:H',
      }).catch(() => ({ data: { values: [] } }))
    ]);

    const campaignsData = campaignsResponse.data.values || [];
    const stepsData = stepsResponse.data.values || [];
    const optionsData = optionsResponse.data.values || [];
    const progressData = progressResponse.data.values || [];

    if (campaignsData.length < 2) {
      return Response.json({
        success: true,
        data: []
      });
    }

    // 解析戰役資料
    const campaignHeaders = campaignsData[0];
    const campaigns = campaignsData.slice(1).map(row => {
      const campaign = {};
      campaignHeaders.forEach((header, index) => {
        campaign[header] = row[index] || '';
      });
      return campaign;
    });

    // 統計每個戰役的步驟數、選項數、玩家數
    const enrichedCampaigns = campaigns.map(campaign => {
      // 計算步驟數
      const stepCount = stepsData.slice(1).filter(row => 
        row[1] === campaign.Campaign_ID
      ).length;

      // 計算選項數
      const optionCount = optionsData.slice(1).filter(row => {
        const sourceStepId = row[1]; // Source_Step_ID
        return stepsData.slice(1).some(stepRow => 
          stepRow[0] === sourceStepId && stepRow[1] === campaign.Campaign_ID
        );
      }).length;

      // 計算玩家數
      const playerCount = progressData.slice(1).filter(row => 
        row[2] === campaign.Campaign_ID
      ).length;

      return {
        ...campaign,
        stepCount,
        optionCount,
        playerCount
      };
    });

    return Response.json({
      success: true,
      data: enrichedCampaigns
    });

  } catch (error) {
    console.error('GM Campaigns API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch campaigns' 
    }, { status: 500 });
  }
}

// 創建新戰役
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, allowedFactions, allowedCharacters, isAvailable } = body;

    if (!name || !description) {
      return Response.json({ 
        success: false, 
        error: 'Name and description are required' 
      }, { status: 400 });
    }

    // 生成新的戰役 ID
    const campaignId = `CAMP-${Date.now()}`;
    const currentDate = new Date().toISOString().split('T')[0];

    // 準備新戰役資料
    const newCampaignRow = [
      campaignId,
      name,
      description,
      allowedFactions || '',
      allowedCharacters || '',
      isAvailable ? 'TRUE' : 'FALSE',
      currentDate
    ];

    // 添加到 EventCampaigns 表
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventCampaigns!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newCampaignRow]
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
        Is_Available: isAvailable ? 'TRUE' : 'FALSE',
        Created_Date: currentDate
      }
    });

  } catch (error) {
    console.error('Create Campaign API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create campaign' 
    }, { status: 500 });
  }
}