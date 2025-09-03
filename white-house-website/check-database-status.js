/**
 * 全面檢查 Google Sheets 資料庫狀況
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const credentials = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'credentials.json'), 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

async function checkDatabase() {
  console.log('🔍 全面檢查 Google Sheets 資料庫狀況');
  console.log('=' .repeat(60));
  
  try {
    // 1. 獲取所有工作表列表
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });
    
    const allSheets = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    console.log('📋 現有工作表:', allSheets.join(', '));
    
    // 2. 檢查關鍵工作表
    const keySheets = ['Events', 'EventOptions', 'EventOutcomes', 'CampaignProgress', 'PlayerChoiceHistory'];
    const missingSheets = [];
    
    for (const sheetName of keySheets) {
      if (allSheets.includes(sheetName)) {
        console.log(`✅ ${sheetName} 存在`);
        
        // 檢查每個工作表的內容
        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${sheetName}!A:Z`
          });
          
          const data = response.data.values || [];
          console.log(`   📊 ${sheetName}: ${data.length > 0 ? data.length - 1 : 0} 筆資料`);
          
          if (data.length > 0) {
            console.log(`   📝 標題行: [${data[0].join(', ')}]`);
            
            // 特別檢查 Events 表
            if (sheetName === 'Events' && data.length > 1) {
              console.log('   🎯 Events 詳細檢查:');
              const headers = data[0];
              data.slice(1).forEach((row, index) => {
                const eventObj = {};
                headers.forEach((header, i) => {
                  eventObj[header] = row[i] || '';
                });
                console.log(`      ${index + 1}. Step_ID: ${eventObj.Step_ID}, Campaign_ID: ${eventObj.Campaign_ID}, Is_Starting_Step: ${eventObj.Is_Starting_Step}`);
              });
            }
          }
        } catch (error) {
          console.log(`   ❌ 讀取 ${sheetName} 失敗: ${error.message}`);
        }
      } else {
        missingSheets.push(sheetName);
        console.log(`❌ ${sheetName} 缺失`);
      }
    }
    
    // 3. 檢查戰役相關資料
    console.log('\n🎮 戰役資料檢查:');
    
    // 檢查是否有 CAMP-LIB 戰役
    if (allSheets.includes('Events')) {
      const eventsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Events!A:Z'
      });
      
      const eventsData = eventsResponse.data.values || [];
      if (eventsData.length > 1) {
        const headers = eventsData[0];
        const campLibEvents = eventsData.slice(1).filter(row => {
          const eventObj = {};
          headers.forEach((header, i) => {
            eventObj[header] = row[i] || '';
          });
          return eventObj.Campaign_ID === 'CAMP-LIB';
        });
        
        console.log(`   📊 CAMP-LIB 戰役事件數: ${campLibEvents.length}`);
        
        const startingSteps = campLibEvents.filter(row => {
          const eventObj = {};
          headers.forEach((header, i) => {
            eventObj[header] = row[i] || '';
          });
          return eventObj.Is_Starting_Step === 'TRUE';
        });
        
        console.log(`   🚀 CAMP-LIB 起始步驟數: ${startingSteps.length}`);
      }
    }
    
    // 4. 建議修正方案
    console.log('\n💡 建議修正方案:');
    
    if (missingSheets.length > 0) {
      console.log(`   🔧 需要創建工作表: ${missingSheets.join(', ')}`);
    }
    
    console.log('   🔧 運行 npm run setup-sheets 重新設置結構');
    console.log('   🔧 檢查所有戰役 ID 是否一致 (CAMP-LIB vs LIBRARY_MYSTERY)');
    console.log('   🔧 確保每個戰役都有起始步驟 (Is_Starting_Step=TRUE)');
    
  } catch (error) {
    console.error('❌ 檢查資料庫失敗:', error.message);
  }
}

checkDatabase();