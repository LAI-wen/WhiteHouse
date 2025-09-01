import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function POST(request) {
  try {
    const body = await request.json();
    const { characterId, stepId, optionId } = body;

    if (!characterId || !stepId || !optionId) {
      return Response.json({ 
        success: false, 
        error: 'Character ID, Step ID, and Option ID are required' 
      }, { status: 400 });
    }

    // 獲取相關數據
    const [optionsResponse, outcomesResponse, charactersResponse, inventoryResponse, playerChoicesResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventOptions!A:J',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventOutcomes!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Characters!A:V',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Inventory!A:H',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'PlayerChoices!A:F',
      }).catch(() => ({ data: { values: [] } }))
    ]);

    const optionsData = optionsResponse.data.values || [];
    const outcomesData = outcomesResponse.data.values || [];
    const charactersData = charactersResponse.data.values || [];
    const inventoryData = inventoryResponse.data.values || [];
    const playerChoicesData = playerChoicesResponse.data.values || [];

    // 解析選項數據
    const optionHeaders = optionsData[0] || [];
    const option = optionsData.slice(1).find(row => row[0] === optionId);
    if (!option) {
      return Response.json({ 
        success: false, 
        error: 'Option not found' 
      }, { status: 404 });
    }

    const optionObj = {};
    optionHeaders.forEach((header, index) => {
      optionObj[header] = option[index] || '';
    });

    // 檢查是否已經做過這個選擇
    const choiceHeaders = playerChoicesData[0] || [];
    const existingChoice = playerChoicesData.slice(1).find(row => 
      row[1] === characterId && (row[2] === stepId || row[3] === optionId)
    );

    if (existingChoice) {
      return Response.json({ 
        success: false, 
        error: 'Choice already made for this step' 
      }, { status: 400 });
    }

    // 獲取相關結果
    const outcomeHeaders = outcomesData[0] || [];
    const relatedOutcomes = outcomesData.slice(1).filter(row => row[1] === optionId);

    // 獲取角色資料
    const characterHeaders = charactersData[0] || [];
    const characterRowIndex = charactersData.slice(1).findIndex(row => row[0] === characterId);
    
    if (characterRowIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Character not found' 
      }, { status: 404 });
    }

    const characterRow = charactersData[characterRowIndex + 1];
    const character = {};
    characterHeaders.forEach((header, index) => {
      character[header] = characterRow[index] || '';
    });

    // 處理結果並更新角色
    const changes = [];
    const updates = {};

    for (const outcomeRow of relatedOutcomes) {
      const outcome = {};
      outcomeHeaders.forEach((header, index) => {
        outcome[header] = outcomeRow[index] || '';
      });

      const outcomeType = outcome.Outcome_Type;
      const target = outcome.Outcome_Target;
      const value = parseFloat(outcome.Outcome_Value) || 0;
      const description = outcome.Outcome_Description;

      switch (outcomeType) {
        case 'CHANGE_STAT':
          const currentValue = parseFloat(character[target]) || 0;
          const newValue = Math.max(0, currentValue + value);
          updates[target] = newValue;
          changes.push(`${target} ${value > 0 ? '+' : ''}${value} (${currentValue} → ${newValue})`);
          break;

        case 'GAIN_ITEM':
          // 添加物品到inventory (需要實現)
          const itemId = target;
          const quantity = Math.abs(value) || 1;
          
          // 檢查是否已有此物品
          const inventoryHeaders = inventoryData[0] || [];
          const existingItem = inventoryData.slice(1).find(row => 
            row[1] === characterId && row[2] === itemId
          );

          if (existingItem) {
            // 更新數量
            const existingQuantity = parseInt(existingItem[3]) || 0;
            const newQuantity = existingQuantity + quantity;
            const itemRowIndex = inventoryData.slice(1).findIndex(row => 
              row[1] === characterId && row[2] === itemId
            ) + 2; // +2 because of header and 1-based indexing

            await sheets.spreadsheets.values.update({
              spreadsheetId: process.env.SPREADSHEET_ID,
              range: `Inventory!D${itemRowIndex}`,
              valueInputOption: 'RAW',
              resource: { values: [[newQuantity]] }
            });
          } else {
            // 添加新物品
            const newItemId = `INV${Date.now()}`;
            await sheets.spreadsheets.values.append({
              spreadsheetId: process.env.SPREADSHEET_ID,
              range: 'Inventory!A:H',
              valueInputOption: 'RAW',
              resource: {
                values: [[
                  newItemId,
                  characterId,
                  itemId,
                  quantity,
                  new Date().toISOString(),
                  'Active',
                  '',
                  ''
                ]]
              }
            });
          }
          
          changes.push(`獲得物品: ${itemId} x${quantity}`);
          break;

        case 'LOSE_ITEM':
          // 移除物品 (需要實現)
          changes.push(`失去物品: ${target}`);
          break;
      }
    }

    // 更新角色數據
    if (Object.keys(updates).length > 0) {
      const updatePromises = Object.entries(updates).map(([field, value]) => {
        const columnIndex = characterHeaders.indexOf(field);
        if (columnIndex !== -1) {
          return sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: `Characters!${String.fromCharCode(65 + columnIndex)}${characterRowIndex + 2}`,
            valueInputOption: 'RAW',
            resource: { values: [[value]] }
          });
        }
      });

      await Promise.all(updatePromises.filter(Boolean));
    }

    // 記錄玩家選擇
    const choiceId = `CHOICE${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'PlayerChoices!A:F',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          choiceId,
          characterId,
          stepId,
          optionId,
          optionObj.Target_Step_ID || '',
          timestamp
        ]]
      }
    });

    // 準備Discord消息 (如果需要)
    const discordMessages = relatedOutcomes
      .map(row => {
        const outcome = {};
        outcomeHeaders.forEach((header, index) => {
          outcome[header] = row[index] || '';
        });
        return outcome.Discord_Message;
      })
      .filter(Boolean);

    return Response.json({
      success: true,
      data: {
        choiceId,
        optionText: optionObj.Option_Text,
        targetStepId: optionObj.Target_Step_ID,
        changes,
        updates,
        discordMessages,
        outcomes: relatedOutcomes.map(row => {
          const outcome = {};
          outcomeHeaders.forEach((header, index) => {
            outcome[header] = row[index] || '';
          });
          return outcome;
        })
      }
    });

  } catch (error) {
    console.error('Event submission error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to process event submission: ' + error.message 
    }, { status: 500 });
  }
}