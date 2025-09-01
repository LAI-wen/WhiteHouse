import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return Response.json({ 
        success: false, 
        error: 'Character ID is required' 
      }, { status: 400 });
    }
    
    // 獲取所有需要的資料表
    const [stepsResponse, optionsResponse, outcomesResponse, charactersResponse, inventoryResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Steps!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Options!A:J',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Outcomes!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Characters!A:V',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Inventory!A:H',
      })
    ]);

    const stepsData = stepsResponse.data.values || [];
    const optionsData = optionsResponse.data.values || [];
    const outcomesData = outcomesResponse.data.values || [];
    const charactersData = charactersResponse.data.values || [];
    const inventoryData = inventoryResponse.data.values || [];

    if (stepsData.length < 2) {
      return Response.json({
        success: true,
        data: {
          availableSteps: [],
          completedSteps: [],
          stats: { total: 0, available: 0, completed: 0 }
        }
      });
    }

    // 解析資料
    const stepHeaders = stepsData[0];
    const steps = stepsData.slice(1).map(row => {
      const step = {};
      stepHeaders.forEach((header, index) => {
        step[header] = row[index] || '';
      });
      return step;
    });

    const optionHeaders = optionsData[0] || [];
    const options = (optionsData.slice(1) || []).map(row => {
      const option = {};
      optionHeaders.forEach((header, index) => {
        option[header] = row[index] || '';
      });
      return option;
    });

    const outcomeHeaders = outcomesData[0] || [];
    const outcomes = (outcomesData.slice(1) || []).map(row => {
      const outcome = {};
      outcomeHeaders.forEach((header, index) => {
        outcome[header] = row[index] || '';
      });
      return outcome;
    });

    // 獲取角色資料
    const characterHeaders = charactersData[0] || [];
    const character = charactersData.slice(1).find(row => row[0] === characterId);
    if (!character) {
      return Response.json({ 
        success: false, 
        error: 'Character not found' 
      }, { status: 404 });
    }

    const characterObj = {};
    characterHeaders.forEach((header, index) => {
      characterObj[header] = character[index] || '';
    });

    // 獲取角色物品
    const inventoryHeaders = inventoryData[0] || [];
    const characterItems = inventoryData.slice(1)
      .filter(row => row[1] === characterId) // Character_ID
      .map(row => {
        const item = {};
        inventoryHeaders.forEach((header, index) => {
          item[header] = row[index] || '';
        });
        return item;
      });

    // TODO: 獲取已完成的步驟記錄 (需要一個記錄玩家選擇的表格)
    // 暫時假設沒有已完成的步驟
    const completedStepIds = [];

    // 檢查哪些步驟可用
    const availableSteps = steps.filter(step => {
      // 檢查是否為起始點或已解鎖
      const isStarting = step.Is_Starting_Point === 'TRUE';
      const isUnlocked = isStarting || completedStepIds.includes(step.Step_ID); // TODO: 實現解鎖邏輯
      
      return isUnlocked && !completedStepIds.includes(step.Step_ID);
    });

    // 為每個可用步驟添加可用選項
    const stepsWithOptions = availableSteps.map(step => {
      const stepOptions = options.filter(option => {
        if (option.Source_Step_ID !== step.Step_ID) return false;
        
        // 檢查屬性需求
        if (option.Req_Stat_Name && option.Req_Stat_Operator && option.Req_Stat_Value) {
          const statValue = parseInt(characterObj[option.Req_Stat_Name]) || 0;
          const requiredValue = parseInt(option.Req_Stat_Value);
          
          switch (option.Req_Stat_Operator) {
            case '>':
              if (statValue <= requiredValue) return false;
              break;
            case '>=':
              if (statValue < requiredValue) return false;
              break;
            case '<':
              if (statValue >= requiredValue) return false;
              break;
            case '<=':
              if (statValue > requiredValue) return false;
              break;
            case '=':
            case '==':
              if (statValue !== requiredValue) return false;
              break;
          }
        }

        // 檢查物品需求
        if (option.Req_Item_ID) {
          const hasItem = characterItems.some(item => item.Item_ID === option.Req_Item_ID);
          if (!hasItem) return false;
        }

        return option.Is_Available === 'TRUE';
      });

      return {
        ...step,
        options: stepOptions
      };
    });

    // 獲取已完成步驟 (暫時為空)
    const completedSteps = [];

    const stats = {
      total: steps.length,
      available: stepsWithOptions.length,
      completed: completedSteps.length
    };

    return Response.json({
      success: true,
      data: {
        availableSteps: stepsWithOptions,
        completedSteps: completedSteps,
        stats: stats
      }
    });

  } catch (error) {
    console.error('Events API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch events data: ' + error.message 
    }, { status: 500 });
  }
}