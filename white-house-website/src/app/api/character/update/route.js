import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/**
 * 角色數值更新 API
 * 支援單一數值和批量數值更新，並記錄變更歷史
 */
export async function POST(request) {
  try {
    const { 
      characterId, 
      updates, 
      source = 'manual',
      reason = 'Character update'
    } = await request.json();

    if (!characterId) {
      return NextResponse.json(
        { success: false, error: '角色 ID 是必要的' },
        { status: 400 }
      );
    }

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: '沒有提供要更新的數值' },
        { status: 400 }
      );
    }

    console.log(`📊 更新角色數值: ${characterId}`, updates);

    // 1. 讀取角色資料
    const charactersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Characters!A:Z',
    });

    const charactersData = charactersResponse.data.values || [];
    if (charactersData.length === 0) {
      return NextResponse.json(
        { success: false, error: '無法連接角色資料庫' },
        { status: 500 }
      );
    }

    const headers = charactersData[0];
    let targetRowIndex = -1;
    let currentCharacter = null;

    // 2. 找到目標角色
    for (let i = 1; i < charactersData.length; i++) {
      const row = charactersData[i];
      if (row[0] === characterId) { // Character_ID 在第0欄
        currentCharacter = {};
        headers.forEach((header, index) => {
          currentCharacter[header] = row[index] || '';
        });
        targetRowIndex = i;
        break;
      }
    }

    if (!currentCharacter) {
      return NextResponse.json(
        { success: false, error: '找不到指定角色' },
        { status: 404 }
      );
    }

    // 3. 準備更新資料和變更記錄
    const changedValues = [];
    const updateOperations = [];

    for (const [field, value] of Object.entries(updates)) {
      const headerIndex = headers.indexOf(field);
      if (headerIndex === -1) {
        console.warn(`⚠️  欄位不存在: ${field}`);
        continue;
      }

      const oldValue = currentCharacter[field] || '';
      const newValue = String(value);

      if (oldValue !== newValue) {
        changedValues.push({
          field,
          oldValue,
          newValue,
          headerIndex
        });

        // 準備單欄位更新
        const columnLetter = String.fromCharCode(65 + headerIndex); // A, B, C...
        const updateRange = `Characters!${columnLetter}${targetRowIndex + 1}`;
        
        updateOperations.push({
          range: updateRange,
          values: [[newValue]]
        });
      }
    }

    if (changedValues.length === 0) {
      return NextResponse.json({
        success: true,
        message: '沒有需要更新的數值',
        data: { characterId, unchanged: true }
      });
    }

    // 4. 執行批量更新
    const batchUpdateData = updateOperations.map(op => ({
      range: op.range,
      values: op.values
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: process.env.SPREADSHEET_ID,
      resource: {
        valueInputOption: 'USER_ENTERED',
        data: batchUpdateData
      }
    });

    // 5. 記錄變更歷史到 CharacterChangelog
    if (changedValues.length > 0) {
      const changelogEntries = changedValues.map(change => [
        `${characterId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Change_ID
        characterId, // Character_ID
        'stat_update', // Change_Type
        change.field, // Target_Field
        change.oldValue, // Old_Value
        change.newValue, // New_Value
        new Date().toISOString(), // Timestamp
        source // Source
      ]);

      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: 'CharacterChangelog!A:H',
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: changelogEntries
          }
        });
        console.log(`📝 變更記錄已保存: ${changelogEntries.length} 筆`);
      } catch (error) {
        console.warn('變更記錄保存失敗:', error.message);
        // 不影響主要功能，繼續執行
      }
    }

    // 6. 更新 Last_Active 時間
    const lastActiveIndex = headers.indexOf('Last_Active');
    if (lastActiveIndex !== -1) {
      const lastActiveColumn = String.fromCharCode(65 + lastActiveIndex);
      const lastActiveRange = `Characters!${lastActiveColumn}${targetRowIndex + 1}`;
      
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: lastActiveRange,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [[new Date().toISOString()]]
          }
        });
      } catch (error) {
        console.warn('Last_Active 更新失敗:', error.message);
      }
    }

    console.log(`✅ 角色數值更新完成: ${characterId}, 更新 ${changedValues.length} 個欄位`);

    // 7. 返回更新結果
    const updatedCharacter = { ...currentCharacter };
    changedValues.forEach(change => {
      updatedCharacter[change.field] = change.newValue;
    });

    return NextResponse.json({
      success: true,
      message: `成功更新 ${changedValues.length} 個數值`,
      data: {
        characterId,
        updatedFields: changedValues.map(c => c.field),
        changes: changedValues.map(c => ({
          field: c.field,
          from: c.oldValue,
          to: c.newValue
        })),
        timestamp: new Date().toISOString(),
        character: updatedCharacter
      }
    });

  } catch (error) {
    console.error('Character Update API Error:', error);
    return NextResponse.json(
      { success: false, error: '角色數值更新失敗', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * 獲取角色變更歷史
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    const limit = parseInt(searchParams.get('limit')) || 50;

    if (!characterId) {
      return NextResponse.json(
        { success: false, error: '角色 ID 是必要的' },
        { status: 400 }
      );
    }

    // 讀取變更記錄
    const changelogResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'CharacterChangelog!A:H',
    });

    const changelogData = changelogResponse.data.values || [];
    if (changelogData.length <= 1) {
      return NextResponse.json({
        success: true,
        data: { characterId, changes: [], total: 0 }
      });
    }

    const headers = changelogData[0];
    const changes = [];

    // 篩選指定角色的變更記錄
    for (let i = 1; i < changelogData.length; i++) {
      const row = changelogData[i];
      if (row[1] === characterId) { // Character_ID 在第1欄
        const change = {};
        headers.forEach((header, index) => {
          change[header] = row[index] || '';
        });
        changes.push(change);
      }
    }

    // 按時間戳排序（最新的在前）
    changes.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));

    // 限制返回數量
    const limitedChanges = changes.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        characterId,
        changes: limitedChanges,
        total: changes.length,
        showing: limitedChanges.length
      }
    });

  } catch (error) {
    console.error('Get Character Changes API Error:', error);
    return NextResponse.json(
      { success: false, error: '無法獲取變更歷史' },
      { status: 500 }
    );
  }
}