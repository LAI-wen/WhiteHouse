import { google } from 'googleapis';

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS ? 
    JSON.parse(process.env.GOOGLE_CREDENTIALS) : 
    undefined,
  keyFile: process.env.GOOGLE_CREDENTIALS ? undefined : './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// 檢查選項是否對特定玩家可用 (解決併發衝突)
function isOptionAvailableForPlayer(option, characterId, sessionId, choiceHistory, characterObj, characterItems) {
  // 1. 檢查最大使用次數限制 (取代 Is_Available 邏輯)
  if (option.Max_Uses_Per_Player && parseInt(option.Max_Uses_Per_Player) > 0) {
    const usageCount = choiceHistory.filter(choice => 
      choice.Character_ID === characterId &&
      choice.Option_ID === option.Option_ID &&
      choice.Session_ID === sessionId
    ).length;
    
    if (usageCount >= parseInt(option.Max_Uses_Per_Player)) {
      return false;
    }
  }
  
  // 2. 檢查屬性需求
  if (option.Req_Stat_Name && option.Req_Stat_Operator && option.Req_Stat_Value) {
    const statValue = parseInt(characterObj[option.Req_Stat_Name]) || 0;
    const requiredValue = parseInt(option.Req_Stat_Value);
    
    switch (option.Req_Stat_Operator) {
      case '>': if (statValue <= requiredValue) return false; break;
      case '>=': if (statValue < requiredValue) return false; break;
      case '<': if (statValue >= requiredValue) return false; break;
      case '<=': if (statValue > requiredValue) return false; break;
      case '=':
      case '==': if (statValue !== requiredValue) return false; break;
    }
  }

  // 3. 檢查物品需求
  if (option.Req_Item_ID) {
    const hasItem = characterItems.some(item => item.Item_ID === option.Req_Item_ID);
    if (!hasItem) return false;
  }

  return true;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { characterId, campaignId, action, stepId, optionId } = body;

    if (!characterId || !campaignId) {
      return Response.json({ 
        success: false, 
        error: 'Character ID and Campaign ID are required' 
      }, { status: 400 });
    }

    // 獲取相關資料表
    const [stepsResponse, optionsResponse, outcomesResponse, charactersResponse, inventoryResponse, progressResponse, choiceHistoryResponse] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'Events!A:G',
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'EventOptions!A:K',
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
        range: 'CampaignProgress!A:J',
      }).catch(() => ({ data: { values: [] } })),
      sheets.spreadsheets.values.get({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'PlayerChoiceHistory!A:I',
      }).catch(() => ({ data: { values: [] } }))
    ]);

    // 解析資料
    const stepsData = stepsResponse.data.values || [];
    const optionsData = optionsResponse.data.values || [];
    const outcomesData = outcomesResponse.data.values || [];
    const charactersData = charactersResponse.data.values || [];
    const inventoryData = inventoryResponse.data.values || [];
    const progressData = progressResponse.data.values || [];
    const choiceHistoryData = choiceHistoryResponse.data.values || [];

    console.log('資料表讀取結果:', {
      stepsRows: stepsData.length,
      optionsRows: optionsData.length,
      outcomesRows: outcomesData.length,
      stepsHeaders: stepsData[0],
      firstStepRow: stepsData[1]
    });

    // 解析步驟
    const stepHeaders = stepsData[0] || [];
    const steps = stepsData.slice(1).map(row => {
      const step = {};
      stepHeaders.forEach((header, index) => {
        step[header] = row[index] || '';
      });
      return step;
    }).filter(step => step.Campaign_ID === campaignId);

    // 解析選項
    const optionHeaders = optionsData[0] || [];
    const options = optionsData.slice(1).map(row => {
      const option = {};
      optionHeaders.forEach((header, index) => {
        option[header] = row[index] || '';
      });
      return option;
    });

    // 解析結果
    const outcomeHeaders = outcomesData[0] || [];
    const outcomes = outcomesData.slice(1).map(row => {
      const outcome = {};
      outcomeHeaders.forEach((header, index) => {
        outcome[header] = row[index] || '';
      });
      return outcome;
    });

    // 解析選擇歷史
    const choiceHistoryHeaders = choiceHistoryData[0] || [];
    const choiceHistory = choiceHistoryData.slice(1).map(row => {
      const choice = {};
      choiceHistoryHeaders.forEach((header, index) => {
        choice[header] = row[index] || '';
      });
      return choice;
    });

    // 解析進度資料 (共用邏輯)
    const progressHeaders = progressData[0] || [];
    const findProgressForCharacter = (characterId, campaignId) => {
      return progressData.slice(1).find(row => row[1] === characterId && row[2] === campaignId);
    };

    // 獲取角色資料
    const characterHeaders = charactersData[0] || [];
    const characterObj = {};
    if (charactersData.length > 1) {
      const characterRow = charactersData.find(row => row[0] === characterId);
      if (characterRow) {
        characterHeaders.forEach((header, index) => {
          characterObj[header] = characterRow[index] || '';
        });
      }
    }

    // 獲取角色道具
    const inventoryHeaders = inventoryData[0] || [];
    const characterItems = inventoryData.slice(1)
      .filter(row => row[1] === characterId)
      .map(row => {
        const item = {};
        inventoryHeaders.forEach((header, index) => {
          item[header] = row[index] || '';
        });
        return item;
      });

    // 處理不同的動作
    if (action === 'start' || action === 'continue') {
      // 開始或繼續戰役
      let currentProgress = findProgressForCharacter(characterId, campaignId);
      let sessionId;
      let currentStepId;
      let completedSteps = [];

      if (currentProgress) {
        // 解析現有進度
        const progressObj = {};
        progressHeaders.forEach((header, index) => {
          progressObj[header] = currentProgress[index] || '';
        });
        currentStepId = progressObj.Current_Step_ID;
        sessionId = progressObj.Session_ID;
        completedSteps = progressObj.Completed_Steps ? progressObj.Completed_Steps.split(',') : [];
      } else {
        // 新戰役，找到起始步驟
        const startingStep = steps.find(step => step.Is_Starting_Step === 'TRUE');
        if (!startingStep) {
          console.error('起始步驟搜尋失敗:', {
            campaignId,
            totalSteps: steps.length,
            stepsData: steps.map(s => ({ 
              Step_ID: s.Step_ID, 
              Campaign_ID: s.Campaign_ID, 
              Is_Starting_Step: s.Is_Starting_Step 
            }))
          });
          return Response.json({
            success: false,
            error: `找不到戰役 ${campaignId} 的起始步驟。請檢查 Events 工作表中是否有 Is_Starting_Step=TRUE 的記錄。找到 ${steps.length} 個步驟。`
          }, { status: 400 });
        }
        currentStepId = startingStep.Step_ID;
        
        // 創建進度記錄 (包含Session ID和版本號)
        sessionId = `SES-${characterId}-${Date.now()}`;
        const newProgressId = `PROG-${characterId}-${campaignId}-${Date.now()}`;
        const newProgressRow = [
          newProgressId,
          characterId,
          campaignId,
          sessionId,
          currentStepId,
          new Date().toISOString(), // Started_At
          new Date().toISOString(), // Last_Updated
          1, // Version (樂觀鎖定)
          'IN_PROGRESS', // Status
          0 // Completion_Rate
        ];
        
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: 'CampaignProgress!A:J',
          valueInputOption: 'USER_ENTERED',
          resource: { values: [newProgressRow] }
        });
      }

      // 獲取當前步驟
      const currentStep = steps.find(step => step.Step_ID === currentStepId);
      if (!currentStep) {
        return Response.json({
          success: false,
          error: '找不到當前步驟'
        }, { status: 400 });
      }

      // sessionId 已經在上面的邏輯中設定了

      // 獲取可用選項 (使用新的併發安全邏輯)
      const availableOptions = options.filter(option => {
        if (option.Source_Step_ID !== currentStepId) return false;
        
        return isOptionAvailableForPlayer(option, characterId, sessionId, choiceHistory, characterObj, characterItems);
      });

      return Response.json({
        success: true,
        data: {
          currentStep,
          availableOptions,
          completedSteps
        }
      });

    } else if (action === 'choose' && stepId && optionId) {
      // 處理選項選擇
      const option = options.find(opt => opt.Option_ID === optionId);
      if (!option) {
        return Response.json({
          success: false,
          error: '找不到指定的選項'
        }, { status: 400 });
      }

      // 獲取當前 Session ID 和版本號
      const currentProgress = findProgressForCharacter(characterId, campaignId);
      
      if (!currentProgress) {
        return Response.json({
          success: false,
          error: '找不到戰役進度記錄'
        }, { status: 400 });
      }

      const progressObj = {};
      progressHeaders.forEach((header, index) => {
        progressObj[header] = currentProgress[index] || '';
      });
      
      const sessionId = progressObj.Session_ID;
      const currentVersion = parseInt(progressObj.Version) || 1;

      // 執行結果
      const relatedOutcomes = outcomes.filter(outcome => outcome.Trigger_Option_ID === optionId);
      const changes = [];
      const updates = {};

      for (const outcome of relatedOutcomes) {
        const outcomeType = outcome.Outcome_Type;
        const target = outcome.Outcome_Target;
        const value = parseFloat(outcome.Outcome_Value) || 0;

        switch (outcomeType) {
          case 'CHANGE_STAT':
            const currentValue = parseFloat(characterObj[target]) || 0;
            const newValue = Math.max(0, currentValue + value);
            updates[target] = newValue;
            changes.push(`${target} ${value > 0 ? '+' : ''}${value} (${currentValue} → ${newValue})`);
            break;
          case 'GAIN_ITEM':
            // 處理道具獲得邏輯
            break;
          case 'LOSE_ITEM':
            // 處理道具失去邏輯
            break;
        }
      }

      // 更新角色數據
      if (Object.keys(updates).length > 0) {
        const characterRowIndex = charactersData.findIndex(row => row[0] === characterId);
        if (characterRowIndex > 0) {
          const updateRange = `Characters!A${characterRowIndex + 1}:V${characterRowIndex + 1}`;
          const updatedRow = [...charactersData[characterRowIndex]];
          
          Object.keys(updates).forEach(stat => {
            const headerIndex = characterHeaders.indexOf(stat);
            if (headerIndex !== -1) {
              updatedRow[headerIndex] = updates[stat].toString();
            }
          });

          await sheets.spreadsheets.values.update({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [updatedRow] }
          });
        }
      }

      // 記錄選擇歷史
      const choiceId = `CHC-${characterId}-${Date.now()}`;
      const choiceResult = changes.join(', ') || `選擇了 ${option.Option_Text}`;
      const choiceRow = [
        choiceId,
        characterId,
        campaignId,
        sessionId,
        stepId,
        optionId,
        choiceResult,
        new Date().toISOString(),
        '' // Previous_Choice_ID (可以後續實現)
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: 'PlayerChoiceHistory!A:I',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [choiceRow] }
      });

      // 更新戰役進度 (使用樂觀鎖定)
      const nextStepId = option.Target_Step_ID;
      const isCompleted = !nextStepId; // 如果沒有下一步，戰役完成

      const progressRowIndex = progressData.findIndex(row => 
        row[1] === characterId && row[2] === campaignId
      );

      if (progressRowIndex > 0) {
        const currentProgressRow = progressData[progressRowIndex];
        
        // 檢查版本號 (樂觀鎖定)
        const savedVersion = parseInt(currentProgressRow[7]) || 1;
        if (savedVersion !== currentVersion) {
          return Response.json({
            success: false,
            error: 'CONCURRENT_MODIFICATION',
            message: '其他操作正在進行中，請重新載入頁面'
          }, { status: 409 });
        }

        const updatedProgressRow = [
          currentProgressRow[0], // Progress_ID
          characterId,
          campaignId,
          sessionId,
          nextStepId || '',
          currentProgressRow[5], // Started_At
          new Date().toISOString(), // Last_Updated
          currentVersion + 1, // Version (遞增)
          isCompleted ? 'COMPLETED' : 'IN_PROGRESS', // Status
          isCompleted ? 1.0 : Math.min(0.9, choiceHistory.length * 0.1) // Completion_Rate
        ];

        const updateRange = `CampaignProgress!A${progressRowIndex + 1}:J${progressRowIndex + 1}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: updateRange,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [updatedProgressRow] }
        });
      }

      // 準備回應資料
      let nextStep = null;
      let nextOptions = [];

      if (nextStepId) {
        nextStep = steps.find(step => step.Step_ID === nextStepId);
        if (nextStep) {
          // 創建更新後的角色物件（包含數值變化）
          const updatedCharacterObj = { ...characterObj };
          Object.keys(updates).forEach(stat => {
            updatedCharacterObj[stat] = updates[stat];
          });
          
          // 使用新的併發安全邏輯檢查下一步選項
          nextOptions = options.filter(option => {
            if (option.Source_Step_ID !== nextStepId) return false;
            
            return isOptionAvailableForPlayer(option, characterId, sessionId, choiceHistory, updatedCharacterObj, characterItems);
          });
        }
      }

      return Response.json({
        success: true,
        data: {
          optionText: option.Option_Text,
          outcomes: relatedOutcomes,
          changes,
          nextStep,
          nextOptions,
          isCompleted
        }
      });

    } else {
      return Response.json({
        success: false,
        error: '無效的動作'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Campaign Play API Error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to process campaign action' 
    }, { status: 500 });
  }
}