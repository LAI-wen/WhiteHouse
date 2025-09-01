'use client';

import { useState, useEffect } from 'react';
import styles from './inventory.module.css';

export default function InventoryPage() {
  const [user, setUser] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const session = localStorage.getItem('userSession');
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
        loadInventoryData(userData.characterId);
      } catch (error) {
        console.error('Session parse error:', error);
      }
    }
  }, []);

  const loadInventoryData = async (characterId) => {
    try {
      const response = await fetch(`/api/dashboard/inventory?characterId=${characterId}`);
      const data = await response.json();
      
      if (data.success) {
        setInventoryData(data.data);
      } else {
        console.error('載入物品資料失敗:', data.error);
      }
    } catch (error) {
      console.error('API 錯誤:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user || !inventoryData) {
    return <div className={styles.loading}>載入中...</div>;
  }

  const renderItemCard = (item) => (
    <div key={item.itemId} className={`${styles.itemCard} ${item.isClue ? styles.clueItem : ''}`}>
      <div className={styles.itemHeader}>
        <h3 className={styles.itemName}>{item.itemName}</h3>
        <div className={styles.itemMeta}>
          {item.quantity > 1 && (
            <span className={styles.quantity}>×{item.quantity}</span>
          )}
          {item.isClue && (
            <span className={styles.clueIcon}>🔍</span>
          )}
        </div>
      </div>
      
      <p className={styles.itemDescription}>{item.description}</p>
      
      {item.specialEffect && (
        <div className={styles.specialEffect}>
          <strong>特殊效果:</strong> {item.specialEffect}
        </div>
      )}
      
      <div className={styles.itemFooter}>
        <div className={styles.obtainInfo}>
          <small className={styles.obtainDate}>
            獲得時間: {new Date(item.obtainedDate).toLocaleDateString('zh-TW')}
          </small>
          {item.obtainedMethod && (
            <small className={styles.obtainMethod}>
              獲得方式: {item.obtainedMethod}
            </small>
          )}
        </div>
        <span className={styles.category}>{item.category}</span>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>持有物品</h1>
        
        {/* 調查員線索過濾器 */}
        {user?.trueFaction === '調查員' && (
          <div className={styles.investigatorControls}>
            <label className={styles.clueToggle}>
              <input
                type="checkbox"
                checked={activeTab === 'clues'}
                onChange={(e) => setActiveTab(e.target.checked ? 'clues' : 'general')}
              />
              只顯示線索物品
            </label>
          </div>
        )}
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('general')}
        >
          一般物品 ({inventoryData.generalItems.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'key' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('key')}
        >
          關鍵物品 ({inventoryData.keyItems.length})
        </button>
        {user.trueFaction === '調查員' && (
          <button 
            className={`${styles.tab} ${activeTab === 'clues' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('clues')}
          >
            線索物品 ({[...inventoryData.generalItems, ...inventoryData.keyItems].filter(item => item.isClue).length})
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.summary}>
          <span className={styles.summaryText}>
            總共持有 {inventoryData.totalItems} 個物品
          </span>
          {activeTab === 'clues' && (
            <span className={styles.clueNote}>
              🔍 以下物品可能包含重要線索
            </span>
          )}
        </div>

        <div className={styles.itemsGrid}>
          {activeTab === 'general' && inventoryData.generalItems.map(renderItemCard)}
          {activeTab === 'key' && inventoryData.keyItems.map(renderItemCard)}
          {activeTab === 'clues' && 
            [...inventoryData.generalItems, ...inventoryData.keyItems]
              .filter(item => item.isClue)
              .map(renderItemCard)
          }
        </div>

        {((activeTab === 'general' && inventoryData.generalItems.length === 0) ||
          (activeTab === 'key' && inventoryData.keyItems.length === 0) ||
          (activeTab === 'clues' && [...inventoryData.generalItems, ...inventoryData.keyItems].filter(item => item.isClue).length === 0)) && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📦</div>
            <p className={styles.emptyText}>
              {activeTab === 'general' && '目前沒有一般物品'}
              {activeTab === 'key' && '目前沒有關鍵物品'}
              {activeTab === 'clues' && '目前沒有線索物品'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}