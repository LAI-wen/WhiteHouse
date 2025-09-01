import { getSheetData } from '../../../lib/sheets';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const qaData = await getSheetData('FAQ!A2:D');
    
    if (qaData) {
      const qaList = qaData.map((row, index) => ({
        id: `qa-${index + 1}`,
        question: row[0] || '',
        answer: row[1] || '',
      })).filter(item => item.question.trim() && item.answer.trim());
      
      return NextResponse.json({
        success: true,
        data: qaList,
        count: qaList.length
      });
    }
    
    throw new Error('No data from Google Sheets');
    
  } catch (error) {
    console.error('QA API Error:', error);
    
    // 返回測試資料
    const fallbackQA = [
      {
        id: 'qa-1',
        question: '如何開始遊戲？',
        answer: '點擊開始按鈕，創建你的角色，然後選擇職業即可開始冒險！'
      },
      {
        id: 'qa-2',
        question: '如何提升等級？',
        answer: '完成任務、擊敗怪物和參與活動都可以獲得經驗值來提升等級。'
      },
      {
        id: 'qa-3',
        question: '如何加入公會？',
        answer: '達到 10 級後，可以在公會面板申請加入現有公會或創建新公會。'
      },
      {
        id: 'qa-4',
        question: '遊戲支援哪些平台？',
        answer: '目前支援 PC、Mac 和手機平台，未來會加入更多平台支援。'
      }
    ];
    
    return NextResponse.json({
      success: false,
      data: fallbackQA,
      error: error.message,
      note: '使用測試資料'
    });
  }
}