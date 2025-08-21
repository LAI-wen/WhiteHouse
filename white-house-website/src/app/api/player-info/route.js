import { getSheetData } from '../../../lib/sheets';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { playerId, password } = await req.json();
    
    if (!playerId || !password) {
      return NextResponse.json(
        { success: false, message: '請提供玩家 ID 和密碼' }, 
        { status: 400 }
      );
    }

    try {
      const allPlayersData = await getSheetData('名單!A2:H');
      
      if (allPlayersData) {
        const playerRow = allPlayersData.find(row => row[0] === playerId);
        if (!playerRow || playerRow[2] !== password) {
          return NextResponse.json(
            { success: false, message: '玩家 ID 或密碼錯誤' }, 
            { status: 401 }
          );
        }

        const playerData = {
          id: playerRow[0],
          name: playerRow[1],
          score: parseInt(playerRow[3]) || 0,
          rank: parseInt(playerRow[4]) || 0,
          money: parseInt(playerRow[5]) || 0,
          items: playerRow[6] ? playerRow[6].split(',').map(item => item.trim()) : [],
          stats: playerRow[7] ? (
            playerRow[7].startsWith('{') ? JSON.parse(playerRow[7]) : { info: playerRow[7] }
          ) : {},
          joinDate: '2025-01-01',
          level: Math.floor((parseInt(playerRow[3]) || 0) / 100) + 1
        };
        
        return NextResponse.json({
          success: true,
          data: playerData
        });
      }
    } catch (sheetsError) {
      console.warn('Google Sheets error, using fallback:', sheetsError.message);
    }
    
    // 測試資料 - 模擬密碼驗證
    const testPlayers = {
      'player-1': { password: 'alice123', name: 'Alice' },
      'player-2': { password: 'bob456', name: 'Bob' },
      'player-3': { password: 'charlie789', name: 'Charlie' }
    };
    
    const testPlayer = testPlayers[playerId];
    if (!testPlayer || testPlayer.password !== password) {
      return NextResponse.json(
        { success: false, message: '玩家 ID 或密碼錯誤' }, 
        { status: 401 }
      );
    }
    
    // 返回測試玩家資料
    const mockPlayerData = {
      id: playerId,
      name: testPlayer.name,
      score: 1000 + Math.floor(Math.random() * 500),
      rank: Math.floor(Math.random() * 10) + 1,
      money: Math.floor(Math.random() * 5000),
      level: Math.floor(Math.random() * 20) + 1,
      joinDate: '2025-01-15',
      items: ['劍', '盾牌', '藥水'],
      stats: {
        攻擊力: 85,
        防禦力: 70,
        速度: 90,
        幸運: 60
      }
    };
    
    return NextResponse.json({
      success: true,
      data: mockPlayerData,
      note: '使用測試資料'
    });
    
  } catch (error) {
    console.error('Player Info API Error:', error);
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' }, 
      { status: 500 }
    );
  }
}
