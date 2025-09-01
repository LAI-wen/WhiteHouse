'use client';

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    quests: null,
    inventory: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
        loadDashboardData(userData.characterId);
      } catch (error) {
        console.error('Session parse error:', error);
      }
    }
  }, []);

  const loadDashboardData = async (characterId) => {
    try {
      const questsResponse = await fetch(`/api/dashboard/quests?characterId=${characterId}`);
      const questsData = await questsResponse.json();

      const inventoryResponse = await fetch(`/api/dashboard/inventory?characterId=${characterId}`);
      const inventoryData = await inventoryResponse.json();

      setDashboardData({
        quests: questsData.success ? questsData.data : null,
        inventory: inventoryData.success ? inventoryData.data : null
      });
    } catch (error) {
      console.error('載入儀表板資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return <div className={styles.loading}>載入中...</div>;
  }

  return (
    <>
      <h1 className={styles.title}>儀表板總覽</h1>
      
      <div className={styles.grid}>
        {/* 角色狀態卡片 */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>角色狀態</h2>
          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>AP (行動點)</span>
              <span className={styles.statusValue}>{user.ap}</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>BP (提問點)</span>
              <span className={styles.statusValue}>{user.bp}</span>
            </div>
          </div>
        </div>

        {/* 任務速覽卡片 */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>任務速覽</h2>
          {dashboardData.quests ? (
            <div className={styles.questSummary}>
              <div className={styles.questStats}>
                <span className={styles.questStat}>
                  進行中: <strong>{dashboardData.quests.stats.active}</strong>
                </span>
                <span className={styles.questStat}>
                  已完成: <strong>{dashboardData.quests.stats.completed}</strong>
                </span>
              </div>
              {dashboardData.quests.activeQuests.length > 0 && (
                <div className={styles.currentQuest}>
                  <strong>當前任務:</strong> {dashboardData.quests.activeQuests[0].title}
                </div>
              )}
            </div>
          ) : (
            <p className={styles.placeholder}>載入中...</p>
          )}
          <a href="/dashboard/quests" className={styles.cardLink}>
            查看所有任務 →
          </a>
        </div>

        {/* 陣營專屬模組 */}
        <div className={`${styles.card} ${styles.factionCard}`}>
          <h2 className={styles.cardTitle}>
            {user.publicFaction === '孩童' ? '好寶寶集點' : '績效系統'}
          </h2>
          <div className={styles.factionContent}>
            {user.publicFaction === '孩童' ? (
              <div className={styles.factionInfo}>
                <p>🌟 好寶寶集點數：<strong>{user.goodBoyPoints || 0}</strong></p>
                <small>完成任務和良好表現可以獲得點數</small>
                {dashboardData.inventory && (
                  <p>📦 持有物品：<strong>{dashboardData.inventory.totalItems}</strong> 個</p>
                )}
              </div>
            ) : (
              <div className={styles.factionInfo}>
                <p>⚡ 績效點數：<strong>{user.performancePoints || 0}</strong></p>
                <small>協助維護秩序可以提升績效</small>
                {dashboardData.inventory && (
                  <p>📦 持有物品：<strong>{dashboardData.inventory.totalItems}</strong> 個</p>
                )}
              </div>
            )}
          </div>
          
          {/* 調查員特殊區塊 */}
          {user.trueFaction === '調查員' && (
            <div className={styles.secretArea}>
              <button className={styles.secretBtn}>🔍 調查筆記</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}