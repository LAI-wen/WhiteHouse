/**
 * Google Sheets 結構創建腳本
 * 
 * 使用方法：
 * 1. 確保 credentials.json 在專案根目錄
 * 2. 設定 SPREADSHEET_ID 環境變數
 * 3. 執行：node scripts/create-sheets-structure.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// 讀取憑證
const credentialsPath = path.join(process.cwd(), 'credentials.json');
if (!fs.existsSync(credentialsPath)) {
  console.error('❌ credentials.json 不存在，請先設置 Google API 憑證');
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

if (!SPREADSHEET_ID) {
  console.error('❌ 請設定 SPREADSHEET_ID 環境變數');
  process.exit(1);
}

// 工作表結構定義
const SHEET_STRUCTURES = {
  'Characters': [
    'Character_ID', 'Player_Discord_ID', 'Character_Name', 'Username', 'Password',
    'Public_Faction', 'True_Faction', 'HP', 'Max_HP', 'SAN', 'Max_SAN',
    'AP', 'BP', 'STR', 'CON', 'DEX', 'APP', 'INT', 'LUCK',
    'Good_Boy_Points', 'Performance_Points', 'Background_Story'
  ],
  
  'Items': [
    'Item_ID', 'Item_Name', 'Item_Description', 'Is_Clue',
    'Category', 'Image_URL', 'Special_Effect'
  ],
  
  'Inventory': [
    'Inventory_ID', 'Owner_Character_ID', 'Item_ID', 'Quantity',
    'Obtained_Date', 'Obtained_Method'
  ],
  
  'Events': [
    'Step_ID', 'Campaign_ID', 'Event_Name', 'Step_Title',
    'Step_Description', 'Image_URL', 'Is_Starting_Step'
  ],
  
  'EventOptions': [
    'Option_ID', 'Source_Step_ID', 'Target_Step_ID', 'Option_Text',
    'Req_Stat_Name', 'Req_Stat_Operator', 'Req_Stat_Value', 'Req_Item_ID',
    'Requirement_Text', 'Max_Uses_Per_Player', 'Option_Category'
  ],
  
  'EventOutcomes': [
    'Outcome_ID', 'Trigger_Option_ID', 'Outcome_Type', 'Outcome_Target',
    'Outcome_Value', 'Outcome_Description', 'Discord_Message'
  ],
  
  'PlayerChoiceHistory': [
    'Choice_ID', 'Character_ID', 'Campaign_ID', 'Session_ID',
    'Step_ID', 'Option_ID', 'Choice_Result', 'Chosen_At', 'Previous_Choice_ID'
  ],
  
  'Notifications': [
    'Notification_ID', 'Target_Type', 'Target_Value', 'Message_Title',
    'Message_Content', 'Message_Type', 'Created_Date', 'Is_Read', 'Priority'
  ]
};

// 需要更新的工作表
const UPDATE_STRUCTURES = {
  'CampaignProgress': [
    'Progress_ID', 'Character_ID', 'Campaign_ID', 'Session_ID',
    'Current_Step_ID', 'Started_At', 'Last_Updated', 'Version',
    'Status', 'Completion_Rate'
  ]
};

async function createWorksheet(title, headers) {
  try {
    console.log(`📝 創建工作表: ${title}`);
    
    // 創建工作表
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          addSheet: {
            properties: {
              title: title
            }
          }
        }]
      }
    });

    // 添加標題行
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${title}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });

    console.log(`✅ 工作表 ${title} 創建完成`);
    return true;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`⚠️  工作表 ${title} 已存在，跳過創建`);
      return false;
    } else {
      console.error(`❌ 創建工作表 ${title} 失敗:`, error.message);
      return false;
    }
  }
}

async function updateWorksheet(title, headers) {
  try {
    console.log(`🔄 更新工作表結構: ${title}`);
    
    // 更新標題行
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${title}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers]
      }
    });

    console.log(`✅ 工作表 ${title} 結構更新完成`);
    return true;
  } catch (error) {
    console.error(`❌ 更新工作表 ${title} 失敗:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 開始設置 Google Sheets 結構...\n');
  
  let successCount = 0;
  let totalCount = 0;

  // 創建新工作表
  console.log('📋 創建新工作表...');
  for (const [sheetName, headers] of Object.entries(SHEET_STRUCTURES)) {
    totalCount++;
    const success = await createWorksheet(sheetName, headers);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // 避免API限制
  }

  // 更新現有工作表
  console.log('\n🔄 更新現有工作表結構...');
  for (const [sheetName, headers] of Object.entries(UPDATE_STRUCTURES)) {
    totalCount++;
    const success = await updateWorksheet(sheetName, headers);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎉 設置完成！成功處理 ${successCount}/${totalCount} 個工作表`);
  
  if (successCount === totalCount) {
    console.log('\n✅ 所有工作表結構已正確設置');
    console.log('📋 請檢查你的 Google Sheets 並開始測試應用功能');
  } else {
    console.log('\n⚠️  部分工作表處理失敗，請檢查錯誤訊息');
  }

  console.log('\n📖 接下來請執行：');
  console.log('   npm run dev');
  console.log('   開啟 http://localhost:3000 進行測試');
}

main().catch(console.error);