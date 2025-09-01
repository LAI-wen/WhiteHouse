'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(session);
      setUser(userData);
    } catch (error) {
      console.error('Session parse error:', error);
      router.push('/login');
      return;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('userSession');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('userSession');
      router.push('/');
    }
  };

  if (loading) {
    return <div className={styles.loading}>載入中...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* 頂部狀態列 */}
      <div className={styles.topBar}>
        <div className={styles.userInfo}>
          <span className={styles.userName}>{user.characterName}</span>
          <span className={styles.faction}>({user.publicFaction})</span>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>HP</span>
            <div className={styles.statBar}>
              <div 
                className={styles.statFill} 
                style={{ 
                  width: `${(user.hp / user.maxHp) * 100}%`,
                  backgroundColor: '#e74c3c'
                }}
              />
              <span className={styles.statText}>{user.hp}/{user.maxHp}</span>
            </div>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>SAN</span>
            <div className={styles.statBar}>
              <div 
                className={styles.statFill} 
                style={{ 
                  width: `${(user.san / user.maxSan) * 100}%`,
                  backgroundColor: '#3498db'
                }}
              />
              <span className={styles.statText}>{user.san}/{user.maxSan}</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          登出
        </button>
      </div>

      {/* 主要內容 */}
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <nav className={styles.nav}>
            <a href="/dashboard" className={styles.navLink}>
              儀表板總覽
            </a>
            {user.isGM ? (
              // GM 專用導航
              <>
                <div className={styles.sectionTitle}>🎮 GM 管理工具</div>
                <a href="/dashboard/gm" className={styles.navLink}>
                  GM 控制台
                </a>
                <a href="/dashboard/gm/campaigns" className={styles.navLink}>
                  戰役管理
                </a>
                <a href="/dashboard/gm/players" className={styles.navLink}>
                  玩家管理
                </a>
                <a href="/dashboard/gm/statistics" className={styles.navLink}>
                  數據統計
                </a>
                <div className={styles.sectionTitle}>📖 內容管理</div>
                <a href="/dashboard/campaigns" className={styles.navLink}>
                  🎭 事件戰役
                </a>
              </>
            ) : (
              // 玩家專用導航
              <>
                <a href="/dashboard/profile" className={styles.navLink}>
                  個人檔案
                </a>
                <a href="/dashboard/inventory" className={styles.navLink}>
                  持有物品
                </a>
                <a href="/dashboard/quests" className={styles.navLink}>
                  任務日誌
                </a>
                <a href="/dashboard/campaigns" className={styles.navLink}>
                  🎭 事件戰役
                </a>
                <a href="/dashboard/events" className={styles.navLink}>
                  互動事件 (舊版)
                </a>
                <a href="/dashboard/handbook" className={styles.navLink}>
                  個人手冊
                </a>
              </>
            )}
          </nav>
        </div>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}