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
 * Discord OAuth 登入/綁定處理
 */
export async function POST(request) {
  try {
    const { discordId, username, discriminator, avatar, characterId } = await request.json();
    
    if (!discordId) {
      return NextResponse.json(
        { success: false, error: 'Discord ID 是必要的' },
        { status: 400 }
      );
    }

    console.log(`🔗 處理 Discord 綁定: ${username}#${discriminator} (${discordId})`);

    // 1. 讀取現有角色資料
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
    const discordIdIndex = headers.indexOf('Player_Discord_ID');
    const characterIdIndex = headers.indexOf('Character_ID');
    
    if (discordIdIndex === -1) {
      return NextResponse.json(
        { success: false, error: '資料庫結構錯誤' },
        { status: 500 }
      );
    }

    // 2. 檢查是否已經綁定過
    let existingCharacter = null;
    let existingRowIndex = -1;

    for (let i = 1; i < charactersData.length; i++) {
      const row = charactersData[i];
      if (row[discordIdIndex] === discordId) {
        existingCharacter = {};
        headers.forEach((header, index) => {
          existingCharacter[header] = row[index] || '';
        });
        existingRowIndex = i;
        break;
      }
    }

    // 3. 如果提供了 characterId，進行綁定
    if (characterId) {
      // 查找要綁定的角色
      let targetCharacter = null;
      let targetRowIndex = -1;

      for (let i = 1; i < charactersData.length; i++) {
        const row = charactersData[i];
        if (row[characterIdIndex] === characterId) {
          targetCharacter = {};
          headers.forEach((header, index) => {
            targetCharacter[header] = row[index] || '';
          });
          targetRowIndex = i;
          break;
        }
      }

      if (!targetCharacter) {
        return NextResponse.json(
          { success: false, error: '找不到指定的角色' },
          { status: 404 }
        );
      }

      // 檢查角色是否已經被其他Discord帳號綁定
      if (targetCharacter.Player_Discord_ID && targetCharacter.Player_Discord_ID !== discordId) {
        return NextResponse.json(
          { success: false, error: '此角色已被其他 Discord 帳號綁定' },
          { status: 409 }
        );
      }

      // 執行綁定 - 更新角色的 Discord ID
      const updateColumn = String.fromCharCode(65 + discordIdIndex); // 轉換索引為列字母
      const updateRange = `Characters!${updateColumn}${targetRowIndex + 1}`;
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.SPREADSHEET_ID,
        range: updateRange,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[discordId]]
        }
      });

      // 如果此 Discord 用戶之前綁定過其他角色，清除之前的綁定
      if (existingCharacter && existingCharacter.Character_ID !== characterId) {
        const clearColumn = String.fromCharCode(65 + discordIdIndex);
        const clearRange = `Characters!${clearColumn}${existingRowIndex + 1}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: clearRange,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [['']]
          }
        });
      }

      console.log(`✅ Discord 綁定成功: ${discordId} -> ${characterId}`);

      return NextResponse.json({
        success: true,
        message: 'Discord 帳號綁定成功',
        data: {
          characterId: targetCharacter.Character_ID,
          characterName: targetCharacter.Character_Name,
          discordId,
          discordUsername: username,
          bindTime: new Date().toISOString()
        }
      });
    }

    // 4. 如果沒有提供 characterId，檢查現有綁定狀態
    if (existingCharacter) {
      const isGM = existingCharacter.Public_Faction === 'GM' || 
                   existingCharacter.Character_ID?.startsWith('GM');
      
      return NextResponse.json({
        success: true,
        message: 'Discord 帳號已綁定角色',
        data: {
          characterId: existingCharacter.Character_ID,
          characterName: existingCharacter.Character_Name,
          publicFaction: existingCharacter.Public_Faction,
          trueFaction: existingCharacter.True_Faction,
          hp: parseInt(existingCharacter.HP) || 100,
          maxHp: parseInt(existingCharacter.Max_HP) || 100,
          san: parseInt(existingCharacter.SAN) || 100,
          maxSan: parseInt(existingCharacter.Max_SAN) || 100,
          isGM,
          discordId,
          discordUsername: username,
          lastActive: existingCharacter.Last_Active
        }
      });
    }

    // 5. 尚未綁定，返回可綁定的角色列表
    const availableCharacters = [];
    for (let i = 1; i < charactersData.length; i++) {
      const row = charactersData[i];
      // 只顯示尚未綁定 Discord 的角色
      if (!row[discordIdIndex] || row[discordIdIndex].trim() === '') {
        const character = {};
        headers.forEach((header, index) => {
          character[header] = row[index] || '';
        });
        
        availableCharacters.push({
          characterId: character.Character_ID,
          characterName: character.Character_Name,
          publicFaction: character.Public_Faction
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Discord 帳號尚未綁定角色',
      data: {
        discordId,
        discordUsername: username,
        availableCharacters,
        needBinding: true
      }
    });

  } catch (error) {
    console.error('Discord Auth API Error:', error);
    return NextResponse.json(
      { success: false, error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}

/**
 * 取消 Discord 綁定
 */
export async function DELETE(request) {
  try {
    const { discordId } = await request.json();
    
    if (!discordId) {
      return NextResponse.json(
        { success: false, error: 'Discord ID 是必要的' },
        { status: 400 }
      );
    }

    console.log(`🔓 解除 Discord 綁定: ${discordId}`);

    // 讀取角色資料
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
    const discordIdIndex = headers.indexOf('Player_Discord_ID');
    
    // 查找綁定的角色
    for (let i = 1; i < charactersData.length; i++) {
      const row = charactersData[i];
      if (row[discordIdIndex] === discordId) {
        // 清除綁定
        const clearColumn = String.fromCharCode(65 + discordIdIndex);
        const clearRange = `Characters!${clearColumn}${i + 1}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: clearRange,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [['']]
          }
        });

        console.log(`✅ Discord 綁定已解除: ${discordId}`);
        
        return NextResponse.json({
          success: true,
          message: 'Discord 綁定已解除'
        });
      }
    }

    return NextResponse.json(
      { success: false, error: '找不到綁定的角色' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Discord Unbind API Error:', error);
    return NextResponse.json(
      { success: false, error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}