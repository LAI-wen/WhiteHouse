/**
 * 資料庫結構更新腳本
 * 統一所有工作表的結構和欄位
 */

const { google } = require('googleapis');

// 設定認證
const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    require('./credentials.json'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 標準化工作表結構定義
const STANDARD_SHEETS = {
  // === 核心遊戲資料表 ===
  'Characters': {
    headers: [
      'Character_ID', 'Player_Discord_ID', 'Character_Name', 'Username', 'Password',
      'Public_Faction', 'True_Faction', 'HP', 'Max_HP', 'SAN', 'Max_SAN',
      'AP', 'BP', 'STR', 'CON', 'DEX', 'APP', 'INT', 'LUCK',
      'Good_Boy_Points', 'Performance_Points', 'Background_Story', 
      'Personal_Notes', 'Last_Active', 'Created_Date', 'Updated_Date'
    ],
    range: 'A:Z'
  },

  'EventCampaigns': {
    headers: [
      'Campaign_ID', 'Campaign_Name', 'Campaign_Description', 
      'Allowed_Factions', 'Allowed_Characters', 'Is_Available', 'Created_Date'
    ],
    range: 'A:G'
  },

  'Events': {  // 統一使用Events，不再使用EventSteps
    headers: [
      'Step_ID', 'Campaign_ID', 'Step_Title', 'Step_Description', 
      'Image_URL', 'Is_Starting_Step', 'Created_Date'
    ],
    range: 'A:G'
  },

  'EventOptions': {
    headers: [
      'Option_ID', 'Source_Step_ID', 'Target_Step_ID', 'Option_Text',
      'Req_Stat_Name', 'Req_Stat_Operator', 'Req_Stat_Value', 'Req_Item_ID',
      'Requirement_Text', 'Is_Available', 'Max_Uses_Per_Player'
    ],
    range: 'A:K'
  },

  'EventOutcomes': {
    headers: [
      'Outcome_ID', 'Trigger_Option_ID', 'Outcome_Type', 'Outcome_Target',
      'Outcome_Value', 'Outcome_Description', 'Discord_Message'
    ],
    range: 'A:G'
  },

  // === 進度追蹤系統 ===
  'CampaignProgress': {
    headers: [
      'Progress_ID', 'Character_ID', 'Campaign_ID', 'Session_ID',
      'Current_Step_ID', 'Started_At', 'Last_Updated', 'Version', 
      'Status', 'Completion_Rate'
    ],
    range: 'A:J'
  },

  'PlayerChoiceHistory': {
    headers: [
      'Choice_ID', 'Character_ID', 'Campaign_ID', 'Session_ID',
      'Step_ID', 'Option_ID', 'Choice_Result', 'Timestamp', 'Previous_Choice_ID'
    ],
    range: 'A:I'
  },

  // === 物品系統 ===
  'Items': {
    headers: [
      'Item_ID', 'Item_Name', 'Item_Description', 'Item_Type',
      'Item_Value', 'Is_Consumable', 'Created_Date'
    ],
    range: 'A:G'
  },

  'Inventory': {
    headers: [
      'Character_ID', 'Item_ID', 'Quantity', 'Obtained_Date',
      'Obtained_Method', 'Notes', 'Last_Used', 'Updated_Date'
    ],
    range: 'A:H'
  },

  // === 會話管理 ===
  'CampaignSessions': {
    headers: [
      'Session_ID', 'Campaign_ID', 'Started_At', 'Ended_At',
      'Duration_MS', 'Total_Players', 'Total_Actions', 'End_Reason', 'Session_Stats'
    ],
    range: 'A:I'
  },

  'CharacterChangelog': {
    headers: [
      'Change_ID', 'Character_ID', 'Change_Type', 'Target_Field',
      'Old_Value', 'New_Value', 'Timestamp', 'Source'
    ],
    range: 'A:H'
  },

  // === 內容管理 ===
  'Players': {
    headers: [
      'Player_ID', 'Discord_ID', 'Discord_Name', 'Join_Date',
      'Status', 'Notes', 'Last_Active', 'Permission_Level'
    ],
    range: 'A:H'
  },

  'Quests': {
    headers: [
      'Quest_ID', 'Quest_Title', 'Quest_Description', 'Quest_Reward',
      'Is_Active', 'Created_Date', 'Completion_Count'
    ],
    range: 'A:G'
  },

  'Announcements': {
    headers: [
      'Announcement_ID', 'Title', 'Content', 'Author',
      'Created_Date', 'Is_Active'
    ],
    range: 'A:F'
  },

  'FAQ': {
    headers: [
      'FAQ_ID', 'Question', 'Answer', 'Created_Date'
    ],
    range: 'A:D'
  }
};

// 需要移除的過期工作表
const DEPRECATED_SHEETS = ['EventSteps', 'PlayerChoices'];

async function updateDatabaseStructure() {
  console.log('🚀 開始更新資料庫結構...');
  
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error('SPREADSHEET_ID environment variable is required');
    }

    // 1. 獲取目前的試算表資訊
    console.log('📋 檢查目前試算表結構...');
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets.map(sheet => sheet.properties.title);
    
    console.log(`📊 找到 ${existingSheets.length} 個現有工作表:`, existingSheets);

    // 2. 處理需要移除的過期工作表
    for (const deprecatedSheet of DEPRECATED_SHEETS) {
      if (existingSheets.includes(deprecatedSheet)) {
        console.log(`🗑️  發現過期工作表: ${deprecatedSheet}`);
        
        // 先檢查是否有資料需要遷移
        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${deprecatedSheet}!A:Z`
          });
          
          const data = response.data.values || [];
          if (data.length > 1) {
            console.log(`⚠️  ${deprecatedSheet} 包含 ${data.length - 1} 筆資料，需要手動檢查是否要遷移`);
            console.log(`   建議：檢查 ${deprecatedSheet} 的資料是否已遷移至對應的新表格`);
          }
        } catch (error) {
          console.log(`   ${deprecatedSheet} 讀取失敗，可能已經是空表格`);
        }
      }
    }

    // 3. 建立或更新標準工作表
    let updatedSheets = 0;
    let createdSheets = 0;

    for (const [sheetName, sheetConfig] of Object.entries(STANDARD_SHEETS)) {
      console.log(`\n📝 處理工作表: ${sheetName}`);
      
      if (existingSheets.includes(sheetName)) {
        // 更新現有工作表的標題行
        console.log(`   更新現有工作表: ${sheetName}`);
        
        try {
          // 檢查目前的標題行
          const currentHeaders = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!1:1`
          });
          
          const existingHeaders = currentHeaders.data.values?.[0] || [];
          const newHeaders = sheetConfig.headers;
          
          if (JSON.stringify(existingHeaders) !== JSON.stringify(newHeaders)) {
            console.log(`   📋 更新標題行 (${existingHeaders.length} -> ${newHeaders.length} 欄)`);
            
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${sheetName}!1:1`,
              valueInputOption: 'RAW',
              resource: { values: [newHeaders] }
            });
            
            console.log(`   ✅ ${sheetName} 標題行已更新`);
            updatedSheets++;
          } else {
            console.log(`   ✓ ${sheetName} 標題行已是最新版本`);
          }
          
        } catch (error) {
          console.error(`   ❌ 更新 ${sheetName} 失敗:`, error.message);
        }
        
      } else {
        // 建立新工作表
        console.log(`   建立新工作表: ${sheetName}`);
        
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
              requests: [{
                addSheet: {
                  properties: {
                    title: sheetName
                  }
                }
              }]
            }
          });
          
          // 設定標題行
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!1:1`,
            valueInputOption: 'RAW',
            resource: { values: [sheetConfig.headers] }
          });
          
          console.log(`   ✅ ${sheetName} 已建立並設定標題行`);
          createdSheets++;
          
        } catch (error) {
          console.error(`   ❌ 建立 ${sheetName} 失敗:`, error.message);
        }
      }
    }

    // 4. 生成標準化常數檔案
    console.log('\n📄 生成標準化常數檔案...');
    const constantsContent = generateConstantsFile();
    require('fs').writeFileSync('./src/lib/sheetConstants.js', constantsContent);
    console.log('✅ src/lib/sheetConstants.js 已生成');

    // 5. 總結
    console.log('\n' + '='.repeat(60));
    console.log('📊 資料庫結構更新完成');
    console.log('='.repeat(60));
    console.log(`✅ 建立新工作表: ${createdSheets}`);
    console.log(`📝 更新現有工作表: ${updatedSheets}`);
    console.log(`📋 標準工作表總數: ${Object.keys(STANDARD_SHEETS).length}`);
    
    if (DEPRECATED_SHEETS.some(sheet => existingSheets.includes(sheet))) {
      console.log('\n⚠️  手動檢查事項:');
      DEPRECATED_SHEETS.forEach(sheet => {
        if (existingSheets.includes(sheet)) {
          console.log(`   - 檢查 ${sheet} 是否可以安全刪除`);
        }
      });
    }

    console.log('\n🎯 下一步建議:');
    console.log('   1. 檢查所有API是否使用新的工作表結構');
    console.log('   2. 更新API檔案中的表名和範圍');
    console.log('   3. 執行API測試確保功能正常');
    console.log('   4. 考慮清理過期的工作表');

  } catch (error) {
    console.error('💥 資料庫結構更新失敗:', error);
    process.exit(1);
  }
}

