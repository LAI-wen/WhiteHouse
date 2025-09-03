/**
 * 修正戰役資料問題
 * 1. 統一戰役ID
 * 2. 添加 CAMP-LIB 戰役資料
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

// 添加 CAMP-LIB 戰役資料
const CAMP_LIB_EVENTS = [
  ['LIB-START', 'CAMP-LIB', '深夜圖書室', '踏入禁區', '你悄悄推開圖書室的門，空氣中瀰漫著舊紙張和神秘的味道...', '', 'TRUE'],
  ['LIB-EXPLORE', 'CAMP-LIB', '深夜圖書室', '探索書架', '你在昏暗的燈光下看見一排排高聳的書架...', '', 'FALSE'],
  ['LIB-DESK', 'CAMP-LIB', '深夜圖書室', '管理員桌子', '你注意到管理員的桌子，上面散落著一些文件...', '', 'FALSE']
];

const CAMP_LIB_OPTIONS = [
  ['LIB-START-A', 'LIB-START', 'LIB-EXPLORE', 'A. 檢查附近的書架', 'INT', '>', '50', '', '[需要 INT > 50]', '1', 'exploration'],
  ['LIB-START-B', 'LIB-START', 'LIB-DESK', 'B. 前往管理員桌子', '', '', '', '', '', '1', 'investigation'],
  ['LIB-START-C', 'LIB-START', 'LIB-START', 'C. 小心聆聽周圍', 'LUCK', '>=', '30', '', '[需要 LUCK >= 30]', '3', 'caution']
];

const CAMP_LIB_OUTCOMES = [
  ['OUT-LIB-START-A', 'LIB-START-A', 'CHANGE_STAT', 'SAN', '-2', '你發現了一些令人不安的書籍', ''],
  ['OUT-LIB-START-B', 'LIB-START-B', 'CHANGE_STAT', 'SAN', '-1', '你在桌上發現了奇怪的文件', ''],
  ['OUT-LIB-START-C', 'LIB-START-C', 'CHANGE_STAT', 'SAN', '1', '你謹慎的行動讓你感到安心', '']
];

async function fixCampaignData() {
  try {
    console.log('🔧 開始修正戰役資料...');
    
    // 1. 添加 CAMP-LIB 事件資料
    console.log('📝 添加 CAMP-LIB 事件資料...');
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Events!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: { values: CAMP_LIB_EVENTS }
    });
    
    // 2. 添加 CAMP-LIB 選項資料
    console.log('📝 添加 CAMP-LIB 選項資料...');
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'EventOptions!A:K',
      valueInputOption: 'USER_ENTERED',
      resource: { values: CAMP_LIB_OPTIONS }
    });
    
    // 3. 添加 CAMP-LIB 結果資料
    console.log('📝 添加 CAMP-LIB 結果資料...');
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'EventOutcomes!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: { values: CAMP_LIB_OUTCOMES }
    });
    
    console.log('✅ CAMP-LIB 戰役資料已添加');
    
    // 4. 檢查角色資料是否有必要的屬性
    console.log('🔍 檢查角色資料...');
    const charactersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Characters!A:Z'
    });
    
    const charactersData = charactersResponse.data.values || [];
    if (charactersData.length > 0) {
      console.log(`📊 找到 ${charactersData.length - 1} 個角色`);
      console.log('📝 角色資料標題:', charactersData[0].slice(0, 10).join(', '));
      
      // 檢查是否有測試角色的數值
      if (charactersData.length > 1) {
        const headers = charactersData[0];
        const testCharacter = charactersData[1];
        const charObj = {};
        headers.forEach((header, i) => {
          charObj[header] = testCharacter[i] || '';
        });
        
        console.log('🧪 測試角色數值:');
        console.log(`   - INT: ${charObj.INT || 'N/A'}`);
        console.log(`   - LUCK: ${charObj.LUCK || 'N/A'}`);
        console.log(`   - SAN: ${charObj.SAN || 'N/A'}`);
      }
    } else {
      console.log('⚠️  沒有找到角色資料');
    }
    
    console.log('\n🎉 戰役資料修正完成！');
    console.log('📋 現在可以測試 CAMP-LIB 戰役了');
    
  } catch (error) {
    console.error('❌ 修正戰役資料失敗:', error.message);
  }
}

fixCampaignData();