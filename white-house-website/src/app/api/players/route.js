import { getSheetData } from '../../../lib/sheets';
import { NextResponse } from 'next/server';

export async function GET() {
  const data = await getSheetData('Players!A2:E'); // A=ID, B=Name, C=Password, D=Score, E=Rank
  if (!data) {
    return NextResponse.json({ message: 'Failed to fetch data' }, { status: 500 });
  }
  const players = data.map(row => ({
    id: row[0],
    name: row[1],
    score: row[3],
    rank: row[4],
  }));
  return NextResponse.json(players);
}
