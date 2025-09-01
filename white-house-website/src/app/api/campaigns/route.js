import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return Response.json({ 
        success: false, 
        error: 'Character ID is required' 
      }, { status: 400 });
    }
    
    // 獲取所有需要的資料表
    const [campaignsResponse, charactersResponse, progressResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventCampaigns!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Characters!A:V',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'CampaignProgress!A:H',
      }).catch(() => ({ data: { values: [] } }))
    ]);

    const campaignsData = campaignsResponse.data.values || [];
    const charactersData = charactersResponse.data.values || [];
    const progressData = progressResponse.data.values || [];

    if (campaignsData.length < 2) {
      return Response.json({
        success: true,
        data: {
          availableCampaigns: [],
          inProgressCampaigns: [],
          completedCampaigns: [],
          stats: { total: 0, available: 0, inProgress: 0, completed: 0 }
        }
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

    // 獲取角色資料
    const characterHeaders = charactersData[0] || [];
    const characterObj = {};
    if (charactersData.length > 1) {
      const characterRow = charactersData.find(row => row[0] === characterId);
      if (characterRow) {
        characterHeaders.forEach((header, index) => {
          characterObj[header] = characterRow[index] || '';
        });
      }
    }

    // 解析進度資料
    const progressHeaders = progressData[0] || [];
    const playerProgress = (progressData.slice(1) || []).map(row => {
      const progress = {};
      progressHeaders.forEach((header, index) => {
        progress[header] = row[index] || '';
      });
      return progress;
    }).filter(progress => progress.Character_ID === characterId);

    // 檢查戰役可用性
    const availableCampaigns = [];
    const inProgressCampaigns = [];
    const completedCampaigns = [];

    campaigns.forEach(campaign => {
      if (campaign.Is_Available !== 'TRUE') return;

      // 檢查角色/陣營限制
      const allowedFactions = campaign.Allowed_Factions ? campaign.Allowed_Factions.split(',').map(f => f.trim()) : [];
      const allowedCharacters = campaign.Allowed_Characters ? campaign.Allowed_Characters.split(',').map(c => c.trim()) : [];
      
      console.log('陣營檢查資訊:', {
        campaignId: campaign.Campaign_ID,
        allowedFactions,
        allowedCharacters,
        characterFaction: characterObj.Faction,
        characterPublicFaction: characterObj.Public_Faction,
        characterTrueFaction: characterObj.True_Faction,
        characterId,
        allCharacterFields: Object.keys(characterObj)
      });
      
      const hasAccess = (
        allowedFactions.length === 0 && allowedCharacters.length === 0
      ) || (
        allowedFactions.includes(characterObj.Faction) ||
        allowedFactions.includes(characterObj.Public_Faction) ||
        allowedFactions.includes(characterObj.True_Faction) ||
        allowedCharacters.includes(characterId)
      );

      if (!hasAccess) return;

      // 檢查進度狀態
      const progress = playerProgress.find(p => p.Campaign_ID === campaign.Campaign_ID);
      
      if (!progress) {
        // 沒有進度記錄 = 可開始的戰役
        availableCampaigns.push({
          ...campaign,
          status: 'available',
          buttonText: '開始戰役'
        });
      } else if (progress.Is_Completed === 'TRUE') {
        // 已完成的戰役
        completedCampaigns.push({
          ...campaign,
          progress: progress,
          status: 'completed',
          buttonText: '重新遊玩'
        });
      } else {
        // 進行中的戰役
        inProgressCampaigns.push({
          ...campaign,
          progress: progress,
          status: 'in_progress',
          buttonText: '繼續戰役'
        });
      }
    });

    const stats = {
      total: campaigns.length,
      available: availableCampaigns.length,
      inProgress: inProgressCampaigns.length,
      completed: completedCampaigns.length
    };

    return Response.json({
      success: true,
      data: {
        availableCampaigns,
        inProgressCampaigns,
        completedCampaigns,
        stats
      }
    });

  } catch (error) {
    console.error('Campaigns API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch campaigns data' 
    }, { status: 500 });
  }
}