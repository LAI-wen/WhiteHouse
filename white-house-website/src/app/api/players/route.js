import { getSheetData } from '../../../lib/sheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getSheetData('名單!A2:H'); // 試算表名稱改為"名單"
    
    if (data) {
      const players = data.map((row, index) => ({
        id: row[0] || `player-${index + 1}`,
        name: row[1] || `玩家 ${index + 1}`,
        score: parseInt(row[3]) || 0,
        rank: parseInt(row[4]) || (index + 1),
        status: '活躍',
        lastActive: new Date().toISOString().split('T')[0]
      }));
      
      return NextResponse.json({
        success: true,
        data: players,
        count: players.length
      });
    }
    
    // 沒有資料時返回測試資料
    throw new Error('No data from Google Sheets');
    
  } catch (error) {
    console.error('Players API Error:', error);
    
    // 返回測試資料
    const fallbackPlayers = [
      {
        id: 'player-1',
        name: 'Alice',
        score: 1250,
        rank: 1,
        status: '活躍',
        lastActive: '2025-08-21'
      },
      {
        id: 'player-2', 
        name: 'Bob',
        score: 980,
        rank: 2,
        status: '活躍',
        lastActive: '2025-08-20'
      },
      {
        id: 'player-3',
        name: 'Charlie',
        score: 750,
        rank: 3,
        status: '離線',
        lastActive: '2025-08-19'
      }
    ];
    
    return NextResponse.json({
      success: false,
      data: fallbackPlayers,
      error: error.message,
      note: '使用測試資料'
    });
  }
}
