import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 創建新步驟
export async function POST(request, { params }) {
  try {
    const { campaignId } = await params;
    const body = await request.json();
    const { title, description, imageUrl, isStartingStep } = body;

    if (!title || !description) {
      return Response.json({ 
        success: false, 
        error: 'Title and description are required' 
      }, { status: 400 });
    }

    // 生成新的步驟 ID
    const stepId = `${campaignId}-${Date.now()}`;
    const currentDate = new Date().toISOString().split('T')[0];

    // 準備新步驟資料
    const newStepRow = [
      stepId,
      campaignId,
      title,
      description,
      imageUrl || '',
      isStartingStep ? 'TRUE' : 'FALSE',
      currentDate
    ];

    // 添加到 EventSteps 表
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventSteps!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [newStepRow]
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
        Is_Starting_Step: isStartingStep ? 'TRUE' : 'FALSE',
        Created_Date: currentDate
      }
    });

  } catch (error) {
    console.error('Create Step API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create step' 
    }, { status: 500 });
  }
}