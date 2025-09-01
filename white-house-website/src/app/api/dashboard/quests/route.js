import { getSheetData } from '@/lib/sheets';
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

    // 從 Quests 工作表獲取任務資料
    const questsData = await getSheetData('Quests!A2:G');

    if (!questsData) {
      return NextResponse.json(
        { success: false, error: '無法讀取任務資料' },
        { status: 500 }
      );
    }

    // 處理任務資料
    const allQuests = questsData
      .filter(row => row[1] === characterId) // 篩選指派給該角色的任務
      .map(row => ({
        questId: row[0] || '',
        assignedCharacterId: row[1] || '',
        title: row[2] || '未命名任務',
        description: row[3] || '',
        type: row[4] || '支線',
        status: row[5] || '進行中',
        createdDate: row[6] || new Date().toISOString().split('T')[0]
      }));

    // 按類型分類任務
    const mainQuests = allQuests.filter(quest => quest.type === '主線');
    const sideQuests = allQuests.filter(quest => quest.type === '支線');

    // 按狀態分類
    const activeQuests = allQuests.filter(quest => quest.status === '進行中');
    const completedQuests = allQuests.filter(quest => quest.status === '已完成');

    return NextResponse.json({
      success: true,
      data: {
        characterId,
        mainQuests,
        sideQuests,
        activeQuests,
        completedQuests,
        totalQuests: allQuests.length,
        stats: {
          total: allQuests.length,
          active: activeQuests.length,
          completed: completedQuests.length,
          mainLine: mainQuests.length,
          sideLine: sideQuests.length
        }
      }
    });

  } catch (error) {
    console.error('Quests API Error:', error);
    return NextResponse.json(
      { success: false, error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}