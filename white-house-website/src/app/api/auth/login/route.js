import { getCharacterData } from '@/lib/sheets';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: '請提供帳號和密碼' },
        { status: 400 }
      );
    }

    // 從 Characters 工作表中驗證登入
    const charactersData = await getCharacterData();
    
    if (!charactersData || charactersData.length === 0) {
      return NextResponse.json(
        { success: false, error: '無法連接資料庫' },
        { status: 500 }
      );
    }

    // 查找匹配的角色
    const character = charactersData.find(row => {
      return row.Username === username && row.Password === password;
    });

    if (!character) {
      return NextResponse.json(
        { success: false, error: '帳號或密碼錯誤' },
        { status: 401 }
      );
    }

    // 檢查是否為 GM 帳號
    const isGM = character.Public_Faction === 'GM' || character.Character_ID?.startsWith('GM');
    
    // 登入成功，返回角色資訊（不包含密碼）
    const loginResponse = {
      success: true,
      data: {
        characterId: character.Character_ID,
        characterName: character.Character_Name,
        publicFaction: character.Public_Faction,
        trueFaction: character.True_Faction,
        hp: parseInt(character.HP) || 100,
        maxHp: parseInt(character.Max_HP) || 100,
        san: parseInt(character.SAN) || 100,
        maxSan: parseInt(character.Max_SAN) || 100,
        ap: parseInt(character.AP) || 0,
        bp: parseInt(character.BP) || 0,
        isGM: isGM,
        lastActive: character.Last_Active || new Date().toISOString()
      },
      message: `歡迎回來，${character.Character_Name}${isGM ? '（遊戲主持人）' : ''}`
    };

    return NextResponse.json(loginResponse);

  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}