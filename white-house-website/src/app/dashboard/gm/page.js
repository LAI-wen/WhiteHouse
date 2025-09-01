'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './gm.module.css';

export default function GMDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(session);
      if (!userData.isGM) {
        router.push('/dashboard');
        return;
      }
      setUser(userData);
      loadDashboardData();
    } catch (error) {
      console.error('Session parse error:', error);
      router.push('/login');
    }
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/gm/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        console.error('載入 GM 儀表板資料失敗:', data.error);
      }
    } catch (error) {
      console.error('API 錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return <div className={styles.loading}>載入中...</div>;
  }

  return (
    <div className={styles.gmDashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>🎮 GM 控制台</h1>
        <p className={styles.subtitle}>歡迎回來，{user.characterName}</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👥</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{dashboardData?.totalPlayers || 0}</div>
            <div className={styles.statLabel}>註冊玩家</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🎭</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{dashboardData?.totalCampaigns || 0}</div>
            <div className={styles.statLabel}>事件戰役</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⚡</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{dashboardData?.activeCampaigns || 0}</div>
            <div className={styles.statLabel}>進行中戰役</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{dashboardData?.completedCampaigns || 0}</div>
            <div className={styles.statLabel}>已完成戰役</div>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>快速操作</h2>
        <div className={styles.actionGrid}>
          <a href="/dashboard/gm/campaigns" className={styles.actionCard}>
            <div className={styles.actionIcon}>🎭</div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>戰役管理</h3>
              <p className={styles.actionDesc}>創建、編輯和管理事件戰役</p>
            </div>
          </a>

          <a href="/dashboard/gm/players" className={styles.actionCard}>
            <div className={styles.actionIcon}>👥</div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>玩家管理</h3>
              <p className={styles.actionDesc}>查看玩家資料和進度</p>
            </div>
          </a>

          <a href="/dashboard/gm/statistics" className={styles.actionCard}>
            <div className={styles.actionIcon}>📊</div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>數據統計</h3>
              <p className={styles.actionDesc}>遊戲數據和統計報告</p>
            </div>
          </a>

          <a href="/dashboard/campaigns" className={styles.actionCard}>
            <div className={styles.actionIcon}>🎮</div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>體驗戰役</h3>
              <p className={styles.actionDesc}>以玩家身份體驗戰役</p>
            </div>
          </a>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2 className={styles.sectionTitle}>最近活動</h2>
        <div className={styles.activityList}>
          {dashboardData?.recentActivities?.length > 0 ? (
            dashboardData.recentActivities.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <div className={styles.activityTime}>
                  {new Date(activity.timestamp).toLocaleString('zh-TW')}
                </div>
                <div className={styles.activityContent}>
                  <strong>{activity.playerName}</strong> {activity.action}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noActivity}>暫無最近活動</div>
          )}
        </div>
      </div>
    </div>
  );
}