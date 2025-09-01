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

    // 獲取物品主列表
    const itemsData = await getSheetData('Items!A2:G');
    const inventoryData = await getSheetData('Inventory!A2:E');

    if (!itemsData || !inventoryData) {
      return NextResponse.json(
        { success: false, error: '無法讀取資料庫' },
        { status: 500 }
      );
    }

    // 建立物品查找表
    const itemsMap = {};
    itemsData.forEach(row => {
      const itemId = row[0];
      itemsMap[itemId] = {
        itemId: itemId,
        itemName: row[1] || '未知物品',
        description: row[2] || '',
        isClue: row[3] === 'TRUE',
        category: row[4] || '一般物品',
        imageUrl: row[5] || '',
        specialEffect: row[6] || ''
      };
    });

    // 篩選角色的物品
    const characterItems = inventoryData
      .filter(row => row[0] === characterId)
      .map(row => {
        const itemId = row[1];
        const itemInfo = itemsMap[itemId];
        
        if (!itemInfo) {
          return null; // 物品不存在
        }

        return {
          ...itemInfo,
          quantity: parseInt(row[2]) || 1,
          obtainedDate: row[3] || '',
          obtainedMethod: row[4] || ''
        };
      })
      .filter(item => item !== null);

    // 分類物品
    const generalItems = characterItems.filter(item => item.category !== '關鍵物品' && !item.isClue);
    const keyItems = characterItems.filter(item => item.category === '關鍵物品' || item.isClue);

    return NextResponse.json({
      success: true,
      data: {
        characterId,
        generalItems,
        keyItems,
        totalItems: characterItems.length
      }
    });

  } catch (error) {
    console.error('Inventory API Error:', error);
    return NextResponse.json(
      { success: false, error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}