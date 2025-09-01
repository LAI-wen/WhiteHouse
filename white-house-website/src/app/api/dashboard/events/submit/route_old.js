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
    const { characterId, eventId, optionId } = body;

    if (!characterId || !eventId || !optionId) {
      return Response.json({ 
        success: false, 
        error: 'Character ID, Event ID, and Option ID are required' 
      }, { status: 400 });
    }

    // 檢查是否已經完成過這個事件
    const outcomesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventOutcomes!A:I',
    });

    const outcomesData = outcomesResponse.data.values || [];
    const existingOutcome = outcomesData.slice(1).find(row => 
      row[1] === characterId && row[2] === eventId
    );

    if (existingOutcome) {
      return Response.json({ 
        success: false, 
        error: 'This event has already been completed' 
      }, { status: 400 });
    }

    // 獲取事件和選項資料
    const eventsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Events!A:M',
    });

    const optionsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventOptions!A:F',
    });

    const eventsData = eventsResponse.data.values;
    const optionsData = optionsResponse.data.values;

    // 找到對應的事件和選項
    const eventHeaders = eventsData[0];
    const event = eventsData.slice(1).find(row => row[0] === eventId);
    
    const optionHeaders = optionsData[0];
    const option = optionsData.slice(1).find(row => row[0] === optionId);

    if (!event || !option) {
      return Response.json({ 
        success: false, 
        error: 'Event or option not found' 
      }, { status: 404 });
    }

    // 轉換為物件格式
    const eventObj = {};
    eventHeaders.forEach((header, index) => {
      eventObj[header] = event[index] || '';
    });

    const optionObj = {};
    optionHeaders.forEach((header, index) => {
      optionObj[header] = option[index] || '';
    });

    // 處理獎勵和懲罰
    const rewards = optionObj.Rewards ? JSON.parse(optionObj.Rewards) : {};
    const penalties = optionObj.Penalties ? JSON.parse(optionObj.Penalties) : {};

    // 獲取角色當前狀態
    const charactersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Characters!A:V',
    });

    const charactersData = charactersResponse.data.values;
    const characterHeaders = charactersData[0];
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

    // 計算新的數值
    const updates = {};
    const changes = [];

    // 處理HP變化
    if (rewards.hp || penalties.hp) {
      const hpChange = (parseInt(rewards.hp) || 0) - (parseInt(penalties.hp) || 0);
      const newHp = Math.max(0, Math.min(parseInt(character.Max_HP), parseInt(character.HP) + hpChange));
      updates.HP = newHp;
      if (hpChange !== 0) {
        changes.push(`HP ${hpChange > 0 ? '+' : ''}${hpChange} (${character.HP} → ${newHp})`);
      }
    }

    // 處理SAN變化
    if (rewards.san || penalties.san) {
      const sanChange = (parseInt(rewards.san) || 0) - (parseInt(penalties.san) || 0);
      const newSan = Math.max(0, Math.min(parseInt(character.Max_SAN), parseInt(character.SAN) + sanChange));
      updates.SAN = newSan;
      if (sanChange !== 0) {
        changes.push(`SAN ${sanChange > 0 ? '+' : ''}${sanChange} (${character.SAN} → ${newSan})`);
      }
    }

    // 處理AP變化
    if (rewards.ap || penalties.ap) {
      const apChange = (parseInt(rewards.ap) || 0) - (parseInt(penalties.ap) || 0);
      const newAp = Math.max(0, parseInt(character.AP) + apChange);
      updates.AP = newAp;
      if (apChange !== 0) {
        changes.push(`AP ${apChange > 0 ? '+' : ''}${apChange} (${character.AP} → ${newAp})`);
      }
    }

    // 處理BP變化
    if (rewards.bp || penalties.bp) {
      const bpChange = (parseInt(rewards.bp) || 0) - (parseInt(penalties.bp) || 0);
      const newBp = Math.max(0, parseInt(character.BP) + bpChange);
      updates.BP = newBp;
      if (bpChange !== 0) {
        changes.push(`BP ${bpChange > 0 ? '+' : ''}${bpChange} (${character.BP} → ${newBp})`);
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
            resource: {
              values: [[value]]
            }
          });
        }
      });

      await Promise.all(updatePromises.filter(Boolean));
    }

    // 記錄事件結果
    const outcomeId = `OUT${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'EventOutcomes!A:I',
      valueInputOption: 'RAW',
      resource: {
        values: [[
          outcomeId,
          characterId,
          eventId,
          optionId,
          optionObj.Option_Text,
          optionObj.Result_Text,
          changes.join(', '),
          timestamp,
          'Completed'
        ]]
      }
    });

    return Response.json({
      success: true,
      data: {
        outcomeId,
        result: optionObj.Result_Text,
        changes,
        updates
      }
    });

  } catch (error) {
    console.error('Event submission error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to process event submission' 
    }, { status: 500 });
  }
}