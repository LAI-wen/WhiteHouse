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
    // 獲取所有相關資料表
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

    // 統計數據
    const totalPlayers = Math.max(0, charactersData.length - 1); // 扣除表頭
    const totalCampaigns = Math.max(0, campaignsData.length - 1);
    
    // 統計進行中和已完成的戰役
    let activeCampaigns = 0;
    let completedCampaigns = 0;
    
    if (progressData.length > 1) {
      const progressHeaders = progressData[0];
      const progressRows = progressData.slice(1);
      
      progressRows.forEach(row => {
        const isCompleted = row[4] === 'TRUE'; // Is_Completed 欄位
        if (isCompleted) {
          completedCampaigns++;
        } else {
          activeCampaigns++;
        }
      });
    }

    // 最近活動 (從 CampaignProgress 表獲取)
    const recentActivities = [];
    if (progressData.length > 1 && charactersData.length > 1) {
      const progressHeaders = progressData[0];
      const characterHeaders = charactersData[0];
      const progressRows = progressData.slice(1);
      const characterRows = charactersData.slice(1);
      
      // 取最近5個活動
      const sortedProgress = progressRows
        .map(row => {
          const progress = {};
          progressHeaders.forEach((header, index) => {
            progress[header] = row[index] || '';
          });
          return progress;
        })
        .sort((a, b) => new Date(b.Started_Date || 0) - new Date(a.Started_Date || 0))
        .slice(0, 5);

      sortedProgress.forEach(progress => {
        const character = characterRows.find(char => char[0] === progress.Character_ID);
        if (character) {
          const characterName = character[2] || character[0]; // Character_Name 或 Character_ID
          const campaignName = campaignsData.slice(1).find(camp => camp[0] === progress.Campaign_ID)?.[1] || progress.Campaign_ID;
          
          let action;
          if (progress.Is_Completed === 'TRUE') {
            action = `完成了戰役「${campaignName}」`;
          } else {
            action = `開始了戰役「${campaignName}」`;
          }
          
          recentActivities.push({
            playerName: characterName,
            action: action,
            timestamp: progress.Started_Date || new Date().toISOString()
          });
        }
      });
    }

    return Response.json({
      success: true,
      data: {
        totalPlayers,
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        recentActivities
      }
    });

  } catch (error) {
    console.error('GM Dashboard API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch GM dashboard data' 
    }, { status: 500 });
  }
}