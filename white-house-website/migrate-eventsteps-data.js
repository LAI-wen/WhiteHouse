/**
 * EventSteps 資料遷移到 Events 工作表
 */

const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    require('./credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function migrateEventStepsData() {
  console.log('🔄 開始遷移 EventSteps 資料到 Events...');
  
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    // 1. 讀取 EventSteps 的資料
    console.log('📖 讀取 EventSteps 資料...');
    const eventStepsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'EventSteps!A:G'
    });
    
    const eventStepsData = eventStepsResponse.data.values || [];
    console.log(`📊 EventSteps 包含 ${eventStepsData.length} 筆記錄 (含標題行)`);
    
    if (eventStepsData.length <= 1) {
      console.log('✅ EventSteps 沒有資料需要遷移');
      return;
    }

    // 2. 讀取 Events 現有資料以避免重複
    console.log('📖 讀取 Events 現有資料...');
    const eventsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Events!A:G'
    });
    
    const eventsData = eventsResponse.data.values || [];
    const existingStepIds = new Set(eventsData.slice(1).map(row => row[0]));
    console.log(`📊 Events 已有 ${existingStepIds.size} 筆記錄`);

    // 3. 過濾要遷移的資料（避免重複）
    const headers = eventStepsData[0];
    const dataRows = eventStepsData.slice(1);
    
    const newRows = dataRows.filter(row => {
      const stepId = row[0];
      if (existingStepIds.has(stepId)) {
        console.log(`⏭️  跳過重複的 Step_ID: ${stepId}`);
        return false;
      }
      return true;
    });

    if (newRows.length === 0) {
      console.log('✅ 所有 EventSteps 資料已存在於 Events 中');
      return;
    }

    console.log(`📝 準備遷移 ${newRows.length} 筆新資料`);

    // 4. 遷移資料到 Events
    console.log('🚚 遷移資料到 Events...');
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Events!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: newRows
      }
    });

    console.log('✅ 資料遷移完成');

    // 5. 顯示遷移摘要
    console.log('\n' + '='.repeat(50));
    console.log('📋 遷移摘要:');
    console.log('='.repeat(50));
    console.log(`📦 EventSteps 總記錄: ${dataRows.length}`);
    console.log(`✨ 已存在於 Events: ${dataRows.length - newRows.length}`);
    console.log(`🆕 新增到 Events: ${newRows.length}`);
    
    if (newRows.length > 0) {
      console.log('\n🎯 遷移的資料:');
      newRows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row[0]} - ${row[2]} (${row[1]})`);
      });
    }

    console.log('\n✅ EventSteps 資料已安全遷移至 Events');
    console.log('💡 建議：檢查遷移結果後可刪除 EventSteps 工作表');

  } catch (error) {
    console.error('❌ 資料遷移失敗:', error);
    throw error;
  }
}

// 執行遷移
if (require.main === module) {
  migrateEventStepsData()
    .then(() => {
      console.log('🎉 EventSteps 資料遷移完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 遷移失敗:', error);
      process.exit(1);
    });
}

module.exports = { migrateEventStepsData };