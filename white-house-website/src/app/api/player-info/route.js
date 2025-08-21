import { getSheetData } from '../../../lib/sheets';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { playerId, password } = await req.json();
  const allPlayersData = await getSheetData('Players!A2:H');
  
  const playerRow = allPlayersData.find(row => row[0] === playerId);
  if (!playerRow || playerRow[2] !== password) {
    return NextResponse.json({ message: '驗證失敗' }, { status: 401 });
  }

  const playerData = {
    id: playerRow[0],
    name: playerRow[1],
    score: playerRow[3],
    rank: playerRow[4],
    money: playerRow[5],
    items: JSON.parse(playerRow[6] || '[]'),
    stats: JSON.parse(playerRow[7] || '{}')
  };
  return NextResponse.json(playerData);
}
