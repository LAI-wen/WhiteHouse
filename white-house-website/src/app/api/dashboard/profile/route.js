import { getCharacterData } from '@/lib/sheets';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // 從 URL 搜索參數獲取角色ID
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return NextResponse.json(
        { success: false, error: '需要提供角色ID' },
        { status: 400 }
      );
    }

    // 從 Characters 工作表獲取角色資料
    const charactersData = await getCharacterData();

    if (!charactersData || charactersData.length === 0) {
      return NextResponse.json(
        { success: false, error: '無法讀取角色資料' },
        { status: 500 }
      );
    }

    // 查找指定角色
    const character = charactersData.find(row => row.Character_ID === characterId);

    if (!character) {
      return NextResponse.json(
        { success: false, error: '找不到指定角色' },
        { status: 404 }
      );
    }

    // 格式化角色資料
    const profileData = {
      characterId: character.Character_ID,
      playerDiscordId: character.Player_Discord_ID || '',
      characterName: character.Character_Name || '',
      username: character.Username || '',
      
      // 身份資訊
      publicFaction: character.Public_Faction || '',
      trueFaction: character.True_Faction || '',
      
      // 基礎數值
      hp: parseInt(character.HP) || 0,
      maxHp: parseInt(character.Max_HP) || 100,
      san: parseInt(character.SAN) || 0,
      maxSan: parseInt(character.Max_SAN) || 100,
      ap: parseInt(character.AP) || 0,
      bp: parseInt(character.BP) || 0,
      
      // 屬性值
      stats: {
        STR: parseInt(character.STR) || 0,
        CON: parseInt(character.CON) || 0,
        DEX: parseInt(character.DEX) || 0,
        APP: parseInt(character.APP) || 0,
        INT: parseInt(character.INT) || 0,
        LUCK: parseInt(character.LUCK) || 0
      },
      
      // 陣營特殊點數
      goodBoyPoints: parseInt(character.Good_Boy_Points) || 0,
      performancePoints: parseInt(character.Performance_Points) || 0,
      
      // 角色故事與筆記
      backgroundStory: character.Background_Story || '',
      personalNotes: character.Personal_Notes || '',
      
      // 活動記錄
      lastActive: character.Last_Active || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Profile API Error:', error);
    return NextResponse.json(
      { success: false, error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}