function generateConstantsFile() {
  const ranges = Object.entries(STANDARD_SHEETS)
    .map(([name, config]) => `  ${name.toUpperCase()}: '${name}!${config.range}'`)
    .join(',\n');

  return `/**
 * 標準化Google Sheets工作表範圍常數
 * 自動生成，請勿手動修改
 * 生成時間: ${new Date().toISOString()}
 */

export const SHEET_RANGES = {
${ranges}
};

// 工作表名稱常數
export const SHEET_NAMES = {
${Object.keys(STANDARD_SHEETS).map(name => `  ${name.toUpperCase()}: '${name}'`).join(',\n')}
};

// 標準欄位定義
export const SHEET_HEADERS = {
${Object.entries(STANDARD_SHEETS).map(([name, config]) => 
  `  ${name.toUpperCase()}: ${JSON.stringify(config.headers)}`
).join(',\n')}
};

// 輔助函數
export function getSheetRange(sheetName) {
  const upperName = sheetName.toUpperCase();
  return SHEET_RANGES[upperName] || \`\${sheetName}!A:Z\`;
}

export function getSheetHeaders(sheetName) {
  const upperName = sheetName.toUpperCase();
  return SHEET_HEADERS[upperName] || [];
}
`;
}

// 執行更新
if (require.main === module) {
  updateDatabaseStructure()
    .then(() => {
      console.log('✅ 資料庫結構更新完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 更新失敗:', error);
      process.exit(1);
    });
}

module.exports = { updateDatabaseStructure, STANDARD_SHEETS };