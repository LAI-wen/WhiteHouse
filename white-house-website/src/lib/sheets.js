import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getSheetData(range) {
  const spreadsheetId = process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    return response.data.values;
  } catch (error) {
    console.error('The API returned an error:', error);
    return null;
  }
}

export async function getCharacterData() {
  const spreadsheetId = process.env.SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID_HERE';

  try {
    // 取得表頭
    const headerResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Characters!A1:W1',
    });

    // 取得資料
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Characters!A2:W',
    });

    const headers = headerResponse.data.values[0];
    const rows = dataResponse.data.values || [];

    // 將資料轉換成物件陣列
    return rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });

  } catch (error) {
    console.error('Get character data error:', error);
    return [];
  }
}

export function getGoogleSheetsClient() {
  return sheets;
}
