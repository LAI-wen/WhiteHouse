import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: '登出成功'
    });

    // 清除 session cookies (如果有使用的話)
    response.cookies.delete('session');
    
    return response;
  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json(
      { success: false, error: '登出失敗' },
      { status: 500 }
    );
  }
}