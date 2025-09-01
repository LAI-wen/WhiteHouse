'use client';

import { useState, useEffect } from 'react';
import styles from './quests.module.css';

export default function QuestsPage() {
  const [user, setUser] = useState(null);
  const [questsData, setQuestsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('main');
  const [expandedQuests, setExpandedQuests] = useState(new Set());

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
        loadQuestsData(userData.characterId);
      } catch (error) {
        console.error('Session parse error:', error);
      }
    }
  }, []);

  const loadQuestsData = async (characterId) => {
    try {
      const response = await fetch(`/api/dashboard/quests?characterId=${characterId}`);
      const data = await response.json();
      
      if (data.success) {
        setQuestsData(data.data);
      } else {
        console.error('載入任務資料失敗:', data.error);
      }
    } catch (error) {
      console.error('API 錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestExpanded = (questId) => {
    const newExpanded = new Set(expandedQuests);
    if (newExpanded.has(questId)) {
      newExpanded.delete(questId);
    } else {
      newExpanded.add(questId);
    }
    setExpandedQuests(newExpanded);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      '進行中': { className: styles.statusActive, text: '進行中' },
      '已完成': { className: styles.statusCompleted, text: '✓ 已完成' },
      '暫停': { className: styles.statusPaused, text: '暫停' },
      '失敗': { className: styles.statusFailed, text: '失敗' }
    };

    const config = statusConfig[status] || statusConfig['進行中'];
    return (
      <span className={`${styles.status} ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const renderQuestCard = (quest) => {
    const isExpanded = expandedQuests.has(quest.questId);
    
    return (
      <div key={quest.questId} className={`${styles.questCard} ${quest.status === '已完成' ? styles.completedQuest : ''}`}>
        <div className={styles.questHeader} onClick={() => toggleQuestExpanded(quest.questId)}>
          <div className={styles.questTitle}>
            <h3 className={styles.questName}>{quest.title}</h3>
            <div className={styles.questMeta}>
              {getStatusBadge(quest.status)}
              <span className={styles.questType}>{quest.type}</span>
            </div>
          </div>
          <button className={`${styles.expandBtn} ${isExpanded ? styles.expanded : ''}`}>
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>

        {isExpanded && (
          <div className={styles.questContent}>
            <div className={styles.questDescription}>
              <p>{quest.description}</p>
            </div>
            
            <div className={styles.questFooter}>
              <div className={styles.questDetails}>
                <small className={styles.questDate}>
                  創建時間: {new Date(quest.createdDate).toLocaleDateString('zh-TW')}
                </small>
                <small className={styles.questId}>
                  任務ID: {quest.questId}
                </small>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading || !user || !questsData) {
    return <div className={styles.loading}>載入中...</div>;
  }

  const getCurrentQuests = () => {
    switch (activeTab) {
      case 'main': return questsData.mainQuests;
      case 'side': return questsData.sideQuests;
      case 'active': return questsData.activeQuests;
      case 'completed': return questsData.completedQuests;
      default: return [];
    }
  };

  const currentQuests = getCurrentQuests();

  return (
    <>
      <h1 className={styles.title}>任務日誌</h1>

      {/* 統計資訊 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{questsData.stats.total}</span>
          <span className={styles.statLabel}>總任務</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{questsData.stats.active}</span>
          <span className={styles.statLabel}>進行中</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{questsData.stats.completed}</span>
          <span className={styles.statLabel}>已完成</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{questsData.stats.mainLine}</span>
          <span className={styles.statLabel}>主線</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>{questsData.stats.sideLine}</span>
          <span className={styles.statLabel}>支線</span>
        </div>
      </div>

      {/* 分頁 */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'main' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('main')}
        >
          主線任務 ({questsData.mainQuests.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'side' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('side')}
        >
          支線任務 ({questsData.sideQuests.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'active' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('active')}
        >
          進行中 ({questsData.activeQuests.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'completed' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          已完成 ({questsData.completedQuests.length})
        </button>
      </div>

      {/* 任務內容 */}
      <div className={styles.content}>
        {currentQuests.length > 0 ? (
          <div className={styles.questsList}>
            {currentQuests.map(renderQuestCard)}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <p className={styles.emptyText}>
              {activeTab === 'main' && '目前沒有主線任務'}
              {activeTab === 'side' && '目前沒有支線任務'}
              {activeTab === 'active' && '目前沒有進行中的任務'}
              {activeTab === 'completed' && '目前沒有已完成的任務'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}