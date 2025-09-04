import { NextResponse } from 'next/server';

// 模擬公告資料
const announcements = [
  {
    id: 'A001',
    title: '恭賀！白屋第三批『曦光計畫』學員順利畢業',
    content: '本季，又有15位孩子在白屋的悉心照料下完全康復，他們已於昨日啟程，前往XX集團位於海外的附屬機構繼續深造，成為對世界有貢獻的新一代人才。我們為這些孩子們的成長感到無比驕傲，也期待更多家庭能夠信任白屋，讓我們一同為孩子們創造更美好的未來...',
    author: '重要公告',
    created_date: '2024/1/15',
    is_active: 'ACTIVE'
  },
  {
    id: 'A002',
    title: '社區安全與和諧：我們共同的責任',
    content: '為維持白屋純淨、安全的療癒環境，我們將於本月舉辦『社區安全週』。提醒所有同仁與家長，警惕任何試圖散播不實言論、動搖我們共同信念的可疑人士。您的每一次舉報，都是在守護孩子們的未來。讓我們攜手共創和諧社區，為孩子們建立最安全的成長環境...',
    author: '安全提醒',
    created_date: '2024/1/14',
    is_active: 'ACTIVE'
  },
  {
    id: 'A003',
    title: '新一期療程開放報名',
    content: '白屋醫教育成兒童中心即將開放下一期療程報名，歡迎各位家長踴躍為孩子們申請。我們的專業團隊將為每一位孩子量身打造最適合的療育計畫，幫助他們重拾健康與快樂。名額有限，請把握機會...',
    author: '招募資訊',
    created_date: '2024/1/12',
    is_active: 'ACTIVE'
  }
];

export async function GET(request) {
  try {
    // 只返回活躍的公告，按日期排序（最新的在前）
    const activeAnnouncements = announcements
      .filter(announcement => announcement.is_active === 'ACTIVE')
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

    return NextResponse.json({
      success: true,
      data: activeAnnouncements
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}