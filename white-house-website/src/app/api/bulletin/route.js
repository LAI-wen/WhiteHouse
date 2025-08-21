import { getSheetData } from '../../../lib/sheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const questsData = await getSheetData('任務!A2:D');
    const announcementsData = await getSheetData('公告!A2:D');

    const quests = questsData ? questsData.map((row, index) => ({
      id: row[0] || `quest-${index + 1}`,
      title: row[1] || '未命名任務',
      date: row[2] || new Date().toISOString().split('T')[0],
      content: row[3] || '',
      type: 'quest'
    })) : [];

    const announcements = announcementsData ? announcementsData.map((row, index) => ({
      id: row[0] || `announcement-${index + 1}`,
      title: row[1] || '未命名公告',
      date: row[2] || new Date().toISOString().split('T')[0],
      content: row[3] || '',
      type: 'announcement'
    })) : [];

    const combined = [...quests, ...announcements].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return NextResponse.json({
      success: true,
      data: combined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Bulletin API Error:', error);
    
    // 返回測試資料
    const fallbackData = [
      {
        id: 'quest-1',
        title: '每日任務：資料收集',
        date: '2025-08-21',
        content: '收集今日市場數據並提交報告',
        type: 'quest'
      },
      {
        id: 'announcement-1',
        title: '系統維護通知',
        date: '2025-08-21',
        content: '系統將於今晚進行例行維護，預計停機 2 小時',
        type: 'announcement'
      }
    ];

    return NextResponse.json({
      success: false,
      data: fallbackData,
      error: error.message,
      note: '使用測試資料'
    });
  }
}
