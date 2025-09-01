import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 獲取戰役設計資料
export async function GET(request, { params }) {
  try {
    const { campaignId } = await params;

    // 獲取所有相關資料表
    const [campaignsResponse, stepsResponse, optionsResponse, outcomesResponse] = await Promise.all([
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
        range: 'EventOutcomes!A:G',
      })
    ]);

    const campaignsData = campaignsResponse.data.values || [];
    const stepsData = stepsResponse.data.values || [];
    const optionsData = optionsResponse.data.values || [];
    const outcomesData = outcomesResponse.data.values || [];

    // 查找指定戰役
    const campaignHeaders = campaignsData[0] || [];
    const campaign = campaignsData.slice(1).find(row => row[0] === campaignId);
    
    if (!campaign) {
      return Response.json({ 
        success: false, 
        error: 'Campaign not found' 
      }, { status: 404 });
    }

    // 解析戰役資料
    const campaignObj = {};
    campaignHeaders.forEach((header, index) => {
      campaignObj[header] = campaign[index] || '';
    });

    // 解析步驟資料 (只包含該戰役的步驟)
    const stepHeaders = stepsData[0] || [];
    const steps = stepsData.slice(1)
      .filter(row => row[1] === campaignId) // Campaign_ID 篩選
      .map(row => {
        const step = {};
        stepHeaders.forEach((header, index) => {
          step[header] = row[index] || '';
        });
        return step;
      });

    // 解析選項資料 (只包含該戰役相關的選項)
    const optionHeaders = optionsData[0] || [];
    const campaignStepIds = steps.map(step => step.Step_ID);
    const options = optionsData.slice(1)
      .filter(row => campaignStepIds.includes(row[1])) // Source_Step_ID 篩選
      .map(row => {
        const option = {};
        optionHeaders.forEach((header, index) => {
          option[header] = row[index] || '';
        });
        return option;
      });

    // 解析結果資料 (只包含該戰役相關的結果)
    const outcomeHeaders = outcomesData[0] || [];
    const campaignOptionIds = options.map(option => option.Option_ID);
    const outcomes = outcomesData.slice(1)
      .filter(row => campaignOptionIds.includes(row[1])) // Trigger_Option_ID 篩選
      .map(row => {
        const outcome = {};
        outcomeHeaders.forEach((header, index) => {
          outcome[header] = row[index] || '';
        });
        return outcome;
      });

    return Response.json({
      success: true,
      data: {
        campaign: campaignObj,
        steps,
        options,
        outcomes
      }
    });

  } catch (error) {
    console.error('Campaign Design API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch campaign design data' 
    }, { status: 500 });
  }
}