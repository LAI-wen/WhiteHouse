import { getSheetData } from '../../../lib/sheets';
import { NextResponse } from 'next/server';

export async function GET() {
  const questsData = await getSheetData('Quests!A2:D');
  const announcementsData = await getSheetData('Announcements!A2:D');

  const quests = questsData ? questsData.map(row => ({
    id: row[0],
    title: row[1],
    date: row[2],
    content: row[3],
    type: 'quest'
  })) : [];

  const announcements = announcementsData ? announcementsData.map(row => ({
    id: row[0],
    title: row[1],
    date: row[2],
    content: row[3],
    type: 'announcement'
  })) : [];

  const combined = [...quests, ...announcements].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return NextResponse.json(combined);
}
