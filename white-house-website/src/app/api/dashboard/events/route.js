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
    const [eventsResponse, optionsResponse, outcomesResponse, charactersResponse, inventoryResponse, playerChoicesResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Events!A:G',
      }),
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
      // PlayerChoices 表格記錄玩家的選擇歷史
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'PlayerChoices!A:F',
      }).catch(() => ({ data: { values: [] } })) // 如果表格不存在則返回空數組
    ]);

    const eventsData = eventsResponse.data.values || [];
    const optionsData = optionsResponse.data.values || [];
    const outcomesData = outcomesResponse.data.values || [];
    const charactersData = charactersResponse.data.values || [];
    const inventoryData = inventoryResponse.data.values || [];
    const playerChoicesData = playerChoicesResponse.data.values || [];

    if (eventsData.length < 2) {
      return Response.json({
        success: true,
        data: {
          availableEvents: [],
          completedEvents: [],
          stats: { total: 0, available: 0, completed: 0 }
        }
      });
    }

    // 解析資料
    const eventHeaders = eventsData[0];
    const events = eventsData.slice(1).map(row => {
      const event = {};
      eventHeaders.forEach((header, index) => {
        event[header] = row[index] || '';
      });
      return event;
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

    // 獲取玩家選擇歷史
    const choiceHeaders = playerChoicesData[0] || [];
    const playerChoices = playerChoicesData.slice(1)
      .filter(row => row[1] === characterId) // Character_ID
      .map(row => {
        const choice = {};
        choiceHeaders.forEach((header, index) => {
          choice[header] = row[index] || '';
        });
        return choice;
      });

    // 簡化完成邏輯：玩家做過選擇的事件即為完成
    const completedEventIds = playerChoices.map(choice => choice.Source_Step_ID).filter(Boolean);

    // 檢查哪些步驟可用
    const availableEvents = events.filter(event => {
      // 檢查是否為起始點
      const isStarting = event.Is_Starting_Point === 'TRUE';
      
      // 檢查是否通過其他選項解鎖 (檢查是否有其他選項的 Target_Step_ID 等於此步驟的 Step_ID)
      const isUnlocked = options.some(option => 
        option.Target_Step_ID === event.Step_ID && 
        playerChoices.some(choice => choice.Option_ID === option.Option_ID)
      );
      
      // 檢查是否已完成 (使用新的完成邏輯)
      const isCompleted = completedEventIds.includes(event.Step_ID);
      
      // 事件可用的條件：是起始點、被解鎖、或者已經在進行中但未完成
      const canAccess = isStarting || isUnlocked;
      
      return canAccess && !isCompleted;
    });

    // 為每個可用步驟添加可用選項
    const eventsWithOptions = availableEvents.map(event => {
      const eventOptions = options.filter(option => {
        if (option.Source_Step_ID !== event.Step_ID) return false;
        
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

        // 移除重複選項檢查 - 因為事件一選即完成，不需要此檢查

        return option.Is_Available === 'TRUE';
      });

      // 為每個選項添加相關結果預覽
      const optionsWithOutcomes = eventOptions.map(option => {
        const relatedOutcomes = outcomes.filter(outcome => outcome.Trigger_Option_ID === option.Option_ID);
        return {
          ...option,
          outcomes: relatedOutcomes
        };
      });

      return {
        ...event,
        options: optionsWithOutcomes
      };
    });

    // 獲取已完成步驟及其選擇
    const completedEvents = events.filter(event => completedEventIds.includes(event.Step_ID)).map(event => {
      const playerChoice = playerChoices.find(choice => 
        choice.Source_Step_ID === event.Step_ID || choice.Target_Step_ID === event.Step_ID
      );
      const chosenOption = options.find(option => option.Option_ID === playerChoice?.Option_ID);
      
      return {
        ...event,
        playerChoice: playerChoice,
        chosenOption: chosenOption,
        outcomes: outcomes.filter(outcome => outcome.Trigger_Option_ID === playerChoice?.Option_ID)
      };
    });

    const stats = {
      total: events.length,
      available: eventsWithOptions.length,
      completed: completedEvents.length
    };

    return Response.json({
      success: true,
      data: {
        availableEvents: eventsWithOptions,
        completedEvents: completedEvents,
        stats: stats
      }
    });

  } catch (error) {
    console.error('Events API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to fetch events data' 
    }, { status: 500 });
  }
}