/**
 * 清理過期工作表腳本
 * 安全刪除 EventSteps 和 PlayerChoices 工作表
 */

const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    require('./credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function cleanupDeprecatedSheets() {
  console.log('🧹 開始清理過期工作表...');
  
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    
    // 1. 獲取試算表資訊
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const allSheets = spreadsheet.data.sheets;
    
    // 要清理的工作表
    const sheetsToDelete = ['EventSteps', 'PlayerChoices'];
    let deletedCount = 0;

    for (const sheetName of sheetsToDelete) {
      const sheetInfo = allSheets.find(s => s.properties.title === sheetName);
      
      if (!sheetInfo) {
        console.log(`ℹ️  ${sheetName} 工作表不存在，跳過`);
        continue;
      }

      const sheetId = sheetInfo.properties.sheetId;
      console.log(`\n🔍 檢查 ${sheetName} 工作表...`);

      // 2. 最後檢查是否有資料
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A:Z`
        });
        
        const data = response.data.values || [];
        const dataRows = data.slice(1); // 排除標題行
        
        if (dataRows.length > 0) {
          console.log(`⚠️  ${sheetName} 仍有 ${dataRows.length} 筆資料`);
          
          // 顯示前5筆資料作為確認
          console.log(`📋 前5筆資料預覽:`);
          dataRows.slice(0, 5).forEach((row, index) => {
            console.log(`   ${index + 1}. ${row[0]} - ${row[1] || 'N/A'}`);
          });

          console.log(`\n❓ 是否要刪除這個工作表？`);
          console.log(`   建議：確認這些資料已遷移到對應的新工作表`);
          console.log(`   - EventSteps -> Events`);
          console.log(`   - PlayerChoices -> PlayerChoiceHistory`);
          
          // 在生產環境中，這裡應該要求用戶確認
          // 為了安全起見，跳過刪除
          console.log(`🔒 為安全起見，保留 ${sheetName} 工作表`);
          console.log(`   手動確認資料遷移完成後，可手動刪除`);
          continue;
          
        } else {
          console.log(`✅ ${sheetName} 工作表為空，可以安全刪除`);
        }

      } catch (error) {
        console.log(`⚠️  無法讀取 ${sheetName}:`, error.message);
        continue;
      }

      // 3. 執行刪除
      try {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [{
              deleteSheet: {
                sheetId: sheetId
              }
            }]
          }
        });

        console.log(`🗑️  ${sheetName} 工作表已刪除`);
        deletedCount++;

      } catch (error) {
        console.error(`❌ 刪除 ${sheetName} 失敗:`, error.message);
      }
    }

    // 4. 總結
    console.log('\n' + '='.repeat(60));
    console.log('🧹 過期工作表清理完成');
    console.log('='.repeat(60));
    console.log(`🗑️  已刪除工作表: ${deletedCount}`);
    console.log(`📋 目標工作表: ${sheetsToDelete.length}`);
    
    if (deletedCount === 0) {
      console.log('\n💡 建議手動操作:');
      console.log('   1. 確認 EventSteps 的資料已完全遷移至 Events');
      console.log('   2. 確認 PlayerChoices 的資料已完全遷移至 PlayerChoiceHistory');
      console.log('   3. 手動刪除這些過期工作表');
    }

    console.log('\n✅ 資料庫清理流程完成');

  } catch (error) {
    console.error('💥 清理失敗:', error);
    throw error;
  }
}

// 執行清理
if (require.main === module) {
  cleanupDeprecatedSheets()
    .then(() => {
      console.log('🎉 過期工作表清理完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 清理失敗:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDeprecatedSheets };